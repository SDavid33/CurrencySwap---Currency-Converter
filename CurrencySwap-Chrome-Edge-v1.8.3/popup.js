// popup.js - CurrencySwap v1.8.3

const targetSel = document.getElementById('targetCurrency');
const convertBtn = document.getElementById('convertBtn');
const revertBtn = document.getElementById('revertBtn');
const autoToggle = document.getElementById('autoToggle');
const autoToggleRow = document.getElementById('autoToggleRow');
const oneClickToggle = document.getElementById('oneClickToggle');
const oneClickToggleRow = document.getElementById('oneClickToggleRow');
const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');
const rateBadge = document.getElementById('rateBadge');
const quickPairs = document.querySelectorAll('.quick-btn');

let autoConvert = false;
let oneClickConvert = false;
let isConverted = false;
let currentTabId = null;

function setStatus(msg, type = '') {
  statusBar.className = 'status-bar' + (type ? ' ' + type : '');
  statusText.textContent = msg;
}

function setConverted(val) {
  isConverted = val;
  revertBtn.disabled = !val;
  convertBtn.textContent = val ? 'Convert again' : 'Convert';
}

function isUnsupportedUrl(url) {
  return url.startsWith('chrome://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('chrome-extension://');
}

function sendToTab(tabId, msg, callback) {
  chrome.tabs.sendMessage(tabId, msg, (resp) => {
    if (chrome.runtime.lastError) {
      chrome.scripting.executeScript(
        { target: { tabId }, files: ['content.js'] },
        () => {
          if (chrome.runtime.lastError) {
            callback && callback(null, chrome.runtime.lastError.message);
            return;
          }

          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, msg, (resp2) => {
              callback && callback(resp2, chrome.runtime.lastError?.message);
            });
          }, 300);
        }
      );
    } else {
      callback && callback(resp, null);
    }
  });
}

function runConversion(currency, statusPrefix = 'Converting prices...') {
  if (!currentTabId) return;

  chrome.storage.local.set({ targetCurrency: currency });
  setStatus(statusPrefix, 'info');
  convertBtn.disabled = true;

  sendToTab(currentTabId, { type: 'CONVERT', currency }, (resp, err) => {
    convertBtn.disabled = false;
    if (err || !resp) {
      setStatus('Error: ' + (err || 'unknown'), 'error');
      return;
    }

    setConverted(true);
    setStatus(`Converted to ${currency}`, 'success');
  });
}

chrome.storage.local.get(['targetCurrency', 'autoConvert', 'oneClickConvert'], (cfg) => {
  if (cfg.targetCurrency) targetSel.value = cfg.targetCurrency;

  autoConvert = !!cfg.autoConvert;
  oneClickConvert = !!cfg.oneClickConvert;

  autoToggle.classList.toggle('on', autoConvert);
  oneClickToggle.classList.toggle('on', oneClickConvert);

});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]) return;
  currentTabId = tabs[0].id;

  const url = tabs[0].url || '';
  if (isUnsupportedUrl(url)) {
    setStatus('Browser internal pages are not supported', 'error');
    convertBtn.disabled = true;
    return;
  }

  sendToTab(currentTabId, { type: 'STATUS' }, (resp, err) => {
    if (err || !resp) {
      setStatus('Ready to convert', '');
      return;
    }

    if (resp.converted) {
      setConverted(true);
      setStatus(`Converted to ${resp.targetCurrency}`, 'success');
    } else {
      setStatus('Ready to convert', '');
    }
  });
});

convertBtn.addEventListener('click', () => {
  runConversion(targetSel.value);
});

revertBtn.addEventListener('click', () => {
  if (!currentTabId) return;
  sendToTab(currentTabId, { type: 'REVERT' }, () => {
    setConverted(false);
    setStatus('Original prices restored', '');
  });
});

autoToggleRow.addEventListener('click', () => {
  autoConvert = !autoConvert;
  autoToggle.classList.toggle('on', autoConvert);
  chrome.storage.local.set({ autoConvert });
  setStatus(autoConvert ? 'Automatic conversion enabled' : 'Automatic conversion disabled',
            autoConvert ? 'info' : '');
});

oneClickToggleRow.addEventListener('click', () => {
  oneClickConvert = !oneClickConvert;
  oneClickToggle.classList.toggle('on', oneClickConvert);
  chrome.storage.local.set({ oneClickConvert }, () => {
    chrome.runtime.sendMessage({ type: 'SYNC_ACTION_POPUP' });
  });
  setStatus(oneClickConvert ? 'Icon click conversion enabled' : 'Icon click conversion disabled',
            oneClickConvert ? 'info' : '');
});

targetSel.addEventListener('change', () => {
  chrome.storage.local.set({ targetCurrency: targetSel.value });
  if (isConverted) setStatus('Press Convert to use the new target', 'info');
});

quickPairs.forEach(btn => {
  btn.addEventListener('click', () => {
    targetSel.value = btn.dataset.to;
    runConversion(btn.dataset.to);
  });
});

rateBadge.addEventListener('click', () => {
  rateBadge.textContent = 'REFRESHING';
  rateBadge.classList.add('loading');
  chrome.runtime.sendMessage({ type: 'FORCE_REFRESH' }, (resp) => {
    rateBadge.textContent = 'LIVE';
    rateBadge.classList.remove('loading');
    setStatus(resp?.rates ? 'Exchange rates refreshed' : 'Rate refresh failed',
              resp?.rates ? 'success' : 'error');
    if (resp?.rates) setTimeout(() => setStatus('Ready', ''), 2000);
  });
});
