export default async function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { start, end } = req.query;
  
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end coordinates are required.' });
    }
  
    try {
      const osrmUrl = `http://127.0.0.1:5000/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;
      const response = await fetch(osrmUrl);
      const data = await response.json();
  
      if (data.code !== 'Ok') {
        throw new Error(data.message || 'OSRM routing error');
      }
  
      res.status(200).json(data.routes[0]);
    } catch (error) {
      console.error('Error fetching route:', error);
      res.status(500).json({ error: 'Failed to fetch route' });
    }
  }
  