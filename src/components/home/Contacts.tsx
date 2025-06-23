import BaseContainer from "@/components/BaseContainer";
import Link from "next/link";

export default function Contacts() {
  return (
    <section id="contacts" className="py-20">
      <BaseContainer className="space-y-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold">Контакты</h2>
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <p>Кулатова 8/1, Бишкек</p>
            <p>
              <a href="tel:+996501313114" className="underline">
                +996 501‑31‑31‑14
              </a>{" "}
              |{" "}
              <a href="tel:+996557313114" className="underline">
                +996 557‑31‑31‑14
              </a>
            </p>
            <p>
              <Link
                href="https://go.2gis.com/"
                className="underline"
                target="_blank"
              >
                Посмотреть на карте
              </Link>
            </p>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow">
            <iframe
              title="Карта проезда"
              src="https://www.openstreetmap.org/export/embed.html?bbox=74.6159%2C42.8575%2C74.6179%2C42.8595&layer=mapnik&marker=42.85848%2C74.61693"
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </BaseContainer>
    </section>
  );
}
