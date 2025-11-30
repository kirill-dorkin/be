"use client";

const MAP_SRC =
  "https://widgets.2gis.com/widget?type=firmsonmap&options=%7B%22pos%22%3A%7B%22lat%22%3A42.848524%2C%22lon%22%3A74.595204%2C%22zoom%22%3A17%7D%2C%22opt%22%3A%7B%22city%22%3A%22bishkek%22%7D%2C%22org%22%3A%2270000001058839512%22%7D";

export function ContactMap() {
  return (
    <div className="bg-card relative h-72 overflow-hidden rounded-xl">
      <iframe
        src={MAP_SRC}
        title="BestElectronics на карте 2ГИС"
        className="h-full w-full border-0"
        loading="lazy"
        allowFullScreen
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl border border-transparent bg-gradient-to-b from-transparent to-transparent" />
    </div>
  );
}
