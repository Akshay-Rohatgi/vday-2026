# Valentine's Day Location Reveal Site 💕

A location-based interactive web experience that reveals date locations as you physically approach them. Built with vanilla JavaScript, Rough.js for hand-drawn aesthetics, and the Geolocation API.

## Features

- 📍 **GPS-based location reveals** - Locations unlock as you get within 75-150m
- 🎨 **Hand-drawn aesthetic** - Graph paper background and sketchy styling using Rough.js
- 💕 **Pink & white theme** - Romantic color palette with playful animations
- 📊 **Progress tracking** - Visual progress bar showing discovered locations
- 🔐 **Sequential unlocking** - Close locations (Puesto → Bacio di Latte) unlock in order
- 💾 **Persistent progress** - Uses localStorage to remember unlocked locations
- 🐛 **Debug mode** - Test without traveling using `?debug=true` URL parameter

## Locations

1. **3CAT** (33.6977, -117.8268) - The District's hidden gem for handcrafted tea
2. **The LAB / Booth by Bryant** (33.6750, -117.8860) - Former night-vision goggle factory
3. **Noguchi Garden** (33.6889, -117.8822) - Hidden 1.6-acre sculpture garden
4. **Holey Moley** (33.6512, -117.7452) - Pop-culture mini golf
5. **Puesto** (33.6402, -117.7423) - Organic blue corn tortillas from Mexico
6. **Bacio di Latte** (33.6510, -117.7465) - Italian gelato with Sonoma milk (unlocks after Puesto)

## Usage

### Local Development

Simply open `index.html` in a web browser, or use a local server:

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### Debug Mode

Add `?debug=true` to the URL to enable testing features:
- View your current GPS coordinates
- "Unlock All" button to reveal all locations without traveling

Example: `http://localhost:8000?debug=true`

### Deployment

Deploy as a static site to:
- **GitHub Pages**: Push to `gh-pages` branch or use Actions
- **Netlify**: Drag and drop the folder or connect to Git
- **Vercel**: Import the repository

## Technical Details

- **Proximity Thresholds**: 150m for most locations, 75m for Puesto/Bacio (they're only 1.21km apart)
- **Distance Calculation**: Haversine formula for accurate GPS distance
- **Fonts**: Google Fonts (Caveat, Indie Flower)
- **Libraries**: Rough.js via CDN for sketchy graphics
- **Browser Requirements**: Modern browser with Geolocation API support

## Files

- `index.html` - Main structure and markup
- `styles.css` - Styling with graph paper background and pink/white theme
- `script.js` - Geolocation logic, distance calculation, unlock mechanics

## Customization

### Change proximity threshold

Edit `PROXIMITY_THRESHOLD_DEFAULT` and `PROXIMITY_THRESHOLD_CLOSE` in `script.js`

### Add/remove locations

Modify the `locations` array in `script.js`

### Change colors

Update CSS variables in `:root` section of `styles.css`

---

Built with ❤️ for an unforgettable Valentine's Day adventure!
