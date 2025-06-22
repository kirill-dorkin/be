import BaseContainer from "@/components/BaseContainer";

const data = [
  { id: 1, author: "Айзат", text: "Отличный сервис и быстрый ремонт." },
  { id: 2, author: "Бек", text: "Помогли вернуть ноутбук к жизни." },
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 bg-muted/50">
      <BaseContainer>
        <h2 className="text-3xl font-bold text-center mb-6">Отзывы клиентов</h2>
        <ul className="space-y-4">
          {data.map((r) => (
            <li key={r.id} className="p-4 bg-background rounded">
              <p className="italic">"{r.text}"</p>
              <p className="text-right font-semibold">— {r.author}</p>
            </li>
          ))}
        </ul>
      </BaseContainer>
    </section>
  );
}
