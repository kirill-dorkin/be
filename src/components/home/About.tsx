import BaseContainer from "@/components/BaseContainer";
import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="py-20 bg-muted/50">
      <BaseContainer>
        <div className="grid gap-8 items-center text-center lg:text-left lg:grid-cols-about">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">О компании</h2>
            <p>
              Best Electronics специализируется на ремонте и модернизации ноутбуков
              и другой электроники. Мы ценим качество работы и предлагаем
              индивидуальный подход к каждому клиенту.
            </p>
            <p>
              Наша команда мастеров постоянно совершенствует навыки, чтобы быстро
              находить решения и обеспечивать гарантированный результат.
            </p>
          </div>
          <div className="relative aspect-video max-w-xl mx-auto lg:mx-0 rounded-lg overflow-hidden shadow">
            <Image
              src="/images/laptop-store.jpg"
              alt="Мастерская Best Electronics"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 600px, 100vw"
            />
          </div>
        </div>
      </BaseContainer>
    </section>
  );
}
