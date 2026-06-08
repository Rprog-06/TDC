# Email Feature Setup Guide

## Quick Start (Demo with Ethereal)

For local development and testing, we use **Ethereal Email** (free fake SMTP service):

### 1. Get Ethereal Credentials
- Go to https://ethereal.email
- Click "Create Ethereal Account"
- Copy the SMTP credentials provided

### 2. Set Environment Variables

Create a `.env` file in the `backend/` folder:

```
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@ethereal.email
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@thedatecrew.com
NODE_ENV=development
GEMINI_API_KEY=your_key_here
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

This installs `nodemailer` which handles email sending.

### 4. Test It

```bash
npm run dev
```

Then:
1. Navigate to a customer profile in the dashboard
2. Find a suggested match
3. Click **"Send Match"** button
4. Check the console for the preview URL (Ethereal provides a clickable link)
5. Click the link to see the email that was "sent"

---

## Production Setup

For a real production environment:

### Option A: Gmail (Simple)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
```
*Note: Use [Gmail App Passwords](https://support.google.com/accounts/answer/185833), not your regular password.*

### Option B: SendGrid (Recommended)
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

### Option C: Your Email Provider
Configure `EMAIL_HOST`, `EMAIL_PORT`, and credentials accordingly.

### Production troubleshooting

After deploying the backend, open:

```
https://your-backend-url/api/actions/email-status
```

It returns only redacted config status. `configured` must be `true`; if it is
`false`, add the listed `missing` variables to the production backend service
environment and redeploy.

Required production variables:

```
EMAIL_HOST=your_smtp_host
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_smtp_user
EMAIL_PASSWORD=your_smtp_password_or_api_key
EMAIL_FROM=noreply@thedatecrew.com
```

For port `465`, use `EMAIL_SECURE=true`. For port `587`, use
`EMAIL_SECURE=false`.

---

## Features

✅ **Real Email Sending**: Uses nodemailer to send actual emails  
✅ **Nice HTML Template**: Professional, branded email layout  
✅ **Match Details**: Includes age, city, profession, income, match score  
✅ **No Extra API Calls**: Uses data already retrieved (no per-email AI cost)  
✅ **Toast Notifications**: Better UX feedback on send success/failure  
✅ **Error Handling**: Graceful failures with user-friendly messages  

---

## Cost Considerations

- **Ethereal**: Free (demo only)
- **Gmail**: Free (limited volume)
- **SendGrid**: Free tier (100 emails/day), then ~$20–30/month for higher volume
- **Nodemailer**: Free (open-source library)
- **Gemini AI**: Only called when user clicks "Load AI Reason" (not on every send)

---

## What Impresses Recruiters

1. **Real email integration** ✅ (not just a toast)
2. **Clean email template** ✅ (professional HTML)
3. **Proper error handling** ✅ (try/catch in backend)
4. **Environment config** ✅ (.env.example provided)
5. **Cost awareness** ✅ (no wasteful AI calls per send)
6. **Good UX feedback** ✅ (toast notifications)
