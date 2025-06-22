import BaseContainer from "@/components/BaseContainer";
import Link from "next/link";

export default function Contacts() {
  return (
    <section id="contacts" className="py-20">
      <BaseContainer className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Контакты</h2>
        <p>Кулатова 8/1, Бишкек</p>
        <p>
          <a href="tel:+996501313114" className="underline">
            +996 501‑31‑31‑14
          </a>{' '}|
          <a href="tel:+996557313114" className="underline">
            +996 557‑31‑31‑14
          </a>
        </p>
        <p>
          <Link href="https://go.2gis.com/" className="underline" target="_blank">
            Посмотреть на карте
          </Link>
        </p>
      </BaseContainer>
    </section>
  );
}
