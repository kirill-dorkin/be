"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const position: [number, number] = [42.8585, 74.6169];
const mapId = "home-map";

export default function Map() {
  useEffect(() => {
    const container = L.DomUtil.get(mapId);
    if (container) {
      (container as any)._leaflet_id = null;
    }
    // Fix default icon paths when using Leaflet with Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        id={mapId}
        center={position}
        zoom={18}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='Map tiles by <a href="https://stamen.com">Stamen Design</a>, <a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Кулатова 8/1, Бишкек</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
