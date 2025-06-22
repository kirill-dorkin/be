"use client";
import BaseContainer from "@/components/BaseContainer";
import Link from "next/link";

export default function Contacts() {
  return (
    <section id="contacts">
      <BaseContainer className="py-16">
        <h2 className="text-3xl font-bold mb-4 text-center">Контакты</h2>
        <div className="max-w-xl mx-auto text-center space-y-2">
          <p>Кыргызстан, г. Бишкек, ул. Примерная, 10</p>
          <p>
            Телефон: <Link href="tel:+996000000000" className="underline">+996 000 000 000</Link>
          </p>
          <p>Работаем ежедневно с 9:00 до 18:00</p>
        </div>
      </BaseContainer>
    </section>
  );
}
