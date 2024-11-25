"use client"
import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const MapWithRouting = ({ start = [51.505, -0.09], end = [51.51, -0.1] }) => {
  const RoutingMachine = () => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(start[0], start[1]),
          L.latLng(end[0], end[1]),
        ],
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
        }),
        lineOptions: {
          styles: [{ color: "blue", weight: 4 }],
        },
        show: true,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: function (i, waypoint, n) {
          return L.marker(waypoint.latLng, {
            draggable: true,
          });
        },
      }).addTo(map);

      return () => {
        map.removeControl(routingControl);
      };
    }, [map]);

    return null;
  };

  return (
    <MapContainer
      center={start}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <RoutingMachine />
    </MapContainer>
  );
};

export default MapWithRouting;
