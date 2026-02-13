// Location data
// const locations = [
//   { id: 1, name: "3CAT", lat: 33.6977, lng: -117.8268, fact: "The District's hidden gem for handcrafted tea!" },
//   { id: 2, name: "The LAB / Booth by Bryant", lat: 33.6750, lng: -117.8860, fact: "This was a former night-vision goggle factory!" },
//   { id: 3, name: "Noguchi Garden", lat: 33.6889, lng: -117.8822, fact: "This is a 'hidden' 1.6-acre sculpture garden." },
//   { id: 4, name: "Holey Moley", lat: 33.6512, lng: -117.7452, fact: "Every hole is a pop-culture pun!" },
//   { id: 5, name: "Puesto", lat: 33.6402, lng: -117.7423, fact: "The tortillas are organic blue corn from Mexico." },
//   { id: 6, name: "Bacio di Latte", lat: 33.6510, lng: -117.7465, fact: "Authentic Italian gelato using Sonoma County milk." }
// ];

const locations = [
  { id: 1, name: "my house lol", lat: 33.66, lng: -117.80428, fact: "this is for testing purposes" },
  { id: 2, name: "her house", lat: 33.6522412, lng: -117.8342006, fact: "this is for testing purposes" },
  { id: 3, name: "3CAT", lat: 33.6977, lng: -117.8268, fact: "The District's hidden gem for handcrafted tea!" },
  { id: 4, name: "The LAB / Booth by Bryant", lat: 33.6750, lng: -117.8860, fact: "This was a former night-vision goggle factory!" },
  { id: 5, name: "Noguchi Garden", lat: 33.6889, lng: -117.8822, fact: "This is a 'hidden' 1.6-acre sculpture garden." },
  { id: 6, name: "Holey Moley", lat: 33.6512, lng: -117.7452, fact: "Every hole is a pop-culture pun!" },
  { id: 7, name: "Puesto", lat: 33.6402, lng: -117.7423, fact: "The tortillas are organic blue corn from Mexico." },
  { id: 8, name: "Bacio di Latte", lat: 33.6510, lng: -117.7465, fact: "Authentic Italian gelato using Sonoma County milk." }
];
// Configuration
const PROXIMITY_THRESHOLD_DEFAULT = 0.15; // 150 meters in km
const PROXIMITY_THRESHOLD_CLOSE = 0.075; // 75 meters for close locations
const CLOSE_LOCATIONS = [5, 6]; // Puesto and Bacio di Latte
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// State management
let userLat = null;
let userLng = null;
let watchId = null;
let unlockedLocations = [];
let debugMode = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Handle Valentine invitation
  const acceptBtn = document.getElementById('acceptBtn');
  const inviteOverlay = document.getElementById('inviteOverlay');
  const mainContent = document.getElementById('mainContent');
  
  // Check if invitation was already accepted
  if (localStorage.getItem('invitationAccepted') === 'true') {
    inviteOverlay.style.display = 'none';
    mainContent.style.display = 'block';
    initializeApp();
    return;
  }
  
  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('invitationAccepted', 'true');
    inviteOverlay.style.animation = 'fadeOut 0.5s ease';
    setTimeout(() => {
      inviteOverlay.style.display = 'none';
      mainContent.style.display = 'block';
      initializeApp();
    }, 500);
  });
});

// Initialize the main app after invitation is accepted
function initializeApp() {
  debugMode = new URLSearchParams(window.location.search).has('debug');
  
  if (debugMode) {
    document.getElementById('debugInfo').style.display = 'block';
    document.getElementById('unlockAllBtn').addEventListener('click', unlockAllLocations);
    document.getElementById('resetBtn').addEventListener('click', resetProgress);
  }
  
  loadUnlockedLocations();
  drawGraphPaper();
  renderLocationCards();
  updateProgress();
  
  // Check for geolocation support
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser. Please use a modern browser with GPS capabilities.');
    return;
  }
  
  // Request location permission
  requestLocationPermission();
}

// Draw graph paper background using Rough.js
function drawGraphPaper() {
  const canvas = document.getElementById('backgroundCanvas');
  const rc = rough.canvas(canvas);
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const spacing = 20;
  const ctx = canvas.getContext('2d');
  
  // Light pink grid
  ctx.strokeStyle = 'rgba(255, 182, 217, 0.3)';
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x < canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Thicker lines every 5 spaces (100px)
  ctx.strokeStyle = 'rgba(255, 105, 180, 0.4)';
  ctx.lineWidth = 2;
  
  for (let x = 0; x < canvas.width; x += spacing * 5) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  for (let y = 0; y < canvas.height; y += spacing * 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// Handle window resize
window.addEventListener('resize', drawGraphPaper);

// Request location permission
function requestLocationPermission() {
  const prompt = document.getElementById('permissionPrompt');
  const enableBtn = document.getElementById('enableLocationBtn');
  
  // Check if already granted
  if (localStorage.getItem('locationGranted') === 'true') {
    startTracking();
    return;
  }
  
  prompt.style.display = 'flex';
  
  enableBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        localStorage.setItem('locationGranted', 'true');
        prompt.style.display = 'none';
        startTracking();
      },
      (error) => {
        alert('Location permission denied. Please enable location services to use this app.');
        console.error('Geolocation error:', error);
      },
      GEOLOCATION_OPTIONS
    );
  });
}

// Start tracking user location
function startTracking() {
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
      
      if (debugMode) {
        document.getElementById('debugLat').textContent = userLat.toFixed(6);
        document.getElementById('debugLng').textContent = userLng.toFixed(6);
      }
      
      checkProximity();
    },
    (error) => {
      console.error('Geolocation error:', error);
    },
    GEOLOCATION_OPTIONS
  );
}

// Calculate distance using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // Returns distance in km
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Check proximity to locations
function checkProximity() {
  if (userLat === null || userLng === null) return;
  
  locations.forEach(location => {
    if (isLocationUnlocked(location.id)) return;
    
    // Check if location requires previous unlock (for close locations)
    if (location.id === 6 && !isLocationUnlocked(5)) {
      return; // Bacio di Latte requires Puesto to be unlocked first
    }
    
    const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
    const threshold = CLOSE_LOCATIONS.includes(location.id) 
      ? PROXIMITY_THRESHOLD_CLOSE 
      : PROXIMITY_THRESHOLD_DEFAULT;
    
    if (distance < threshold) {
      unlockLocation(location.id);
    }
  });
  
  // Update distance displays
  renderLocationCards();
}

// Unlock a location
function unlockLocation(locationId) {
  if (isLocationUnlocked(locationId)) return;
  
  unlockedLocations.push(locationId);
  saveUnlockedLocations();
  updateProgress();
  renderLocationCards();
  
  // Add celebratory animation
  const card = document.querySelector(`[data-location-id="${locationId}"]`);
  if (card) {
    card.classList.remove('locked');
    card.classList.add('unlocked');
  }
}

// Check if location is unlocked
function isLocationUnlocked(locationId) {
  return unlockedLocations.includes(locationId);
}

// Load unlocked locations from localStorage
function loadUnlockedLocations() {
  const saved = localStorage.getItem('unlockedLocations');
  if (saved) {
    unlockedLocations = JSON.parse(saved);
  }
}

// Save unlocked locations to localStorage
function saveUnlockedLocations() {
  localStorage.setItem('unlockedLocations', JSON.stringify(unlockedLocations));
}

// Update progress bar
function updateProgress() {
  const progress = (unlockedLocations.length / locations.length) * 100;
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('progressText').textContent = 
    `${unlockedLocations.length} of ${locations.length} discovered`;
}

// Render location cards
function renderLocationCards() {
  const grid = document.getElementById('locationGrid');
  grid.innerHTML = '';
  
  locations.forEach(location => {
    const isUnlocked = isLocationUnlocked(location.id);
    const card = document.createElement('div');
    card.className = `location-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.setAttribute('data-location-id', location.id);
    
    let content = `
      <div class="location-number">${location.id}</div>
    `;
    
    if (isUnlocked) {
      content += `
        <h2 class="location-name">${location.name}</h2>
        <p class="location-fact">${location.fact}</p>
      `;
    } else {
      content += `
        <div class="lock-icon">🔒</div>
        <h2 class="location-name">???</h2>
      `;
      
      // Show distance if we have user location
      if (userLat !== null && userLng !== null) {
        // Check if requires previous unlock
        if (location.id === 6 && !isLocationUnlocked(5)) {
          content += `<p class="distance-info">Unlock number 5 first!</p>`;
        } else {
          const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
          const distanceMeters = Math.round(distance * 1000);
          content += `<p class="distance-info">${distanceMeters}m away...</p>`;
        }
      } else {
        content += `<p class="distance-info">Getting your location...</p>`;
      }
    }
    
    card.innerHTML = content;
    grid.appendChild(card);
  });
}

// Debug function to unlock all locations
function unlockAllLocations() {
  locations.forEach(location => {
    if (!isLocationUnlocked(location.id)) {
      unlockLocation(location.id);
    }
  });
}

// Debug function to reset all progress
function resetProgress() {
  unlockedLocations = [];
  localStorage.removeItem('unlockedLocations');
  localStorage.removeItem('invitationAccepted');
  localStorage.removeItem('locationGranted');
  updateProgress();
  renderLocationCards();
  alert('Progress reset! All locations locked. Reload the page to see the invitation again.');
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }
});
