# Webinar Registration System - Specification

## Overview
Static HTML registration form hosted on GitHub Pages that saves data to Google Sheets and sends confirmation emails via Google Apps Script.

## Links
- **Google Sheet**: https://docs.google.com/spreadsheets/d/1t6ZQg6ia4-lSoTezYhZtBgVEBEKeDgfr69qPKgidw7A/edit?gid=0#gid=0
- **GitHub Pages**: [To be added after deployment]
- **Apps Script Web App URL**: [To be added after deployment]

## Webinar Details
- **Title**: פיתוח AI באמצעות AI - מתודולוגיות והדגמה עם קלוד קוד
- **Date**: November 2, 2025
- **Time**: 14:30
- **Instructor**: Avi Bakar (אבי בכר)
- **Meeting Link**: [To be provided]

## Form Fields (from HTML)
1. Full Name (שם מלא) - Required
2. Email (כתובת אימייל) - Required
3. Phone (מספר טלפון) - Optional
4. Company/Organization (חברה/ארגון) - Optional
5. Experience Level (רמת ניסיון ב-AI ופיתוח) - Optional
   - Options: beginner, intermediate, advanced, expert
6. Expectations (מה אתם מצפים ללמוד) - Optional

## Google Sheet Columns
**Please confirm/provide your column structure:**
- [ ] Timestamp (auto-generated)
- [ ] Full Name
- [ ] Email
- [ ] Phone
- [ ] Company
- [ ] Experience Level
- [ ] Expectations
- [ ] Registration Date
- [ ] Registration Time
- [ ] Other columns?

## Architecture

### 1. Frontend (GitHub Pages)
- Static HTML form (remixed-f440551d.html)
- No credentials stored in code
- Submits via fetch() to Google Apps Script webhook

### 2. Backend (Google Apps Script)
- Attached to Google Sheet
- Receives form submissions via POST
- Writes data to sheet
- Sends confirmation email with calendar invite
- Returns success/error to frontend

### 3. Security
- Apps Script URL is public but only accepts POST requests
- No authentication credentials in HTML
- Google handles all security for sheet access
- CORS enabled for GitHub Pages domain

## Implementation Steps

1. **Create Google Apps Script**
   - Create script in Google Sheet (Extensions > Apps Script)
   - Deploy as Web App with "Anyone" access
   - Get deployment URL

2. **Update HTML**
   - Remove EmailJS dependencies
   - Replace with fetch() to Apps Script URL
   - Update form submission handler

3. **Configure Email Template**
   - Hebrew confirmation email
   - Calendar invite (.ics attachment)
   - Meeting link and instructions

4. **Deploy to GitHub**
   - Create repository
   - Enable GitHub Pages
   - Test registration flow

## Email Confirmation Template (Draft)

**Subject**: אישור הרשמה לוובינר - פיתוח AI באמצעות AI

**Body**:
```
שלום [Name],

תודה על ההרשמה לוובינר!

📅 תאריך: 2 בנובמבר 2025
🕐 שעה: 14:30
🎯 נושא: פיתוח AI באמצעות AI - מתודולוגיות והדגמה עם קלוד קוד
👨‍🏫 מנחה: אבי בכר

🔗 קישור למפגש: [MEETING_LINK]

ההרשמה שלך התקבלה בהצלחה. נתראה בוובינר!

בברכה,
אבי
```

## Next Steps
- [ ] Confirm Google Sheet column structure
- [ ] Provide meeting link (Zoom/Teams/etc)
- [ ] Review email template
- [ ] Create Google Apps Script
- [ ] Update HTML form
- [ ] Test locally
- [ ] Deploy to GitHub Pages
