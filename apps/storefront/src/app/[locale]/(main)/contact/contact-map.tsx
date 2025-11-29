"use client";

import { useEffect, useRef, useState } from "react";

const MAP_CENTER: [number, number] = [42.848524, 74.595204];
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const LEAFLET_STYLE_ID = "leaflet-css";
const LEAFLET_SCRIPT_ID = "leaflet-js";
const LEAFLET_STYLE_HREF = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_SCRIPT_SRC = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

export function ContactMap() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ensureStyles = () => {
      if (!document.getElementById(LEAFLET_STYLE_ID)) {
        const link = document.createElement("link");
        link.id = LEAFLET_STYLE_ID;
        link.rel = "stylesheet";
        link.href = LEAFLET_STYLE_HREF;
        document.head.appendChild(link);
      }
    };

    const loadScript = () =>
      new Promise<void>((resolve, reject) => {
        const existing = document.getElementById(LEAFLET_SCRIPT_ID) as
          | HTMLScriptElement
          | null;
        if (existing && (window as any).L) {
          resolve();
          return;
        }
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", reject);
          return;
        }
        const script = document.createElement("script");
        script.id = LEAFLET_SCRIPT_ID;
        script.src = LEAFLET_SCRIPT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.body.appendChild(script);
      });

    ensureStyles();

    loadScript()
      .then(() => {
        const L = (window as any).L;
        if (!mapEl.current || !L) {
          setFailed(true);
          return;
        }
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
        const map = L.map(mapEl.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
        }).setView(MAP_CENTER, 17);

        L.tileLayer(TILE_URL, {
          attribution: ATTRIBUTION,
          maxZoom: 19,
        }).addTo(map);

        L.marker(MAP_CENTER).addTo(map);
        mapInstance.current = map;
      })
      .catch(() => setFailed(true));

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  return (
    <div
      ref={mapEl}
      className="relative h-72 overflow-hidden rounded-xl bg-muted"
      aria-label="Карта офиса BestElectronics"
    >
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Карта недоступна, откройте 2ГИС по ссылке ниже.
        </div>
      )}
    </div>
  );
}
