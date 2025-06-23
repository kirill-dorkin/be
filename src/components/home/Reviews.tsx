import BaseContainer from "@/components/BaseContainer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const data = [
  { id: 1, author: "Айзат", text: "Отличный сервис и быстрый ремонт." },
  { id: 2, author: "Бек", text: "Помогли вернуть ноутбук к жизни." },
  {
    id: 3,
    author: "Мария",
    text: "Качественно объяснили причину поломки и быстро исправили.",
  },
];

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 bg-muted/50">
      <BaseContainer className="max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-6">Отзывы клиентов</h2>
        <Carousel className="relative overflow-x-hidden">
          <CarouselContent>
            {data.map((r) => (
              <CarouselItem
                key={r.id}
                className="basis-full sm:basis-1/2 lg:basis-1/3 flex justify-center"
              >
                <div className="p-6 bg-background rounded shadow max-w-md w-full">
                  <p className="italic mb-2">&ldquo;{r.text}&rdquo;</p>
                  <p className="text-right font-semibold">— {r.author}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </BaseContainer>
    </section>
  );
}
