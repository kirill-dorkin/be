"use client";

const STATIC_MAP =
  "https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=74.595204,42.848524&z=17&l=map&size=650,400&pt=74.595204,42.848524,pm2rdl";

export function ContactMap() {
  return (
    <div className="relative h-72 overflow-hidden rounded-xl bg-card">
      <img
        src={STATIC_MAP}
        alt="BestElectronics на карте"
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
