# PWA Black Screen Fix Guide

## Problem

When entering the PWA app (installed version), you see a black/dark screen instead of the normal content.

## Root Causes

1. **CSS Visibility Issues**: Elements not properly visible in standalone mode
2. **Service Worker Caching**: Incorrect content being served from cache
3. **Viewport Issues**: Mobile viewport not properly handled in PWA mode
4. **Content-Type Issues**: HTML not served with proper content type

## Applied Fixes

### 1. Critical CSS Fixes (static/css/main.css)

- Added `!important` declarations for body visibility in standalone mode
- Forced black background and white text colors
- Added iOS Safari specific viewport fixes
- Ensured all navigation elements are visible

### 2. Service Worker Improvements (static/sw.js)

- Added special handling for PWA main pages (`/` and `/dashboard`)
- Ensured proper content-type headers for HTML responses
- Improved caching strategy for PWA standalone mode

### 3. JavaScript Initialization Fixes (static/js/pwa-utils.js)

- Added immediate visibility fixes for standalone mode
- Force display, visibility, and opacity properties
- Added console logging for debugging

### 4. Template Improvements (templates/base.html)

- Added immediate PWA fixes before DOM content loads
- Enhanced service worker registration with better error handling
- Added standalone mode detection and fixes

## Testing Steps

### 1. Run the PWA Test Script

```bash
python test_pwa.py http://localhost:5000
```

### 2. Manual Testing

1. **Clear Browser Cache**: Clear all cache and storage for the site
2. **Uninstall PWA**: Remove the installed PWA from your device
3. **Reinstall PWA**: Install the PWA fresh from the website
4. **Check Console**: Open developer tools and check for errors

### 3. Debug Page

Visit `/pwa-debug` for detailed diagnostics including:

- Service Worker status
- Display mode detection
- Element visibility status
- Console logs

## Common Solutions

### If Still Black Screen:

1. **Hard Refresh**: Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Clear Service Worker**: Go to Application tab → Service Workers → Unregister
3. **Check Network**: Ensure all static files are loading properly
4. **Test Offline**: Visit `/offline` to see if offline page works

### Browser-Specific Issues:

- **Chrome**: Clear site data completely
- **Safari**: Reset website data in Settings
- **Firefox**: Clear site data and cookies

## Debug Information

### Check These URLs:

- `/manifest.json` - Should return valid JSON
- `/static/sw.js` - Should return JavaScript
- `/api/pwa/version` - Should return version info
- `/offline` - Should show offline page

### Console Commands:

```javascript
// Check if PWA is in standalone mode
console.log(
  "Standalone:",
  window.matchMedia("(display-mode: standalone)").matches
);

// Check service worker status
navigator.serviceWorker
  .getRegistration()
  .then((reg) => console.log("SW:", reg));

// Force visibility
document.body.style.display = "block";
document.body.style.visibility = "visible";
document.body.style.opacity = "1";
```

## Prevention

- Always test PWA in standalone mode during development
- Use the debug page to monitor PWA status
- Clear cache when making significant changes
- Test on multiple devices and browsers

## Support

If issues persist:

1. Check browser console for errors
2. Visit `/pwa-debug` for detailed diagnostics
3. Test with the provided test script
4. Clear all cache and reinstall PWA
