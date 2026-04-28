# CurrencySwap - Currency Converter

**CurrencySwap** is a lightweight browser extension that converts prices directly on websites. It can convert currencies manually from the popup, automatically when pages load, or with a single toolbar icon click.

The extension is built for everyday browsing, shopping pages, marketplace listings, game-key stores, and any website where prices are shown as normal page text.

> Current version: **1.8.3**

---

## Features

### Automatic currency conversion on websites

CurrencySwap scans the current page for prices and converts detected amounts into your selected target currency. It works on many common price formats, including:

- `€12.99`
- `$12.99`
- `12.99 EUR`
- `EUR 12.99`
- `1 299 Ft`
- `5,00 EUR`
- `R$59.90`
- `A$20.00`
- `HK$80.00`
- `S$15.00`

### Manual conversion from the popup

Open the extension popup, choose a target currency, and press **Convert**. CurrencySwap will convert prices on the active page without changing your browser settings or the website itself.

### Restore original prices

After conversion, you can press **Restore** to bring the original page prices back. This is useful when you want to compare the converted value with the original currency.

### Convert on icon click

CurrencySwap includes an optional one-click mode:

- Left-click the toolbar icon once to convert the page.
- Click it again to restore the original prices.

When this mode is enabled, the popup will not open on left click. You can use the right-click extension menu to open the settings window or disable one-click mode.

### Automatic conversion mode

When **Automatic conversion** is enabled, CurrencySwap converts prices automatically when pages load. This is useful if you always want to see prices in your preferred currency.

### Quick target buttons

The popup includes quick conversion buttons for common target currencies:

- HUF
- EUR
- USD
- GBP
- CHF
- CZK

### Exchange rate refresh

CurrencySwap loads exchange rates from `open.er-api.com` and caches them for one hour. You can manually refresh rates from the popup by clicking the rate badge.

### Dynamic page support

Many modern websites load prices after the page has already opened. CurrencySwap uses a page observer to detect newly added price elements and convert them after the initial conversion.

### Structured price support

CurrencySwap supports regular text prices and several structured price layouts where the price is split across multiple HTML elements.

This includes layouts such as:

```html
<span>11.29</span>
<span>EUR</span>
```

Version **1.8.3** improves support for websites where the currency code is rendered separately from the number, including layouts where the currency appears smaller, aligned higher, or positioned beside the amount.

### Amazon-style price support

CurrencySwap includes special handling for Amazon-style price structures such as:

- `.a-price`
- `.a-price-symbol`
- `.a-price-whole`
- `.a-price-fraction`
- `.a-offscreen`

This helps the extension convert prices even when the visible price is split into symbol, whole amount, and fraction elements.

---

## Supported target currencies

CurrencySwap currently includes popup support for these target currencies:

| Code | Currency |
|---|---|
| HUF | Hungarian Forint |
| EUR | Euro |
| USD | US Dollar |
| GBP | British Pound |
| CHF | Swiss Franc |
| CZK | Czech Koruna |
| PLN | Polish Zloty |
| RON | Romanian Leu |
| SEK | Swedish Krona |
| NOK | Norwegian Krone |
| DKK | Danish Krone |
| JPY | Japanese Yen |
| CNY | Chinese Yuan |
| RUB | Russian Ruble |
| TRY | Turkish Lira |
| INR | Indian Rupee |
| BRL | Brazilian Real |
| AUD | Australian Dollar |
| CAD | Canadian Dollar |
| HKD | Hong Kong Dollar |

CurrencySwap can also detect several common currency symbols and ISO currency codes on pages, including:

`USD`, `EUR`, `GBP`, `JPY`, `INR`, `RUB`, `KRW`, `TRY`, `HUF`, `CZK`, `PLN`, `SEK`, `NOK`, `DKK`, `CHF`, `BRL`, `AUD`, `CAD`, `HKD`, `NZD`, `AED`, `SGD`, `CNY`, `UAH`, `RON`, `BGN`, `HRK`, `ISK`, `MXN`, and `ZAR`.

---

## How it works

CurrencySwap reads visible text and price-related HTML elements on the current page. When it finds a price, it:

1. Detects the original currency.
2. Parses the number format.
3. Converts the amount using cached exchange rates.
4. Replaces the visible price with the selected target currency.
5. Stores the original value so it can be restored later.

The extension does not permanently edit websites. Changes only happen locally in your browser tab.

---

## Installation

### Chrome / Microsoft Edge

1. Download or clone the extension files.
2. Open `chrome://extensions/` or `edge://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the extension folder.
6. Pin CurrencySwap to your toolbar if you want quick access.

### Firefox temporary installation

1. Open `about:debugging`.
2. Click **This Firefox**.
3. Click **Load Temporary Add-on**.
4. Select the extension's `manifest.json` file.

For permanent Firefox installation, the extension must be packaged and signed through Mozilla Add-ons.

---

## Usage

### Convert manually

1. Open a website with prices.
2. Click the CurrencySwap toolbar icon.
3. Select your target currency.
4. Press **Convert**.

### Restore original prices

1. Open the CurrencySwap popup.
2. Press **Restore**.

### Enable automatic conversion

1. Open the CurrencySwap popup.
2. Enable **Automatic conversion**.
3. Reload or open a page with prices.

### Enable one-click conversion

1. Open the CurrencySwap popup.
2. Enable **Convert on icon click**.
3. Left-click the toolbar icon to convert the active page.
4. Left-click the toolbar icon again to restore original prices.

To open the popup while one-click mode is active, right-click the CurrencySwap toolbar icon and choose **Open CurrencySwap settings**.

---

## Permissions

CurrencySwap uses the following permissions:

| Permission | Why it is needed |
|---|---|
| `storage` | Saves your selected target currency, toggle settings, and cached exchange rates. |
| `activeTab` | Allows the extension to work on the current tab when you use it. |
| `scripting` | Injects the content script when needed. |
| `contextMenus` | Adds right-click toolbar options for one-click mode and settings. |
| `<all_urls>` | Allows CurrencySwap to detect and convert prices on websites. |

---

## Privacy

CurrencySwap does not require an account and does not collect personal data.

The extension only stores local settings in your browser, such as:

- selected target currency
- automatic conversion setting
- one-click conversion setting
- cached exchange rates
- exchange rate cache timestamp

Exchange rates are requested from `open.er-api.com`. Website page content is processed locally in the browser tab for price conversion.

---

## Limitations

CurrencySwap works best when prices are rendered as normal text or readable HTML elements.

Some prices may not be converted if they are:

- rendered as images
- drawn inside canvas elements
- inserted through CSS generated content
- hidden inside complex scripts
- blocked by browser extension restrictions
- located on browser internal pages such as `chrome://`, `edge://`, or `about:` pages

The extension may also skip elements that look unsafe to rewrite, such as inputs, textareas, code blocks, SVG elements, and editable fields.

---

## Version history

### 1.8.3

- Added support for separated currency layouts where the currency code is rendered in a separate element from the numeric amount.
- Improved conversion on layouts where currency codes such as `EUR`, `USD`, or `GBP` appear smaller, raised, or positioned separately beside the price.

### 1.8.1 and earlier

- Manual page conversion.
- Restore original prices.
- Automatic conversion mode.
- Convert on icon click mode.
- Exchange rate caching.
- Quick target buttons.
- Amazon-style structured price detection.
- Support for common currency symbols and ISO currency codes.

---

## Project status

CurrencySwap is actively maintained and focused on practical website price conversion. If a website uses a new layout that does not convert correctly, please report it with a screenshot and, if possible, a small HTML example from the page inspector.

---

## Screenshots

Add screenshots here.

Recommended screenshots:

1. Extension popup.
2. Manual conversion example.
3. Automatic conversion example.
4. Separated currency layout conversion example.
5. Restore original prices example.

```md
![CurrencySwap popup](screenshots/popup.png)
![Converted prices example](screenshots/converted-prices.png)
```

---

## Support

Add support information here.

Suggested support section:

- GitHub Issues: `https://github.com/YOUR_USERNAME/YOUR_REPOSITORY/issues`
- Store page: `Add Microsoft Edge Add-ons / Firefox Add-ons link here`
- Contact: `Add your preferred contact method here`

When reporting a problem, please include:

1. Browser name and version.
2. CurrencySwap version.
3. Website where the issue happens.
4. Target currency used.
5. Screenshot of the price before and after conversion.
6. If possible, the inspected HTML around the price.
