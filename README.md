# CurrencySwap - Currency Converter

**CurrencySwap** is a lightweight browser extension that automatically converts prices on websites into your selected currency.

It is designed for shopping sites, digital stores, marketplaces, subscription pages, game stores, and other websites where prices are displayed in different currencies.

The extension works directly inside the page and can detect prices even when the currency code is displayed separately from the number.

---

## Features

- Automatically converts prices on websites
- Supports manual conversion from the extension popup
- Works on Chrome, Microsoft Edge, and Firefox
- Converts detected prices directly on the page
- Supports prices where the currency code is next to the number
- Supports layouts where the currency code is shown separately or in a smaller element
- Supports Amazon-style price layouts
- Remembers your selected target currency
- Lightweight and simple to use
- No account required

---

## How it works

CurrencySwap scans the current webpage for prices and supported currency codes.

For example:

```text
19.99 USD
```

can be converted into your selected target currency.

It also supports more complex layouts where the price and currency are separated, such as:

```html
<span>19.99</span>
<span>USD</span>
```

or layouts where the currency appears in a smaller element near the price.

---

## Supported currencies

CurrencySwap supports more than 40 currencies, including:

```text
USD - United States Dollar
EUR - Euro
GBP - British Pound
HUF - Hungarian Forint
JPY - Japanese Yen
CNY - Chinese Yuan
KRW - South Korean Won
AUD - Australian Dollar
CAD - Canadian Dollar
CHF - Swiss Franc
SEK - Swedish Krona
NOK - Norwegian Krone
DKK - Danish Krone
PLN - Polish Zloty
CZK - Czech Koruna
RON - Romanian Leu
BGN - Bulgarian Lev
TRY - Turkish Lira
UAH - Ukrainian Hryvnia
RSD - Serbian Dinar
BRL - Brazilian Real
MXN - Mexican Peso
ARS - Argentine Peso
CLP - Chilean Peso
COP - Colombian Peso
PEN - Peruvian Sol
INR - Indian Rupee
IDR - Indonesian Rupiah
THB - Thai Baht
PHP - Philippine Peso
MYR - Malaysian Ringgit
SGD - Singapore Dollar
VND - Vietnamese Dong
TWD - New Taiwan Dollar
HKD - Hong Kong Dollar
AED - United Arab Emirates Dirham
SAR - Saudi Riyal
QAR - Qatari Riyal
ILS - Israeli New Shekel
ZAR - South African Rand
NZD - New Zealand Dollar
```

...and more.

---

## Usage

1. Install the extension.
2. Click the CurrencySwap icon in your browser toolbar.
3. Select your preferred target currency.
4. Open or refresh a webpage with prices.
5. CurrencySwap will automatically convert supported prices on the page.

You can also use the popup for quick manual currency conversion.

---

## Browser support

CurrencySwap is available for:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

The Chrome/Edge version and the Firefox version are packaged separately because the browsers use slightly different extension formats.

---

## Installation

### Chrome / Edge

1. Download the Chrome/Edge ZIP release.
2. Extract the ZIP file.
3. Open your browser extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted CurrencySwap folder.

### Firefox

1. Download the Firefox ZIP release.
2. Extract the ZIP file.
3. Open `about:debugging`.
4. Click **This Firefox**.
5. Click **Load Temporary Add-on**.
6. Select the `manifest.json` file from the extracted folder.

For permanent Firefox installation, the extension should be installed through Mozilla Add-ons after publishing.

---

## Permissions

CurrencySwap may request access to webpages so it can detect and convert visible prices.

The extension uses these permissions only to scan page text for supported currency values and replace them with converted values.

CurrencySwap does not collect personal data, browsing history, login information, or payment information.

---

## Privacy

CurrencySwap is built to be simple and privacy-friendly.

- No account required
- No tracking
- No analytics
- No personal data collection
- No login data collection
- No payment data collection

The extension only processes visible price text on webpages for currency conversion.

---

## Limitations

CurrencySwap tries to detect prices across many different website layouts, but some websites may use unusual formatting, canvas rendering, images, shadow DOM, or heavily dynamic components.

In those cases, some prices may not be converted automatically.

If a website displays prices as images or inside protected elements, the extension may not be able to read or convert them.

---

## Version history

### v1.8.3

Expanded currency support with additional commonly used currencies, including KRW, TWD, THB, PHP, MYR, IDR, VND, ARS, CLP, COP, PEN, SAR, QAR, ILS, RSD, and more.

### v1.8.2

Added support for price layouts where the currency code is rendered separately from the numeric amount.

This improves detection on pages where currencies such as EUR, USD, GBP, and others appear in a separate smaller element next to the price.

---

## Screenshots

<img width="692" height="631" alt="image" src="https://github.com/user-attachments/assets/f195a010-0cfb-4975-b343-1d6947ce416f" />


<img width="1530" height="1632" alt="screenshot3" src="https://github.com/user-attachments/assets/57fa7cb5-344c-4872-9501-e5745aad17b1" />


---

## Limitations

CurrencySwap tries to detect prices across many different website layouts, but some websites may use unusual formatting, canvas rendering, images, shadow DOM, or heavily dynamic components.

In those cases, some prices may not be converted automatically.

If a website displays prices as images or inside protected elements, the extension may not be able to read or convert them.

---

## Version history

### v1.8.3

Expanded currency support with additional commonly used currencies, including KRW, TWD, THB, PHP, MYR, IDR, VND, ARS, CLP, COP, PEN, SAR, QAR, ILS, RSD, and more.

### v1.8.2

Added support for price layouts where the currency code is rendered separately from the numeric amount.

This improves detection on pages where currencies such as EUR, USD, GBP, and others appear in a separate smaller element next to the price.

---

## Sponsor

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/N4N0XO52O)
