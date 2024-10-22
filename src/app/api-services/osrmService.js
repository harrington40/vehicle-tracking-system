// osrmService.js
const OSRM_BASE_URL = 'http://127.0.0.1:5000'; // Change this to your OSRM backend URL

// Function to fetch route from OSRM backend and simulate stop points
export const fetchRouteWithStops = async (start, end) => {
  try {
    const osrmUrl = `${OSRM_BASE_URL}/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    
    const response = await fetch(osrmUrl);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      // OSRM returns coordinates as [lng, lat], we need [lat, lng] for Leaflet
      const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);

      // Simulate stops along the route (for demo purposes, add stops every 3rd point)
      const stops = coordinates.filter((_, index) => index % 10 === 0); // Pick every 10th point as a stop

      return { route: coordinates, stops };
    } else {
      console.warn('No route found');
      return { route: [], stops: [] };
    }
  } catch (error) {
    console.error('Error fetching route:', error);
    return { route: [], stops: [] };
  }
};
