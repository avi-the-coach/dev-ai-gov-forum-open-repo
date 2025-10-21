/**
 * Expandable Webinar Description
 * Shows/hides detailed description on hover
 */

const instructorInfo = document.getElementById('instructorInfoHover');
const descriptionSection = document.getElementById('webinarDescription');

// Expand on mouse enter
instructorInfo.addEventListener('mouseenter', function() {
    descriptionSection.classList.add('expanded');
});

// Collapse on mouse leave (when leaving BOTH the instructor info AND description)
let hoverTimeout;

function collapseDescription() {
    hoverTimeout = setTimeout(() => {
        descriptionSection.classList.remove('expanded');
    }, 200); // Small delay to prevent flickering
}

instructorInfo.addEventListener('mouseleave', function(e) {
    // Check if we're moving to the description section
    if (!descriptionSection.contains(e.relatedTarget)) {
        collapseDescription();
    }
});

descriptionSection.addEventListener('mouseenter', function() {
    // Cancel collapse if mouse enters description
    clearTimeout(hoverTimeout);
});

descriptionSection.addEventListener('mouseleave', function(e) {
    // Check if we're moving back to instructor info
    if (!instructorInfo.contains(e.relatedTarget)) {
        collapseDescription();
    }
});
