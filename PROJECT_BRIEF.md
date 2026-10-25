# PROJECT BRIEF — 2X Energy Batteries Manufacturer

## 1. Business overview
- **Store name:** 2X Energy
- **Website brand line:** 2X Energy Batteries Manufacturer
- **Business:** Battery sales and enquiries for retail and wholesale customers
- **Domain supplied:** https://2xenergy.store (DNS/ownership and hosting configuration still need verification before launch)
- **Market:** India
- **Address supplied by owner:** Plot no 335, Block N, Village-Luksar, Gautam Budh Nagar, Greater Noida
- **Business email supplied by owner:** 2xenergyy@gmail.com
- **Phone / WhatsApp shown in supplied brand artwork:** +91 98119 37877; owner should confirm it remains the correct public order number.
- **Launch catalogue:** 15 listed EV battery configurations (within the expected 11–30 products)
- **Target customers:** Retail customers and wholesale/bulk buyers

## 2. Visual direction
- **Design reference:** A clean, contemporary gadget-store ecommerce layout with a compact announcement/header area, search bar, category navigation, image-led hero banner, category cards, product cards, benefits strip, feature story panel and strong contact/wholesale CTA.
- **Brand palette:** Dark forest green, white and lime green accent; do not copy the reference site's logo or red brand palette.
- **Personality:** Premium, clean, confident, modern and energy-focused.
- **Typography:** Google Fonts Manrope and DM Sans, with sensible system fallbacks.
- **Brand asset:** Custom local vector logo files under `images/2x-energy-logo.svg` and `images/2x-energy-logo-light.svg`, plus `images/favicon.svg`.
- **Responsive goal:** Mobile-first, no horizontal overflow at 375px wide, tap-friendly controls and a mobile hamburger menu.

## 3. Product catalogue and image handling
- The supplied catalogue lists 48V, 60V and 72V EV battery configurations in 22Ah, 25Ah, 30Ah, 38Ah and 45Ah capacities.
- Fifteen prices and stated kilometre ranges have been included from the supplied catalog. Confirm them against the source before launch.
- The catalogue's Power column unit should be confirmed, because its printed numbers equal voltage multiplied by amp-hours. The site should avoid asserting an unverified unit.
- Additional categories visible in the supplied brand artwork: EV batteries, e-bike/e-scooter batteries, solar energy storage, industrial batteries, and UPS/backup systems. Categories without confirmed product data currently route customers to an enquiry rather than inventing products or prices.
- The updated site uses curated locally stored illustrative battery renders (`images/hero-battery-scene.jpg`, `images/battery-product-large.jpg`, `images/battery-product-compact.jpg`) for a more consistent premium presentation. They are illustrations and must not be represented as exact photographs of individual models.

## 4. Pages and current functionality
1. `index.html` — modern hero, application category row, featured products, trust/benefits strip, catalogue guidance, wholesale CTA and contact details.
2. `shop.html` — product grid, search, voltage selection and sorting.
3. `product.html?id=...` — dynamic detail page for an item ID.
4. `cart.html` — add/update/remove items, quantity totals and order enquiry form.
5. `about.html` — brand approach and battery-selection guidance.
6. `contact.html` — WhatsApp, phone, email, address and enquiry form.
7. `css/style.css` — shared responsive styling.
8. `js/main.js` — cart, navigation, search, enquiries and shared header/footer.
9. `js/products.js` — editable store configuration and product data.
10. `images/` — local logos, hero/product artwork and the UPI pending state asset.

The project uses plain HTML, CSS and vanilla JavaScript only; it has no npm or build step. Cart data is stored in localStorage on hosted pages, with a lightweight file-preview fallback. Checkout submits a prefilled order enquiry to WhatsApp; it does not charge customers or mark orders as paid.

## 5. Payments
- Owner will provide the verified UPI ID and QR image later.
- The cart currently shows a neutral **QR code coming soon** state. No fake/scanable-looking QR code or invented UPI credential is exposed.
- Do not collect or direct payments to a placeholder. This static website does not process or verify UPI transfers.

## 6. Launch checks still needed
- Confirm the WhatsApp/phone number in the supplied artwork is the correct public order number.
- Replace illustrative product renders with exact approved product photos as they become available.
- Verify all prices, capacities, ranges, connectors and compatible applications against the source catalogue.
- Provide and verify the UPI ID and QR code before enabling payment details.
- Confirm delivery coverage/charges, stock availability, warranty, return/replacement and privacy policies.
- Verify the domain's DNS and choose/connect the static hosting provider.
- Test the site on real Android/iPhone browsers and at 375px wide before publishing.

## 7. Hosting and preview
- **Local preview:** open `index.html` in a browser; for best behaviour, run `python -m http.server 8000` from the project folder and visit `http://localhost:8000`.
- **Deployment:** static hosting on GitHub Pages or another static host is suitable after the owner verifies the domain and launch details.

**Status:** Initial website code and design refresh completed; production launch still requires the checks above.


## Latest storefront update
- Homepage includes a “Manufacturer” section with the verified 2X Energy catalogue brand and a contact path for enquiries about other manufacturers.
- Shop page includes a manufacturer filter. Currently, only 2X Energy is listed because it is the only manufacturer confirmed by the supplied catalogue.
