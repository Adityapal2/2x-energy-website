# 2X Energy Batteries Manufacturer — Static Website

A responsive static ecommerce-style website built using plain HTML, CSS and vanilla JavaScript. No React, npm, build tools or frameworks are required.

## Preview on your computer
1. Extract `2X_Energy_Project.zip`.
2. Double-click `index.html` to open in a browser.
3. For the most reliable cart and navigation behaviour, open PowerShell in this directory and run `python -m http.server 8000`, then visit `http://localhost:8000`.

## Pages
- `index.html` — homepage
- `shop.html` — search, manufacturer and voltage selection, sorting and product grid
- `product.html?id=ev-48v-22ah` — dynamic product details (change ID to view another configuration)
- `cart.html` — persistent cart and WhatsApp order enquiry
- `about.html` — brand and product-selection approach
- `contact.html` — contact options, address and enquiry form


## Manufacturer browsing
- The homepage now includes a “Manufacturer” section. It shows 2X Energy because that is the brand confirmed by the provided catalogue, plus an enquiry route for customers asking about other manufacturers.
- The catalogue page has a manufacturer filter. Add additional verified manufacturers and product data in `js/products.js` before listing more brands.

## Editing products/contact data
Edit `js/products.js`. The store configuration is at the top; all catalogue products are in `window.PRODUCTS`. Product image paths point to local assets in `images/`.

## Brand and current contact settings
- Website brand line: **2X Energy Batteries Manufacturer**
- Domain supplied by owner: `https://2xenergy.store`
- Business email: `2xenergyy@gmail.com`
- Address: Plot no 335, Block N, Village-Luksar, Gautam Budh Nagar, Greater Noida
- Phone / WhatsApp currently set from supplied brand artwork: `+91 98119 37877` (confirm before launch)
- Brand logos: `images/2x-energy-logo.svg`, `images/2x-energy-logo-light.svg`, `images/favicon.svg`

## Payment status
UPI ID and QR were intentionally left pending because the owner will provide the correct payment details later. The cart's QR area says "QR code coming soon" and does not display a fake payment code. The site creates WhatsApp order enquiries, not verified paid orders.

## Image note
The current battery product images are consistent, premium illustrative renders, not exact photos of each individual SKU. Replace them with approved model-specific photography before launch if available.

## Launch checklist
Verify catalogue prices/specifications, phone number, domain DNS, availability, delivery, warranty/returns, and the UPI ID/QR before publishing.
## Product image branding

The official 2X Energy Batteries Manufacturer logo is printed directly into `images/battery-product-large.jpg`, `images/battery-product-compact.jpg`, and the hero battery scene. All 15 catalogue configurations use these branded product images. Branded SVG illustrations use the same vector logo. Original unbranded source JPGs are retained in `images/originals-unbranded/` for future edits. The logo is part of the image file itself; it is not just a website badge.

### Voltage-specific product images
- All 48V configurations use `images/battery-48v-2x-energy.jpg` (the image supplied for the 48V section).
- All 60V configurations use `images/battery-60v-2x-energy.png`.
- All 72V configurations use `images/battery-72v-2x-energy.png`.

The same image is intentionally shared across all capacities of each voltage per the store owner's instructions. Check the printed capacity/voltage on each image against the exact SKU before publishing.
