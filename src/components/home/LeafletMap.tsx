'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletDivElement extends HTMLDivElement {
  _leaflet_id?: number;
}

export default function LeafletMap() {
  const containerRef = useRef<LeafletDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const positionRef = useRef<[number, number]>([42.85848, 74.61693]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up any previous Leaflet instance on this container
    if (container._leaflet_id) {
      try {
        delete container._leaflet_id;
      } catch {
        container._leaflet_id = undefined;
      }
    }

    if (mapRef.current) {
      mapRef.current.off();
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(container).setView(positionRef.current, 16);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    ).addTo(map);

    L.icon({
      iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    L.marker(positionRef.current).addTo(map);

    mapRef.current = map;

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" style={{ height: '100%', width: '100%' }} />;
}

