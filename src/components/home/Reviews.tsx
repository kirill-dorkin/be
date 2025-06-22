"use client";
import BaseContainer from "@/components/BaseContainer";

const reviews = [
  {
    id: 1,
    author: "Алексей",
    text: "Быстро починили мой ноутбук и дали гарантию на ремонт."
  },
  {
    id: 2,
    author: "Мария",
    text: "Отличный сервис и вежливый персонал. Рекомендую всем!"
  },
  {
    id: 3,
    author: "Игорь",
    text: "Помогли подобрать комплектующие для апгрейда компьютера."
  }
];

export default function Reviews() {
  return (
    <section id="reviews">
      <BaseContainer className="py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Отзывы клиентов</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="p-4 border rounded-lg shadow-sm">
              <p className="mb-2 italic">"{r.text}"</p>
              <p className="text-right font-medium">— {r.author}</p>
            </div>
          ))}
        </div>
      </BaseContainer>
    </section>
  );
}
