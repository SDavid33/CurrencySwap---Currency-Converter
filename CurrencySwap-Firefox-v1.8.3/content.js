// content.js - CurrencySwap v1.8.3
(function () {
  'use strict';

  const SYMBOL_TO_CODE = {
    '€': 'EUR',
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
    '₽': 'RUB',
    '₩': 'KRW',
    '₺': 'TRY',
    '₴': 'UAH',
    'Ft': 'HUF',
    'Kč': 'CZK',
    'zł': 'PLN',
    'kr': 'SEK',
    'Fr': 'CHF',
    'R$': 'BRL',
    'A$': 'AUD',
    'C$': 'CAD',
    'HK$': 'HKD',
    'NZ$': 'NZD',
    'S$': 'SGD',
    'NT$': 'TWD',
    '฿': 'THB',
    '₱': 'PHP',
    'Rp': 'IDR',
    'RM': 'MYR',
    '₫': 'VND',
    '₪': 'ILS',
    'AED': 'AED',
    'SGD': 'SGD'
  };

  const CODE_TO_SYMBOL = {
    'HUF': 'Ft',
    'EUR': '€',
    'USD': '$',
    'GBP': '£',
    'JPY': '¥',
    'CZK': 'Kč',
    'PLN': 'zł',
    'CHF': 'Fr',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'RON': 'RON',
    'BGN': 'BGN',
    'RSD': 'RSD',
    'UAH': '₴',
    'ISK': 'ISK',
    'INR': '₹',
    'RUB': '₽',
    'KRW': '₩',
    'TRY': '₺',
    'CNY': '¥',
    'TWD': 'NT$',
    'HKD': 'HK$',
    'SGD': 'S$',
    'THB': '฿',
    'PHP': '₱',
    'MYR': 'RM',
    'IDR': 'Rp',
    'VND': '₫',
    'AUD': 'A$',
    'NZD': 'NZ$',
    'CAD': 'C$',
    'BRL': 'R$',
    'MXN': 'MXN',
    'ARS': 'ARS',
    'CLP': 'CLP',
    'COP': 'COP',
    'PEN': 'PEN',
    'AED': 'AED',
    'SAR': 'SAR',
    'QAR': 'QAR',
    'ILS': '₪',
    'ZAR': 'ZAR'
  };

  const KNOWN_ISO = new Set([
    'HUF',
    'EUR',
    'USD',
    'GBP',
    'CHF',
    'CZK',
    'PLN',
    'RON',
    'SEK',
    'NOK',
    'DKK',
    'BGN',
    'RSD',
    'UAH',
    'ISK',
    'JPY',
    'CNY',
    'KRW',
    'TWD',
    'HKD',
    'SGD',
    'THB',
    'PHP',
    'MYR',
    'IDR',
    'VND',
    'INR',
    'AUD',
    'NZD',
    'CAD',
    'BRL',
    'MXN',
    'ARS',
    'CLP',
    'COP',
    'PEN',
    'TRY',
    'RUB',
    'AED',
    'SAR',
    'QAR',
    'ILS',
    'ZAR'
  ]);

  const ISO_PATTERN = [...KNOWN_ISO].join('|');
  const SYMBOL_PATTERN = 'HK\$|NZ\$|NT\$|AED|SGD|R\$|A\$|C\$|S\$|€|\$|£|¥|₹|₽|₩|₺|₴|฿|₱|₫|₪';
  const POSTFIX_SYMBOL_PATTERN = '€|£|¥|₹|₽|₩|₺|₴|₫|Ft|Kč|zł|kr|Fr|Rp|RM|₪|AED|SGD';
  const NUMBER_PATTERN = '\\d[\\d\\s\\u00a0\\u202f\\u2009.,\\\']*\\d|\\d+';

  // Catches: $12.99, 12.99 EUR, EUR38.80, EUR 38.80, 1 299 Ft, 5,00 EUR.
  const CURRENCY_RE = new RegExp(
    '(?:' +
      '(' + SYMBOL_PATTERN + ')\\s*(' + NUMBER_PATTERN + ')' +
    '|' +
      '\\b(' + ISO_PATTERN + ')\\s*(' + NUMBER_PATTERN + ')' +
    '|' +
      '(' + NUMBER_PATTERN + ')\\s*(' + POSTFIX_SYMBOL_PATTERN + ')' +
    '|' +
      '(' + NUMBER_PATTERN + ')\\s*(' + ISO_PATTERN + ')\\b' +
    ')',
    'gi'
  );
  const EXACT_CURRENCY_RE = new RegExp('^\\s*' + CURRENCY_RE.source + '\\s*$', 'i');

  const SKIP_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','INPUT','CODE','PRE','SVG','MATH']);

  let rates = null;
  let targetCurrency = 'HUF';
  let autoConvert = false;
  let converted = false;

  const originals = new Map();
  const converteds = new Map();
  const structuredOriginals = new Map();

  let observer = null;
  let pendingNodes = [];
  let rafScheduled = false;
  let applyingOwnChanges = false;

  function normalizeSpaces(str) {
    return String(str || '').replace(/[\u00a0\u202f\u2009]/g, ' ').trim();
  }

  function normalizeCurrencyCode(code) {
    const upper = String(code || '').trim().toUpperCase();
    return KNOWN_ISO.has(upper) ? upper : null;
  }

  function currencyFromSymbol(symbol) {
    const cleaned = normalizeSpaces(symbol);
    return SYMBOL_TO_CODE[cleaned] || null;
  }

  function parseNum(str) {
    let s = normalizeSpaces(str);
    if (!s) return NaN;

    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    const hasComma = lastComma !== -1;
    const hasDot = lastDot !== -1;

    if (hasComma && hasDot) {
      if (lastComma > lastDot) {
        s = s.replace(/[\s.]/g, '').replace(',', '.');
      } else {
        s = s.replace(/[\s,]/g, '');
      }
    } else if (hasComma || hasDot) {
      const sep = hasComma ? ',' : '.';
      const parts = s.split(sep);
      const last = parts[parts.length - 1];
      const allThousands = parts.length > 1 && parts.slice(1).every(part => /^\d{3}$/.test(part));

      if (last.length === 3 && allThousands) {
        s = s.replace(/[.,\s]/g, '');
      } else if (sep === ',') {
        s = s.replace(/\s/g, '').replace(',', '.');
      } else {
        s = s.replace(/[\s,]/g, '');
      }
    } else {
      s = s.replace(/\s/g, '');
    }

    return parseFloat(s);
  }

  function convertAmount(amount, fromCode, toCode) {
    if (!rates || fromCode === toCode) return fromCode === toCode ? amount : null;
    const fromRate = rates[fromCode];
    const toRate = rates[toCode];
    if (!fromRate || !toRate) return null;
    return (amount / fromRate) * toRate;
  }

  function formatOut(amount, code) {
    const sym = CODE_TO_SYMBOL[code] || code;
    const noDecimals = ['HUF', 'JPY', 'KRW', 'CLP', 'VND', 'IDR'];
    const decimals = noDecimals.includes(code) ? 0 : 2;

    let numStr;
    if (code === 'HUF') {
      numStr = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      numStr = amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }

    const postfix = ['HUF','CZK','PLN','SEK','NOK','DKK','RON','BGN','RSD','ISK','IDR','VND'];
    return postfix.includes(code) ? `${numStr}\u00a0${sym}` : `${sym}${numStr}`;
  }

  function parseCurrencyMatch(text, exactOnly = false) {
    const re = exactOnly ? EXACT_CURRENCY_RE : CURRENCY_RE;
    re.lastIndex = 0;
    const match = re.exec(text);
    if (!match) return null;

    let fromCode = null;
    let numStr = null;

    if (match[1] && match[2]) {
      fromCode = currencyFromSymbol(match[1]);
      numStr = match[2];
    } else if (match[3] && match[4]) {
      fromCode = normalizeCurrencyCode(match[3]);
      numStr = match[4];
    } else if (match[5] && match[6]) {
      fromCode = currencyFromSymbol(match[6]);
      numStr = match[5];
    } else if (match[7] && match[8]) {
      fromCode = normalizeCurrencyCode(match[8]);
      numStr = match[7];
    }

    if (!fromCode || !numStr) return null;
    const amount = parseNum(numStr);
    if (!isFinite(amount) || amount <= 0) return null;
    return { fromCode, amount };
  }

  function countCurrencyMatches(text) {
    CURRENCY_RE.lastIndex = 0;
    let count = 0;
    while (CURRENCY_RE.exec(text)) {
      count += 1;
      if (count > 1) break;
    }
    return count;
  }

  function elementDepth(el) {
    let depth = 0;
    let node = el;
    while (node && node.parentElement) {
      depth += 1;
      node = node.parentElement;
    }
    return depth;
  }

  function hasDestructiveDescendants(el) {
    return !!el.querySelector?.('img,picture,source,video,canvas,iframe,object,embed,svg');
  }

  function nodeIsSkippable(node) {
    const p = node.parentElement;
    if (!p) return true;
    if (SKIP_TAGS.has(p.tagName)) return true;
    if (p.isContentEditable) return true;
    if (p.closest('[data-cs-structured-price="true"]')) return true;
    if (!node.textContent.trim()) return true;
    return false;
  }

  function processNode(node) {
    const text = node.textContent;
    if (!text || text.length < 2) return false;

    CURRENCY_RE.lastIndex = 0;
    let anyMatch = false;

    const newText = text.replace(CURRENCY_RE, (match,
      preSym, preNum,
      isoCode, isoNum,
      postNum, postSym,
      isoPostNum, isoPostCode
    ) => {
      const parsed = parseCurrencyMatch(match, true);
      if (!parsed || parsed.fromCode === targetCurrency) return match;

      const result = convertAmount(parsed.amount, parsed.fromCode, targetCurrency);
      if (result === null) return match;

      anyMatch = true;
      return formatOut(result, targetCurrency);
    });

    if (anyMatch) {
      if (!originals.has(node)) originals.set(node, text);
      converteds.set(node, newText);
      return true;
    }
    return false;
  }

  function walkAndProcess(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return nodeIsSkippable(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const hits = [];
    let n;
    while ((n = walker.nextNode())) {
      if (processNode(n)) hits.push(n);
    }
    return hits;
  }

  function parseAmazonPrice(priceEl) {
    const symbolEl = priceEl.querySelector('.a-price-symbol');
    const wholeEl = priceEl.querySelector('.a-price-whole');
    const fractionEl = priceEl.querySelector('.a-price-fraction');
    const offscreenEl = priceEl.querySelector('.a-offscreen');

    let fromCode = currencyFromSymbol(symbolEl?.textContent);
    let numberText = '';

    if (wholeEl) {
      numberText = normalizeSpaces(wholeEl.textContent).replace(/[^\d\s\u00a0\u202f\u2009.,']/g, '');
      const fraction = normalizeSpaces(fractionEl?.textContent).replace(/[^\d]/g, '');
      if (fraction) numberText += '.' + fraction;
    }

    if ((!fromCode || !numberText) && offscreenEl) {
      const text = normalizeSpaces(offscreenEl.textContent);
      const parsed = parseCurrencyMatch(text);
      if (parsed) {
        fromCode = parsed.fromCode;
        numberText = String(parsed.amount);
      }
    }

    if (!fromCode || !numberText) return null;
    const amount = parseNum(numberText);
    if (!isFinite(amount) || amount <= 0) return null;
    return { fromCode, amount };
  }

  function convertExactElementPrice(priceEl) {
    if (!priceEl || priceEl.dataset.csStructuredPrice === 'true') return false;
    if (SKIP_TAGS.has(priceEl.tagName) || priceEl.isContentEditable) return false;
    if (priceEl.closest('[data-cs-structured-price="true"]')) return false;
    if (priceEl.querySelector?.('[data-cs-structured-price="true"]')) return false;
    if (hasDestructiveDescendants(priceEl)) return false;

    const text = normalizeSpaces(priceEl.textContent);
    if (!text || text.length > 40) return false;
    if (countCurrencyMatches(text) !== 1) return false;

    const parsed = parseCurrencyMatch(text, true);
    if (!parsed || parsed.fromCode === targetCurrency) return false;

    const result = convertAmount(parsed.amount, parsed.fromCode, targetCurrency);
    if (result === null) return false;

    if (!structuredOriginals.has(priceEl)) {
      structuredOriginals.set(priceEl, {
        html: priceEl.innerHTML,
        ariaLabel: priceEl.getAttribute('aria-label')
      });
    }

    priceEl.dataset.csStructuredPrice = 'true';
    priceEl.setAttribute('aria-label', formatOut(result, targetCurrency));
    priceEl.textContent = formatOut(result, targetCurrency);
    return true;
  }

  function convertStructuredPrice(priceEl) {
    if (!priceEl || priceEl.dataset.csStructuredPrice === 'true') return false;

    const parsed = parseAmazonPrice(priceEl);
    if (!parsed || parsed.fromCode === targetCurrency) return false;

    const result = convertAmount(parsed.amount, parsed.fromCode, targetCurrency);
    if (result === null) return false;

    if (!structuredOriginals.has(priceEl)) {
      structuredOriginals.set(priceEl, {
        html: priceEl.innerHTML,
        ariaLabel: priceEl.getAttribute('aria-label')
      });
    }

    priceEl.dataset.csStructuredPrice = 'true';
    priceEl.setAttribute('aria-label', formatOut(result, targetCurrency));
    priceEl.textContent = formatOut(result, targetCurrency);
    return true;
  }

  function isLeafTextElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (SKIP_TAGS.has(el.tagName) || el.isContentEditable) return false;
    if (el.dataset.csStructuredPrice === 'true') return false;
    if (el.closest('[data-cs-structured-price="true"]')) return false;
    if (hasDestructiveDescendants(el)) return false;
    return !Array.from(el.children || []).some(child => normalizeSpaces(child.textContent));
  }

  function parsePlainNumberText(text) {
    const cleaned = normalizeSpaces(text);
    if (!/^\d[\d\s\u00a0\u202f\u2009.,']*$/.test(cleaned)) return null;
    const amount = parseNum(cleaned);
    return isFinite(amount) && amount > 0 ? amount : null;
  }

  function exactIsoText(el) {
    const text = normalizeSpaces(el?.textContent).toUpperCase();
    return KNOWN_ISO.has(text) ? text : null;
  }

  function elementDistance(a, b) {
    const ar = a.getBoundingClientRect?.();
    const br = b.getBoundingClientRect?.();
    if (!ar || !br) return Number.MAX_SAFE_INTEGER;
    const ax = ar.left + ar.width / 2;
    const ay = ar.top + ar.height / 2;
    const bx = br.left + br.width / 2;
    const by = br.top + br.height / 2;
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  function findNearbyNumberElement(currencyEl) {
    const parents = [];
    let p = currencyEl.parentElement;
    for (let i = 0; p && i < 4; i += 1, p = p.parentElement) {
      if (p.dataset?.csStructuredPrice === 'true') break;
      const txt = normalizeSpaces(p.textContent);
      if (txt.length <= 90) parents.push(p);
    }

    const candidates = [];
    parents.forEach(parent => {
      parent.querySelectorAll?.('*').forEach(el => {
        if (el === currencyEl) return;
        if (!isLeafTextElement(el)) return;
        const amount = parsePlainNumberText(el.textContent);
        if (amount === null) return;
        candidates.push({ el, amount, parent });
      });
    });

    if (!candidates.length) return null;

    candidates.sort((a, b) => {
      const depthDiff = elementDepth(a.parent) - elementDepth(b.parent);
      if (depthDiff !== 0) return depthDiff;
      return elementDistance(a.el, currencyEl) - elementDistance(b.el, currencyEl);
    });

    return candidates[0];
  }

  function convertSeparatedIsoPrices(root) {
    const scope = root.nodeType === Node.ELEMENT_NODE ? root : document.body;
    const currencyEls = [];

    if (isLeafTextElement(scope) && exactIsoText(scope)) currencyEls.push(scope);
    scope.querySelectorAll?.('*').forEach(el => {
      if (isLeafTextElement(el) && exactIsoText(el)) currencyEls.push(el);
    });

    let convertedAny = false;
    [...new Set(currencyEls)].forEach(currencyEl => {
      const fromCode = exactIsoText(currencyEl);
      if (!fromCode || fromCode === targetCurrency) return;

      const found = findNearbyNumberElement(currencyEl);
      if (!found) return;

      const result = convertAmount(found.amount, fromCode, targetCurrency);
      if (result === null) return;

      [found.el, currencyEl].forEach(el => {
        if (!structuredOriginals.has(el)) {
          structuredOriginals.set(el, {
            html: el.innerHTML,
            ariaLabel: el.getAttribute('aria-label'),
            title: el.getAttribute('title')
          });
        }
        el.dataset.csStructuredPrice = 'true';
      });

      found.el.setAttribute('aria-label', formatOut(result, targetCurrency));
      found.el.textContent = formatOut(result, targetCurrency);
      currencyEl.textContent = '';
      currencyEl.setAttribute('aria-hidden', 'true');
      convertedAny = true;
    });

    return convertedAny;
  }

  function processStructuredPrices(root) {
    const scope = root.nodeType === Node.ELEMENT_NODE ? root : document.body;
    const candidates = [];

    if (scope.matches && scope.matches('.a-price')) candidates.push(scope);
    scope.querySelectorAll?.('.a-price').forEach(el => candidates.push(el));

    let convertedAny = false;
    [...new Set(candidates)].forEach(el => {
      if (convertStructuredPrice(el)) convertedAny = true;
    });

    if (convertSeparatedIsoPrices(scope)) convertedAny = true;

    const exactCandidates = [];
    if (scope !== document.body) exactCandidates.push(scope);
    scope.querySelectorAll?.('*').forEach(el => exactCandidates.push(el));

    [...new Set(exactCandidates)]
      .sort((a, b) => elementDepth(b) - elementDepth(a))
      .forEach(el => {
      if (convertExactElementPrice(el)) convertedAny = true;
    });
    return convertedAny;
  }

  function applyTextConversions(hits) {
    applyingOwnChanges = true;
    try {
      hits.forEach(node => {
        if (node.isConnected) node.textContent = converteds.get(node);
      });
    } finally {
      applyingOwnChanges = false;
    }
  }

  function convertRoot(root) {
    if (!rates || !root) return;
    processStructuredPrices(root);
    const hits = walkAndProcess(root);
    applyTextConversions(hits);
  }

  function convertPage() {
    if (!rates) return;
    originals.clear();
    converteds.clear();
    structuredOriginals.clear();
    convertRoot(document.body);
    converted = true;
  }

  function revertPage() {
    applyingOwnChanges = true;
    try {
      originals.forEach((orig, node) => {
        if (node.isConnected) node.textContent = orig;
      });
      structuredOriginals.forEach((orig, el) => {
        if (el.isConnected) {
          el.innerHTML = orig.html;
          if (orig.ariaLabel === null) el.removeAttribute('aria-label');
          else el.setAttribute('aria-label', orig.ariaLabel);
          if (orig.title === null || orig.title === undefined) el.removeAttribute('title');
          else el.setAttribute('title', orig.title);
          el.removeAttribute('aria-hidden');
          delete el.dataset.csStructuredPrice;
        }
      });
    } finally {
      applyingOwnChanges = false;
    }

    originals.clear();
    converteds.clear();
    structuredOriginals.clear();
    converted = false;
    if (observer) { observer.disconnect(); observer = null; }
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      if (!converted || !rates || applyingOwnChanges) return;

      mutations.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType === Node.ELEMENT_NODE) pendingNodes.push(n);
          else if (n.nodeType === Node.TEXT_NODE) pendingNodes.push(n.parentElement || document.body);
        });

        if (m.type === 'characterData' && m.target.nodeType === Node.TEXT_NODE) {
          if (!converteds.has(m.target)) pendingNodes.push(m.target.parentElement || document.body);
        }
      });

      if (!rafScheduled && pendingNodes.length) {
        rafScheduled = true;
        requestAnimationFrame(() => {
          rafScheduled = false;
          const toProcess = [...new Set(pendingNodes)];
          pendingNodes = [];
          toProcess.forEach(el => {
            if (el && el.nodeType === Node.ELEMENT_NODE) convertRoot(el);
          });
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function init() {
    chrome.storage.local.get(['targetCurrency', 'autoConvert'], (cfg) => {
      targetCurrency = cfg.targetCurrency || 'HUF';
      autoConvert = cfg.autoConvert || false;

      chrome.runtime.sendMessage({ type: 'GET_RATES' }, (resp) => {
        if (resp && resp.rates) {
          rates = resp.rates;
          if (autoConvert) {
            convertPage();
            startObserver();
          }
        }
      });
    });
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'CONVERT') {
      targetCurrency = msg.currency;
      revertPage();
      if (rates) {
        convertPage();
        startObserver();
        sendResponse({ ok: true, converted: true });
      } else {
        chrome.runtime.sendMessage({ type: 'GET_RATES' }, (resp) => {
          if (resp && resp.rates) {
            rates = resp.rates;
            convertPage();
            startObserver();
          }
        });
        sendResponse({ ok: true, converted: false });
      }
      return true;
    }

    if (msg.type === 'REVERT') {
      revertPage();
      sendResponse({ ok: true });
      return true;
    }

    if (msg.type === 'STATUS') {
      sendResponse({ converted, targetCurrency });
      return true;
    }

    if (msg.type === 'RATES_UPDATED') {
      rates = msg.rates;
      return true;
    }
  });

  init();
})();
