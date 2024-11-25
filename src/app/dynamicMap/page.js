import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Ensure Leaflet CSS is imported

const SetMarkers = ({ setStart, setEnd }) => {
  const [isStartSet, setIsStartSet] = useState(false);

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      if (!isStartSet) {
        setStart([lat, lng]);
        setIsStartSet(true);
      } else {
        setEnd([lat, lng]);
      }
    },
  });

  return null;
};

export default function DynamicMap() {
  const [start, setStart] = useState(null); // Start point
  const [end, setEnd] = useState(null); // End point
  const [route, setRoute] = useState(null); // Route coordinates
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (start && end) {
        try {
          const response = await fetch(`/api/route?start=${start.join(",")}&end=${end.join(",")}`);
          const data = await response.json();

          if (data.geometry) {
            const coordinates = JSON.parse(data.geometry).coordinates.map(([lng, lat]) => [lat, lng]);
            setRoute(coordinates);
          }
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      }
    };

    fetchRoute();
  }, [start, end]);

  useEffect(() => {
    return () => {
      // Clean up Leaflet map container
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
      whenCreated={(mapInstance) => {
        if (!mapRef.current) {
          mapRef.current = mapInstance;
        }
      }}
      key={`${start || ""}-${end || ""}`} // Reinitialize map when markers change
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {start && <Marker position={start} />}
      {end && <Marker position={end} />}
      {route && <Polyline positions={route} color="blue" weight={5} opacity={0.8} />}
      <SetMarkers setStart={setStart} setEnd={setEnd} />
    </MapContainer>
  );
}
