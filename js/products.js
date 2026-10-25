/*
  2X Energy — editable store data
  Update contact details and product data here; no build tools are required.

  IMPORTANT BEFORE LAUNCH:
  - The WhatsApp/phone number below is taken from the supplied brand poster.
    Confirm it is approved for public use.
  - Replace the UPI placeholder with your verified UPI ID and a real QR image.
  - Check the 15 visible price-list rows against your original high-resolution
    catalogue before accepting payments or publishing technical specifications.
*/
window.SITE_CONFIG = {
  storeName: '2X Energy Batteries Manufacturer',
  domain: 'https://2xenergy.store',
  whatsappNumber: '919811937877', // digits only, country code included
  phoneDisplay: '+91 98119 37877',
  phoneLink: '+919811937877',
  businessEmail: '2xenergyy@gmail.com',
  upiId: '9811937877@axl', // Add your verified UPI ID when you provide it
  upiQrImage: '', // Add the owner's verified QR image path later
  businessAddress: 'Plot no 335, Block N, Village-Luksar, Gautam Budh Nagar, Greater Noida',
  tagline: 'Batteries Manufacturer',
  pricesFromCatalogue: true
};

/* Product numbers/specifications below are transcribed from the supplied
   supplied EV Battery Price List PDF/image. Verify each row before launch.
   Note: the source labels its Power column as W, but the listed values equal
   Voltage × Ah (normally Wh). The site shows the number without a unit until
   the business confirms what the catalogue intended. */
window.PRODUCTS = [
  { id: 'ev-48v-22ah', manufacturer: '2X Energy', name: '48V 22Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '48V', capacity: '22Ah', power: '1,056', range: '30 km', price: 9504, image: 'images/battery-48v-2x-energy.jpg', badge: 'Entry option', description: 'A compact 48V battery option from the supplied EV battery price list. Confirm connector, dimensions and vehicle compatibility before ordering.' },
  { id: 'ev-48v-25ah', manufacturer: '2X Energy', name: '48V 25Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '48V', capacity: '25Ah', power: '1,200', range: '40 km', price: 10800, image: 'images/battery-48v-2x-energy.jpg', badge: '', description: 'A 48V, 25Ah configuration listed in the supplied EV battery catalogue. Ask our team to confirm fitment for your vehicle.' },
  { id: 'ev-48v-30ah', manufacturer: '2X Energy', name: '48V 30Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '48V', capacity: '30Ah', power: '1,440', range: '48 km', price: 12960, image: 'images/battery-48v-2x-energy.jpg', badge: 'Popular capacity', description: 'A 48V, 30Ah configuration listed in the supplied price list. Range estimates can vary with vehicle, load and riding conditions.' },
  { id: 'ev-48v-38ah', manufacturer: '2X Energy', name: '48V 38Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '48V', capacity: '38Ah', power: '1,824', range: '64 km', price: 16416, image: 'images/battery-48v-2x-energy.jpg', badge: '', description: 'A higher-capacity 48V configuration from the supplied price list. Confirm battery dimensions and connector compatibility before purchase.' },
  { id: 'ev-48v-45ah', manufacturer: '2X Energy', name: '48V 45Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '48V', capacity: '45Ah', power: '2,160', range: '80 km', price: 19440, image: 'images/battery-48v-2x-energy.jpg', badge: '', description: 'A 48V, 45Ah configuration listed in the supplied EV battery catalogue. Please confirm application compatibility with our team.' },
  { id: 'ev-60v-22ah', manufacturer: '2X Energy', name: '60V 22Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '60V', capacity: '22Ah', power: '1,320', range: '40 km', price: 11880, image: 'images/battery-60v-2x-energy.png', badge: '', description: 'A 60V, 22Ah configuration from the supplied EV battery price list. Please confirm charger and vehicle compatibility before ordering.' },
  { id: 'ev-60v-25ah', manufacturer: '2X Energy', name: '60V 25Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '60V', capacity: '25Ah', power: '1,500', range: '50 km', price: 13500, image: 'images/battery-60v-2x-energy.png', badge: '', description: 'A 60V, 25Ah configuration listed in the supplied catalogue. Ask about fitment, connectors and current availability.' },
  { id: 'ev-60v-30ah', manufacturer: '2X Energy', name: '60V 30Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '60V', capacity: '30Ah', power: '1,800', range: '60 km', price: 16200, image: 'images/battery-60v-2x-energy.png', badge: 'Popular capacity', description: 'A 60V, 30Ah configuration from the supplied EV price list. Actual range depends on the vehicle, load and riding conditions.' },
  { id: 'ev-60v-38ah', manufacturer: '2X Energy', name: '60V 38Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '60V', capacity: '38Ah', power: '2,280', range: '80 km', price: 20520, image: 'images/battery-60v-2x-energy.png', badge: '', description: 'A 60V, 38Ah configuration from the supplied catalogue. Confirm exact fitment and battery dimensions with the 2X Energy team.' },
  { id: 'ev-60v-45ah', manufacturer: '2X Energy', name: '60V 45Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '60V', capacity: '45Ah', power: '2,700', range: '100 km', price: 24300, image: 'images/battery-60v-2x-energy.png', badge: '', description: 'A 60V, 45Ah configuration listed in the provided EV battery price list. Contact us to check suitability for your application.' },
  { id: 'ev-72v-22ah', manufacturer: '2X Energy', name: '72V 22Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '72V', capacity: '22Ah', power: '1,584', range: '48 km', price: 14256, image: 'images/battery-72v-2x-energy.png', badge: '', description: 'A 72V, 22Ah configuration from the supplied catalogue. Confirm the required voltage and charger compatibility before ordering.' },
  { id: 'ev-72v-25ah', manufacturer: '2X Energy', name: '72V 25Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '72V', capacity: '25Ah', power: '1,800', range: '60 km', price: 16200, image: 'images/battery-72v-2x-energy.png', badge: '', description: 'A 72V, 25Ah configuration from the supplied EV battery price list. Range is an estimate and varies by application.' },
  { id: 'ev-72v-30ah', manufacturer: '2X Energy', name: '72V 30Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '72V', capacity: '30Ah', power: '2,160', range: '72 km', price: 19440, image: 'images/battery-72v-2x-energy.png', badge: 'Popular capacity', description: 'A 72V, 30Ah configuration from the supplied catalogue. Ask our team to confirm connector, dimensions and vehicle fitment.' },
  { id: 'ev-72v-38ah', manufacturer: '2X Energy', name: '72V 38Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '72V', capacity: '38Ah', power: '2,736', range: '96 km', price: 24624, image: 'images/battery-72v-2x-energy.png', badge: '', description: 'A 72V, 38Ah configuration listed in the supplied price list. Confirm availability and fitment before placing an order.' },
  { id: 'ev-72v-45ah', manufacturer: '2X Energy', name: '72V 45Ah Lithium LFP EV Battery', category: 'EV Batteries', voltage: '72V', capacity: '45Ah', power: '3,240', range: '120 km', price: 29160, image: 'images/battery-72v-2x-energy.png', badge: 'Highest capacity shown', description: 'A 72V, 45Ah configuration from the supplied EV battery price list. Range figures are indicative; confirm your use case with our team.' }
];
