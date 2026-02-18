# Accessible Tooltip Component

This project implements a small, reusable tooltip component written in vanilla JavaScript.
This is a simple API that works with any HTML element.

## Features
- Any element with the `data-tooltip` attribute shows a tooltip on hover or focus
- Keyboard accessible, tooltips can be triggered by Tab and dismissed with Escape
- Only one tooltip is visible at time
- Tooltip position updates on window resize
- Smart placement logic prevents the tooltip from being clipped near viewport edges

## Styling
- Tooltip includes an arrow and subtle elevation
- Fade and slide animation for smooth appearance
- SCSS variables are used for easy customization
- Arrow is implemented with a small SCSS mixin

## Implementation Notes
- A single tooltip element is created and reused to keep the DOM clean
- Positioning is calculated using `getBoundingClientRect` and viewport boundaries
- Preferred placement is tried first, with graceful fallbacks when space is limited
- ARIA attributes and focus management are included for accessibility
- No external libraries or frameworks are used

## Files
- `index.html` example markup and usage
- `styles.scss` tooltip styles and arrow mixin. The SCSS file is the source of truth, the compiled CSS is not included.
- `app.js` tooltip logic
