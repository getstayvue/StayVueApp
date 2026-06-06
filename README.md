# Property Manager

A complete short-term rental property management app. Manage bookings, expenses, guests, maintenance, cleaning, vendors, tax reporting, and more across multiple properties.

## Features
- Multi-property management with portfolio-wide or per-property views
- Booking calendar with iCal sync from Airbnb, VRBO, Booking.com
- Expense tracking with receipt uploads and tax-deductible flagging
- Guest CRM with email campaigns and templates
- Maintenance tracking, vendor contacts, cleaning checklists
- Tax Centre with CSV export for accountants
- Property codes (WiFi, door codes, alarm)
- PWA — installable on iPhone and Android
- Secure authentication with email/password and Google OAuth

## Local Development

```bash
npm install
npm run build
node server/index.js
# Open http://localhost:3001
```

## Environment Variables (optional)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for "Sign in with Google" |

## Deployment

See the deployment guide in the project documentation.
