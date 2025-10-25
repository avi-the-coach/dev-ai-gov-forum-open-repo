/**
 * Expandable Webinar Description
 * Shows/hides detailed description on hover OR click (based on user setting)
 */

const instructorInfo = document.getElementById('instructorInfoHover');
const descriptionSection = document.getElementById('webinarDescription');

// Track current mode and expansion state
let isClickMode = false;
let isExpanded = false;
let hoverTimeout;

// Function to check if click mode is enabled
function getClickMode() {
    const clickModeCheckbox = document.getElementById('clickToExpandMode');
    return clickModeCheckbox ? clickModeCheckbox.checked : false;
}

// Set up event listener for checkbox when it's created
// Use event delegation on document since checkbox is created dynamically
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'clickToExpandMode') {
        isClickMode = e.target.checked;
        console.log('Content expand mode:', isClickMode ? 'CLICK' : 'HOVER');

        // If switching to click mode while expanded via hover, collapse it
        if (isClickMode && isExpanded) {
            descriptionSection.classList.remove('expanded');
            isExpanded = false;
        }
    }
});

function collapseDescription() {
    hoverTimeout = setTimeout(() => {
        descriptionSection.classList.remove('expanded');
        isExpanded = false;
    }, 200); // Small delay to prevent flickering
}

// === CLICK MODE HANDLERS ===
instructorInfo.addEventListener('click', function(e) {
    if (isClickMode) {
        // In click mode: click to expand, hover away to collapse
        if (!isExpanded) {
            descriptionSection.classList.add('expanded');
            isExpanded = true;
        }
        e.stopPropagation();
    }
});

// === HOVER MODE HANDLERS ===
// Expand on mouse enter (only in hover mode)
instructorInfo.addEventListener('mouseenter', function() {
    // Check current mode dynamically in case checkbox changed
    isClickMode = getClickMode();

    if (!isClickMode) {
        descriptionSection.classList.add('expanded');
        isExpanded = true;
    }
});

// Collapse on mouse leave (works in BOTH modes)
instructorInfo.addEventListener('mouseleave', function(e) {
    // Check if we're moving to the description section
    if (!descriptionSection.contains(e.relatedTarget)) {
        collapseDescription();
    }
});

descriptionSection.addEventListener('mouseenter', function() {
    // Cancel collapse if mouse enters description
    clearTimeout(hoverTimeout);
    isExpanded = true;
});

descriptionSection.addEventListener('mouseleave', function(e) {
    // Check if we're moving back to instructor info
    if (!instructorInfo.contains(e.relatedTarget)) {
        collapseDescription();
    }
});
