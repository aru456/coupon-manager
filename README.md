# 🎟️ Coupon Management System

A lightweight web app built and deployed using **Google Apps Script** that enables seamless coupon creation, management, and redemption. The system integrates with **Passcreator API** to generate personalized **Apple Wallet passes**, making the redemption process fast and user-friendly.

---

## Key Features

### Coupon Generation
- Create coupons with:
  - Expiration date
  - Service type (e.g., Food, Transport)
  - Discount (%)
  - Number of uses
  - Recipient info (Name, @nyu.edu Email, Phone)
- Generates:
  - QR Code
  - Wallet-compatible pass link
- Sends coupon to recipient via email.

### Secure Redemption
- Admin validation required (Password: `Admin123`)
- Redeem via:
  - QR code scan
  - Pass link
- Tracks and updates remaining uses in a connected **Google Sheet**.

---

## How It Works

1. **Create Coupon**
   - Fill the form (Expiration, Type, Discount, etc.)
   - Click "Generate Coupon"
   - System displays QR and pass link
   - An email with coupon details is sent to the recipient

2. **Add to Wallet**
   - Click the pass link or scan the QR code to add it to Apple Wallet
   - <img src="https://raw.githubusercontent.com/aru456/coupon-manager/main/IMG_7543.jpg" height="500"/>

3. **Redeem Coupon**
   - Go to Redeem tab
   - Enter Admin Password
   - Scan QR code to redeem
   - System updates status in the Google Sheet

---

## Technology Stack

- **Frontend & Backend**: Google Apps Script (HTML + JS + Apps Script)
- **Database**: Google Sheets
- **QR Code Generation**: Apps Script Libraries
- **Apple Wallet Integration**: Passcreator API

---

## Passcreator API

Used to generate digital passes dynamically.

- **Endpoint**:  
  `https://app.passcreator.com/api/pass?passtemplate={template-uid}&zapierStyle=true`
- **Authentication**: API Key in header
- **Template UID**: From Passcreator dashboard

---

## Coupon Status Messages

| Condition             | Message                                               |
|-----------------------|--------------------------------------------------------|
| ✅ Valid              | `Coupon ID C-XXXXX successfully redeemed. Remaining: X` |
| ❌ Expired            | `Coupon ID C-XXXXX is expired and cannot be redeemed.` |
| ❌ No Remaining Uses  | `Coupon ID C-XXXXX cannot be redeemed. No remaining uses.` |
| ❌ Not Found          | `Coupon ID C-XXXXX not found.`                         |
| ❌ Invalid Password   | `Invalid Password. Please try again.`                 |

---

##  Validations

- Only `@nyu.edu` emails are accepted
- Expiration must be in the future
- Discount between `0–100%`
- Phone must be 10 digits
- Name should be alphabetical

---

## Deployment

- Built and deployed entirely with **Google Apps Script**
- Integrated with **Passcreator API** for Apple Wallet support
- Data stored and updated in **Google Sheets**

---



## Contact

For help or suggestions:  
`sy3902@nyu.edu`

---
