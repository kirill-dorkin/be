"use client";
import BaseContainer from "@/components/BaseContainer";

export default function About() {
  return (
    <section id="about">
      <BaseContainer className="py-16">
        <h2 className="text-3xl font-bold mb-4 text-center">О компании</h2>
        <p className="max-w-2xl mx-auto text-center">
          Best Electronics занимается ремонтом и модернизацией электроники. Наш опыт
          позволяет быстро находить решения и гарантировать качество работ.
        </p>
      </BaseContainer>
    </section>
  );
}
