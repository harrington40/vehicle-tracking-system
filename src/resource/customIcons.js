import L from 'leaflet';

// Define a custom icon for car
export const carIcon = new L.Icon({
  iconUrl: '/icons/car.svg', // Replace with actual path
  iconSize: [32, 32], // Icon size
  iconAnchor: [16, 32], // Anchor point to position the icon on the map
});

// Define a custom icon for motorbike
export const motorbikeIcon = new L.Icon({
  iconUrl: '/path/to/motorbike-icon.png', // Replace with actual path
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Define a custom icon for person
export const personIcon = new L.Icon({
  iconUrl: '/path/to/person-icon.png', // Replace with actual path
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
