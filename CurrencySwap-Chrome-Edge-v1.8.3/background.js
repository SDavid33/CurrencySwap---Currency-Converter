// background.js - CurrencySwap v1.8.3
const RATES_CACHE_KEY = 'currencyRates';
const RATES_TIMESTAMP_KEY = 'ratesTimestamp';
const CACHE_DURATION_MS = 60 * 60 * 1000;
const API_URL = 'https://open.er-api.com/v6/latest/EUR';
const DEFAULT_TARGET = 'HUF';
const POPUP_PATH = 'popup.html';
const TOGGLE_MENU_ID = 'toggle-one-click';
const OPEN_SETTINGS_MENU_ID = 'open-settings';

function isUnsupportedUrl(url = '') {
  return url.startsWith('chrome://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('chrome-extension://');
}

async function fetchRates() {
  try {
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error('API error ' + resp.status);
    const data = await resp.json();
    if (data.result !== 'success') throw new Error('Bad API response');
    await chrome.storage.local.set({
      [RATES_CACHE_KEY]: data.rates,
      [RATES_TIMESTAMP_KEY]: Date.now()
    });
    return data.rates;
  } catch (e) {
    console.warn('[CurrencySwap] Rate fetch failed:', e);
    return null;
  }
}

async function getRates() {
  const stored = await chrome.storage.local.get([RATES_CACHE_KEY, RATES_TIMESTAMP_KEY]);
  const ts = stored[RATES_TIMESTAMP_KEY] || 0;
  if (stored[RATES_CACHE_KEY] && (Date.now() - ts < CACHE_DURATION_MS)) {
    return stored[RATES_CACHE_KEY];
  }
  return await fetchRates();
}

function sendToTab(tabId, msg) {
  return new Promise(resolve => {
    chrome.tabs.sendMessage(tabId, msg, resp => {
      if (!chrome.runtime.lastError) {
        resolve(resp);
        return;
      }

      chrome.scripting.executeScript(
        { target: { tabId }, files: ['content.js'] },
        () => {
          if (chrome.runtime.lastError) {
            resolve(null);
            return;
          }

          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, msg, resp2 => {
              resolve(chrome.runtime.lastError ? null : resp2);
            });
          }, 300);
        }
      );
    });
  });
}

async function runOneClickToggle(tab) {
  if (!tab?.id || isUnsupportedUrl(tab.url || '')) return;

  const cfg = await chrome.storage.local.get(['targetCurrency']);
  const currency = cfg.targetCurrency || DEFAULT_TARGET;
  const status = await sendToTab(tab.id, { type: 'STATUS' });

  if (status?.converted) {
    await sendToTab(tab.id, { type: 'REVERT' });
    return;
  }

  await sendToTab(tab.id, { type: 'CONVERT', currency });
}

async function syncActionPopup() {
  const cfg = await chrome.storage.local.get(['oneClickConvert']);
  const oneClick = !!cfg.oneClickConvert;
  await chrome.action.setPopup({ popup: oneClick ? '' : POPUP_PATH });
  await updateContextMenu(oneClick);
}

async function updateContextMenu(oneClick) {
  if (!chrome.contextMenus) return;
  chrome.contextMenus.update(
    OPEN_SETTINGS_MENU_ID,
    { title: 'Open CurrencySwap settings' },
    () => {
      if (chrome.runtime.lastError) {
        chrome.contextMenus.create({
          id: OPEN_SETTINGS_MENU_ID,
          title: 'Open CurrencySwap settings',
          contexts: ['action']
        });
      }
    }
  );

  chrome.contextMenus.update(
    TOGGLE_MENU_ID,
    { title: oneClick ? 'Disable convert on icon click' : 'Enable convert on icon click' },
    () => {
      if (chrome.runtime.lastError) {
        chrome.contextMenus.create({
          id: TOGGLE_MENU_ID,
          title: oneClick ? 'Disable convert on icon click' : 'Enable convert on icon click',
          contexts: ['action']
        });
      }
    }
  );
}

function openSettingsWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL(POPUP_PATH),
    type: 'popup',
    width: 340,
    height: 620,
    focused: true
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_RATES') {
    getRates().then(rates => sendResponse({ rates }));
    return true;
  }

  if (msg.type === 'FORCE_REFRESH') {
    fetchRates().then(rates => sendResponse({ rates }));
    return true;
  }

  if (msg.type === 'SYNC_ACTION_POPUP') {
    syncActionPopup().then(() => sendResponse({ ok: true }));
    return true;
  }
});

chrome.action.onClicked.addListener(tab => {
  runOneClickToggle(tab);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.oneClickConvert) {
    syncActionPopup();
  }
});

chrome.contextMenus?.onClicked.addListener(async info => {
  if (info.menuItemId === OPEN_SETTINGS_MENU_ID) {
    openSettingsWindow();
    return;
  }

  if (info.menuItemId !== TOGGLE_MENU_ID) return;
  const cfg = await chrome.storage.local.get(['oneClickConvert']);
  await chrome.storage.local.set({ oneClickConvert: !cfg.oneClickConvert });
});

chrome.runtime.onInstalled.addListener(() => {
  fetchRates();
  syncActionPopup();
});

chrome.runtime.onStartup.addListener(() => {
  syncActionPopup();
});

syncActionPopup();
