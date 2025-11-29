"use client";

import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://widgets.2gis.com/js/DGWidgetLoader.js";

export function ContactMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );

    if (existing) {
      if (existing.dataset.loaded === "true") {
        setScriptReady(true);
      } else {
        const onLoad = () => setScriptReady(true);
        existing.addEventListener("load", onLoad);
        return () => existing.removeEventListener("load", onLoad);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      setScriptReady(true);
    };
    script.onerror = () => setFailed(true);
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !containerRef.current) return;
    // 2ГИС может выбрасывать ошибки, страхуемся try/catch
    try {
      containerRef.current.innerHTML = "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const DGWidgetLoader = (window as any).DGWidgetLoader;
      if (DGWidgetLoader) {
        new DGWidgetLoader({
          width: "100%",
          height: 320,
          border: "none",
          cornerRadius: 12,
          pos: { lat: 42.848524, lon: 74.595204, zoom: 17 },
          opt: { city: "bishkek" },
          org: [{ id: "70000001058839512", name: "BestElectronics" }],
          widget: "firmsonmap",
        });
      } else {
        setFailed(true);
      }
    } catch (_e) {
      setFailed(true);
    }
  }, [scriptReady]);

  return (
    <div
      ref={containerRef}
      className="relative h-72 overflow-hidden rounded-xl border border-border/60 bg-card"
    >
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground text-sm">
            Карта недоступна, попробуйте открыть 2ГИС по ссылке ниже.
          </p>
        </div>
      )}
    </div>
  );
}
