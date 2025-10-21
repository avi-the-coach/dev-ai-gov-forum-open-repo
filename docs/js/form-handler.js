/**
 * Form Handler for Webinar Registration
 * Handles validation and mailto/WhatsApp link generation
 */

// Checkbox groups for mutual exclusion logic
const redZoneCheckboxes = ['tool-claude', 'tool-gemini', 'tool-amazon', 'tool-copilot'];
const greenZoneCheckbox = 'tool-none';
const orangeZoneCheckbox = 'tool-other';

// Handle checkbox mutual exclusion
function setupCheckboxLogic() {
    // Red zone checkboxes - when any is checked, clear Green and Orange
    redZoneCheckboxes.forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            if (this.checked) {
                // Clear Green zone
                document.getElementById(greenZoneCheckbox).checked = false;
                // Clear Orange zone
                document.getElementById(orangeZoneCheckbox).checked = false;
                document.getElementById('otherToolInput').classList.remove('visible');
                document.getElementById('otherTool').value = '';
            }
        });
    });

    // Green zone - when checked, clear all Red and Orange
    document.getElementById(greenZoneCheckbox).addEventListener('change', function() {
        if (this.checked) {
            // Clear all Red zone
            redZoneCheckboxes.forEach(id => {
                document.getElementById(id).checked = false;
            });
            // Clear Orange zone
            document.getElementById(orangeZoneCheckbox).checked = false;
            document.getElementById('otherToolInput').classList.remove('visible');
            document.getElementById('otherTool').value = '';
        }
    });

    // Orange zone - when checked, clear all Red and Green
    document.getElementById(orangeZoneCheckbox).addEventListener('change', function() {
        if (this.checked) {
            // Clear all Red zone
            redZoneCheckboxes.forEach(id => {
                document.getElementById(id).checked = false;
            });
            // Clear Green zone
            document.getElementById(greenZoneCheckbox).checked = false;
            // Show "Other" input field
            document.getElementById('otherToolInput').classList.add('visible');
        } else {
            // Hide "Other" input field
            document.getElementById('otherToolInput').classList.remove('visible');
            document.getElementById('otherTool').value = '';
        }
    });
}

// Initialize checkbox logic
setupCheckboxLogic();

// Detect if user is on mobile device
function isMobileDevice() {
    // Check user agent
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    // Also check screen width (more reliable)
    const mobileWidth = window.innerWidth <= 768;
    // Check touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return mobileUA || (mobileWidth && hasTouch);
}

// Show/hide buttons based on device type - run when DOM is ready
function setupMobileButtons() {
    const isMobile = isMobileDevice();
    console.log('Is mobile device:', isMobile); // Debug log

    if (isMobile) {
        // Mobile: Hide Gmail and Outlook, show mobile email button
        document.getElementById('gmailBtn').style.display = 'none';
        document.getElementById('outlookBtn').style.display = 'none';
        document.getElementById('mobileEmailBtn').style.display = 'flex';
    } else {
        // Desktop: Show Gmail and Outlook, hide mobile email button
        document.getElementById('gmailBtn').style.display = 'flex';
        document.getElementById('outlookBtn').style.display = 'flex';
        document.getElementById('mobileEmailBtn').style.display = 'none';
    }
}

// Run when page loads
window.addEventListener('DOMContentLoaded', setupMobileButtons);
// Also run immediately in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Still loading, wait for DOMContentLoaded
} else {
    // DOM already loaded, run now
    setupMobileButtons();
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Email validation on blur
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();

    if (email && !isValidEmail(email)) {
        this.style.borderColor = '#dc3545';
    } else {
        this.style.borderColor = '#333333';
    }
});

// Function to validate form
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const organization = document.getElementById('organization').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const aiIs = document.getElementById('aiIs').value.trim();
    const beforeAi = document.getElementById('beforeAi').value.trim();
    const futureAi = document.getElementById('futureAi').value.trim();

    // Check if at least one tool is selected
    const toolsChecked = document.querySelectorAll('input[name="tools"]:checked').length > 0;

    // Check all required fields
    if (!fullName || !email || !organization || !jobTitle || !toolsChecked || !aiIs || !beforeAi || !futureAi) {
        document.getElementById('errorMessage').textContent = '❌ אנא מלא את כל השדות החובה';
        document.getElementById('errorMessage').classList.add('visible');
        return false;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        document.getElementById('errorMessage').textContent = '❌ כתובת הדוא"ל אינה תקינה';
        document.getElementById('errorMessage').classList.add('visible');
        document.getElementById('email').style.borderColor = '#dc3545';
        return false;
    }

    document.getElementById('errorMessage').classList.remove('visible');
    document.getElementById('email').style.borderColor = '#333333';
    return true;
}

// Function to get selected tools text
function getToolsText() {
    const checkboxes = document.querySelectorAll('input[name="tools"]:checked');
    const tools = [];
    let hasOther = false;
    let otherText = '';

    checkboxes.forEach(cb => {
        if (cb.value === 'other') {
            hasOther = true;
            otherText = document.getElementById('otherTool').value.trim();
        } else if (cb.value === 'לא משתמש אבל רוצה להשתמש') {
            return; // Will handle separately
        } else {
            tools.push(cb.value);
        }
    });

    // Check if "not using but want to" is selected
    const notUsing = document.getElementById('tool-none').checked;

    if (notUsing) {
        return 'לשאלתך על AI לפיתוח, אני לא משתמש אבל רוצה להשתמש';
    } else if (hasOther) {
        return `לשאלתך על AI לפיתוח, תשובתי היא ${otherText}`;
    } else if (tools.length > 0) {
        return `לשאלתך על AI לפיתוח, אני משתמש ב${tools.join(', ')}`;
    }

    return '';
}

// Gmail button
document.getElementById('gmailBtn').addEventListener('click', function(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const organization = document.getElementById('organization').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const orgRole = `${organization}-${jobTitle}`;
    const aiIs = document.getElementById('aiIs').value.trim();
    const beforeAi = document.getElementById('beforeAi').value.trim();
    const futureAi = document.getElementById('futureAi').value.trim();
    const toolsText = getToolsText();

    const subject = `${fullName}, ${orgRole}, נרשם לוובינר פיתוח AI בעזרת AI ב 2-11-25`;
    const body = `שלום אבי,
נרשמתי לוובינר פיתוח AI בעזרת AI ב 2-11-25

${toolsText}

בנוסף רציתי לומר שבעיני AI זה ${aiIs} ושלפני ה AI ${beforeAi}
וכמו שזה נראה לי בעוד 5 שנים AI ${futureAi}

תודה רבה ונתראה בוובינר
${fullName}
${orgRole}
${email}`;

    const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=avi.bachar@agileprimero.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
});

// WhatsApp button
document.getElementById('whatsappBtn').addEventListener('click', function(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const organization = document.getElementById('organization').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const orgRole = `${organization}-${jobTitle}`;
    const aiIs = document.getElementById('aiIs').value.trim();
    const beforeAi = document.getElementById('beforeAi').value.trim();
    const futureAi = document.getElementById('futureAi').value.trim();
    const toolsText = getToolsText();

    const message = `שלום אבי,
שמי ${fullName}, ${orgRole}
נרשמתי לוובינר פיתוח AI בעזרת AI ב 2-11-25

${toolsText}

בנוסף רציתי לומר שבעיני AI זה ${aiIs} ושלפני ה AI ${beforeAi}
וכמו שזה נראה לי בעוד 5 שנים AI ${futureAi}

תודה רבה ונתראה בוובינר
המייל שלי לכל צורך : ${email}`;

    const whatsappLink = `https://wa.me/972556665056?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
});

// Outlook button
document.getElementById('outlookBtn').addEventListener('click', function(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const organization = document.getElementById('organization').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const orgRole = `${organization}-${jobTitle}`;
    const aiIs = document.getElementById('aiIs').value.trim();
    const beforeAi = document.getElementById('beforeAi').value.trim();
    const futureAi = document.getElementById('futureAi').value.trim();
    const toolsText = getToolsText();

    const subject = `${fullName}, ${orgRole}, נרשם לוובינר פיתוח AI בעזרת AI ב 2-11-25`;
    const body = `שלום אבי,
נרשמתי לוובינר פיתוח AI בעזרת AI ב 2-11-25

${toolsText}

בנוסף רציתי לומר שבעיני AI זה ${aiIs} ושלפני ה AI ${beforeAi}
וכמו שזה נראה לי בעוד 5 שנים AI ${futureAi}

תודה רבה ונתראה בוובינר
${fullName}
${orgRole}
${email}`;

    const mailtoLink = `mailto:avi.bachar@agileprimero.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
});

// Mobile Email button (mailto)
document.getElementById('mobileEmailBtn').addEventListener('click', function(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const organization = document.getElementById('organization').value.trim();
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const orgRole = `${organization}-${jobTitle}`;
    const aiIs = document.getElementById('aiIs').value.trim();
    const beforeAi = document.getElementById('beforeAi').value.trim();
    const futureAi = document.getElementById('futureAi').value.trim();
    const toolsText = getToolsText();

    const subject = `${fullName}, ${orgRole}, נרשם לוובינר פיתוח AI בעזרת AI ב 2-11-25`;
    const body = `שלום אבי,
נרשמתי לוובינר פיתוח AI בעזרת AI ב 2-11-25

${toolsText}

בנוסף רציתי לומר שבעיני AI זה ${aiIs} ושלפני ה AI ${beforeAi}
וכמו שזה נראה לי בעוד 5 שנים AI ${futureAi}

תודה רבה ונתראה בוובינר
${fullName}
${orgRole}
${email}`;

    const mailtoLink = `mailto:avi.bachar@agileprimero.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
});
