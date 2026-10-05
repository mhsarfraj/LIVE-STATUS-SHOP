# Jain Auto Parts & Service Centre — Live Status Website

A customer website + owner admin panel backed by Google Sheets / Google Apps Script.

## Included
- `index.html` — customer-facing live status site
- `admin.html` — owner login + status control panel
- `Code.gs` — Google Apps Script backend
- `config.js` — paste your deployed Apps Script URL here
- `styles.css`, `app.js`, `admin.css`, `admin.js`
- `assets/` — selected vehicle assets reused from the supplied `newcars.zip`

## Google Sheets setup
1. Create a new Google Sheet.
2. Open **Extensions → Apps Script**.
3. Replace the default code with `Code.gs`.
4. Save, then run `setup()` once and authorize it.
5. The script creates two tabs: `Owners` and `Status`.
6. In `Owners`, change the sample `userId`, `password`, phone, address, map URL and hours.
7. Deploy → **New deployment** → Web app.
8. Execute as **Me** and set access to **Anyone**.
9. Copy the Web app URL into `config.js` as `API_URL`.
10. Upload the website files to GitHub Pages, Netlify, or another static host.

## Owner controls
- OPEN NOW
- CLOSE SHOP
- ON BREAK
- Custom `Keep open until`
- Custom `Next opening time`
- Today's hours
- Customer message

The customer page polls the backend every 30 seconds and shows a countdown when an opening/closing time is supplied.

## Important security note
The requested simple version stores the owner password in the `Owners` sheet. This is convenient but **not recommended for a public production system**. For production, replace this with hashed passwords and/or Google account authentication, plus rate limiting and stronger session handling.

## Local preview
Because the customer site is static, you can serve this folder with any local HTTP server. Do not open the HTML with `file://` if you later add API integrations.
