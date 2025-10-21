# Inspirational Talk Feature Specification

## Overview
An interactive background messaging system that displays conversational phrases to users while they interact with the registration form. The messages appear and disappear smoothly, creating an AI-like conversational experience without actual AI.

## Core Concept
- Display short conversational sentences that appear randomly in the background
- Messages appear in visible areas (not covered by form)
- Create illusion of page/AI "talking" to the user
- Messages float and move like the existing logo animations
- Text appears on top of floating logos (higher z-index)

## Phase 1: Basic Implementation (Current Scope)

### Data Structure
- Create JSON file storing phrases database (~40-100 phrases)
- Each phrase contains:
  - `text`: The message content
  - `category`: "general" (for Phase 1), later: "context-specific"
  - Optional: `duration`, `animation-type`

### Phrase Types for Phase 1
**General welcoming phrases:**
- "היי, שמחים שאתה כאן" (Hi, glad you're here)
- "אז אתה מתכנן להגיע לוובינר? מעולה!" (So you're planning to come to the webinar? Great!)
- General encouraging messages
- Friendly conversational snippets

### Visual Behavior
- **Appearance**: Smooth fade-in animation
- **Display**: Stay visible for ~2-3 seconds (enough time to read)
- **Movement**: Float/drift like the background logos (not static)
- **Disappearance**: Smooth fade-out animation
- **Positioning**: Random positions in visible background areas (not under form)
- **Z-index**: Above floating logos, below form elements

### Animation Requirements
- Smooth transitions (no sudden appear/disappear)
- Messages should drift/move during display
- Similar motion to existing floating-bg.js animations
- Timing: Random intervals between messages (3-5 seconds?)

## Phase 2: Context-Aware Messages (Future Enhancement)

### Context-Specific Triggers
When user interacts with specific form fields, display relevant messages:

**Full Name field (focus/hover):**
- "כן, כאן צריך לשים את השם המלא שלך כדי שאדע איך לקרוא לך" (Yes, here you need to put your full name so I know how to call you)

**Claude Code checkbox (checked):**
- "היי, אתה משתמש ב-Claude Code? אני Claude Code! מעולה!" (Hey, you're using Claude Code? I'm Claude Code! That's great!)

**Email field:**
- Email-specific encouraging messages

**Other checkboxes:**
- Tool-specific responses

### Implementation Strategy
- Tag phrases with field identifiers in JSON
- Add event listeners to form fields
- Trigger context-specific messages based on user interaction
- Maintain general message flow in background

## Technical Considerations

### File Structure
```
docs/
├── data/
│   └── inspirational-phrases.json
├── js/
│   └── inspirational-talk.js (new file)
```

### Integration Points
- Works alongside existing `floating-bg.js`
- Coordinate z-index layers:
  1. Floating background (lowest)
  2. Floating logos (middle)
  3. Inspirational messages (above logos)
  4. Form elements (highest)

### Algorithm (Phase 1)
- Random phrase selection from "general" category
- Random position generation (within safe visible areas)
- Random timing intervals
- Avoid overlapping multiple messages simultaneously

## Design Specifications

### Typography
- Font size: TBD (readable but not intrusive)
- Font weight: Medium/Semi-bold
- Color: Purple theme (#9333ea) with slight transparency?
- Text shadow for readability over logos

### Animation Timing
- Fade-in: ~0.5s
- Display duration: 2-3s
- Fade-out: ~0.5s
- Interval between messages: 3-5s (random)

### Movement
- Similar to logo drift
- Gentle floating motion
- Direction: Random or following logo pattern

## Future Enhancements (Beyond Phase 2)
- Analytics: Track which messages users see most
- A/B testing different phrase styles
- Multilingual support
- User preference to enable/disable messages
- More sophisticated AI-like conversation flow

## Implementation Plan

### Step 1: Data Setup
1. Create `inspirational-phrases.json` with initial 40-50 general phrases
2. Define JSON structure

### Step 2: Core Functionality
1. Create `inspirational-talk.js`
2. Implement phrase loading from JSON
3. Random selection algorithm
4. Position calculation (avoid form area)

### Step 3: Animation
1. Fade-in/out animations
2. Floating/drifting motion
3. CSS styling and z-index management

### Step 4: Testing & Refinement
1. Test timing intervals
2. Adjust animation speeds
3. Fine-tune positioning
4. Ensure readability over logos

### Step 5: Phase 2 (Context-Awareness)
1. Add field-specific phrases to JSON
2. Implement event listeners
3. Context-triggered message system

---

## Notes
- Start simple: Focus on getting basic random messages working smoothly
- Can refine phrases later - mechanism is priority
- Ensure messages don't interfere with form usability
- Mobile responsiveness TBD

---
*Document created: 2025-10-21*
*Last updated: 2025-10-21*
