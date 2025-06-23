import React from "react";

export default function Map() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <iframe
        title="Карта расположения"
        src="https://www.openstreetmap.org/export/embed.html?bbox=74.6160,42.8580,74.6178,42.8592&layer=mapnik&marker=42.8585,74.6169"
        className="w-full h-full border-0"
        allowFullScreen
      />
    </div>
  );
}
