export default async function handler(req, res) {
    const { start, end } = req.query;
  
    if (!start || !end) {
      return res.status(400).json({ error: "Start and end points are required." });
    }
  
    try {
      // Replace with your OSRM server URL
      const osrmUrl = `http://localhost:5000/route/v1/driving/${start};${end}?geometries=geojson`;
      const response = await fetch(osrmUrl);
      const data = await response.json();
  
      if (data.routes && data.routes.length > 0) {
        return res.status(200).json({ geometry: JSON.stringify(data.routes[0].geometry) });
      }
  
      res.status(404).json({ error: "No routes found" });
    } catch (error) {
      console.error("Error fetching route from OSRM:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  