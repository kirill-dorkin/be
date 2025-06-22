import BaseContainer from "@/components/BaseContainer";

export default function About() {
  return (
    <section id="about" className="py-20">
      <BaseContainer className="text-center space-y-4">
        <h2 className="text-3xl font-bold">О компании</h2>
        <p className="max-w-2xl mx-auto">
          Best Electronics специализируется на ремонте и модернизации ноутбуков и
          другой электроники. Мы ценим качество работы и предлагаем индивидуальный
          подход к каждому клиенту.
        </p>
      </BaseContainer>
    </section>
  );
}
