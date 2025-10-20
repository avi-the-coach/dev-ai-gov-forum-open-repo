# Webinar Registration Form
## AI Development Workshop - November 2, 2025

### Overview
Professional webinar registration form with animated floating logos, fireworks effects, and multi-channel submission (Gmail, WhatsApp, Outlook).

### Project Structure
```
webinar-registration/
├── webinar-registration-ai-in-dev-02-11-25.html  # Main HTML file
├── css/
│   ├── styles.css                                 # Main styles
│   └── animations.css                             # Floating logos & fireworks
├── js/
│   ├── form-handler.js                            # Form validation & submission
│   ├── fireworks.js                               # Header fireworks animation
│   └── floating-bg.js                             # Floating background logos
├── assets/
│   ├── ai-dev-forum-logo.png                      # AI Coding logo (transparent)
│   └── avi-bachar-profile-pic.jpg                 # Instructor photo
└── README.md                                       # This file
```

### Features

#### Visual Effects
- **Floating Background**: 8 AI logos floating randomly with changing speeds
- **Fireworks**: Hover over header for animated fireworks with sound
- **Purple Theme**: Gradient effects with purple (#9333ea) color scheme
- **Responsive Design**: Works on desktop and mobile

#### Form Fields
1. Full Name (שם מלא) - Required
2. Email (כתובת דוא"ל) - Required
3. Organization-Role (ארגון-תפקיד) - Required
4. AI Tools Used (multi-select) - Required
   - Claude Code
   - Gemini CLI/Code Assist
   - Amazon Q
   - CoPilot
   - Not using but want to
   - Other (with text input)
5. Three completion questions - Required:
   - AI זה...
   - לפני AI...
   - בעוד 5 שנים AI...

#### Submission Options
- **Gmail**: Opens Gmail web interface with pre-filled email
- **WhatsApp**: Opens WhatsApp with pre-filled message
- **Outlook**: Opens Outlook desktop with pre-filled email

### How to Use

#### Local Development
1. Open `webinar-registration-ai-in-dev-02-11-25.html` in a browser
2. All assets are referenced relatively - no server needed

#### Deploy to GitHub Pages
1. Push entire folder to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch as source
4. All features work without backend

### Adding New Features

#### Add New CSS Styles
Edit `css/styles.css` or `css/animations.css`

#### Add New JavaScript
Create new file in `js/` folder and add `<script>` tag to HTML:
```html
<script src="js/your-new-file.js"></script>
```

#### Modify Form
1. Edit HTML form section
2. Update validation in `js/form-handler.js`
3. Update email template generation

### Technical Details

#### Security
- No backend required
- No API keys exposed
- User sends email from their own client
- Safe for public GitHub Pages deployment

#### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses Web Audio API for sound effects
- Canvas API for fireworks animation

#### Performance
- Optimized animations using requestAnimationFrame
- CSS transitions for smooth effects
- Lazy sound generation (only on user interaction)

### Configuration

#### Change Email Recipient
Edit in `js/form-handler.js`:
```javascript
to=avi.bachar@agileprimero.com  // Line in Gmail button handler
```

#### Change WhatsApp Number
Edit in `js/form-handler.js`:
```javascript
https://wa.me/972556665056  // Line in WhatsApp button handler
```

#### Adjust Animation Speed
- Floating logos: Edit `js/floating-bg.js` (speedX, speedY values)
- Fireworks frequency: Edit `js/fireworks.js` (setInterval time)

#### Change Logo Opacity
Edit `css/animations.css`:
```css
.floating-logo {
    opacity: 0.7;  /* Adjust 0.0 (invisible) to 1.0 (solid) */
}
```

### Future Enhancements
Ready for:
- Tooltips
- Additional animations
- Success messages
- Field-specific validation messages
- Multi-language support
- Analytics integration

---

**Created**: January 2025
**Webinar Date**: November 2, 2025 at 14:30
**Instructor**: Avi Bachar - אבי בכר
**Topic**: פיתוח AI באמצעות AI - מתודולוגיות והדגמה עם קלוד קוד
