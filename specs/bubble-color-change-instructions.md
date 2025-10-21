# Speech Bubble Color Change Instructions

## Current Colors (Black & Gray)
The PNG bubble files currently use:
- **Black outline/border**: `#000000` (pure black)
- **Gray shadow**: `#C0C0C0` or similar (light gray)
- **White fill**: `#FFFFFF` (white - keep this!)

## Required Purple Theme Colors
To match the website's purple theme, change:

### Border/Outline Color
- **From**: Black `#000000`
- **To**: Purple `#9333ea`

### Shadow Color
- **From**: Gray `#C0C0C0` (or whatever gray shade is used)
- **To**: Light Purple `#c4b5fd` or `#d8b4fe`

### Keep White Fill
- **Keep**: White `#FFFFFF` (don't change the inner white area!)

## Files to Edit
All 4 PNG files need the color changes:
1. `bubble-round-point-left.png`
2. `bubble-round-point-right.png`
3. `bubble-triangle-point-left.png`
4. `bubble-triangle-point-right.png`

## How to Do It (in most graphic programs)

### In Photoshop:
1. Open the PNG file
2. Select > Color Range > Select Black
3. Edit > Fill > Use color `#9333ea`
4. Select > Color Range > Select Gray tones
5. Edit > Fill > Use color `#c4b5fd`
6. Save as PNG

### In GIMP:
1. Open the PNG file
2. Colors > Color to Alpha (remove white if needed)
3. Select by Color > Click black areas
4. Edit > Fill with FG Color (set to `#9333ea`)
5. Select by Color > Click gray areas
6. Edit > Fill with FG Color (set to `#c4b5fd`)
7. Export as PNG

### In Figma/Canva:
1. Import PNG
2. Use "Replace color" or color adjustment tools
3. Change black to `#9333ea`
4. Change gray to `#c4b5fd`
5. Export as PNG

## Quick Reference
- **Purple border**: `#9333ea`
- **Light purple shadow**: `#c4b5fd`
- **White fill**: Keep as is

---
*After changing colors, replace the PNG files in the `docs/assets/` folder and refresh the page!*
