export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return new Response(JSON.stringify({ error: 'Missing start or end parameters' }), { status: 400 });
  }

  const osrmUrl = `http://localhost:5000/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(osrmUrl);
    if (!response.ok) {
      throw new Error(`OSRM server error: ${response.statusText}`);
    }
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Error fetching route from OSRM:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch route from OSRM server' }), { status: 500 });
  }
}
