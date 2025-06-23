"use client";
import BaseContainer from "@/components/BaseContainer";
import Image from "next/image";

interface Review {
  id: number;
  name: string;
  nick: string;
  avatar: string;
  text: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Айзат",
    nick: "@aizat",
    avatar: "https://i.pravatar.cc/150?img=3",
    text: "Отличный сервис и быстрый ремонт.",
  },
  {
    id: 2,
    name: "Бек",
    nick: "@bek",
    avatar: "https://i.pravatar.cc/150?img=5",
    text: "Помогли вернуть ноутбук к жизни.",
  },
  {
    id: 3,
    name: "Мария",
    nick: "@maria",
    avatar: "https://i.pravatar.cc/150?img=7",
    text: "Качественно объяснили причину поломки и быстро исправили.",
  },
  {
    id: 4,
    name: "Тимур",
    nick: "@timur",
    avatar: "https://i.pravatar.cc/150?img=8",
    text: "Спасибо за профессиональный подход к ремонту!",
  },
  {
    id: 5,
    name: "Айдана",
    nick: "@aidana",
    avatar: "https://i.pravatar.cc/150?img=9",
    text: "Дали полезные советы по уходу за техникой.",
  },
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-background rounded-lg shadow p-4 flex w-64 items-start gap-3 transform transition-transform hover:scale-105">
      <Image
        src={review.avatar}
        alt={review.name}
        width={40}
        height={40}
        className="rounded-full flex-shrink-0"
      />
      <div className="space-y-1 text-sm">
        <div className="font-bold leading-none">{review.name}</div>
        <div className="text-muted-foreground text-xs">{review.nick}</div>
        <p className="mt-2 text-sm text-foreground">{review.text}</p>
      </div>
    </div>
  );
}

export default function Reviews() {
  const doubled = [...reviews, ...reviews];

  return (
    <section id="reviews" className="py-20 bg-muted/50">
      <BaseContainer>
        <h2 className="text-3xl font-bold text-center mb-6">Отзывы клиентов</h2>
        <div className="relative overflow-hidden rounded-lg group">
          <div className="absolute inset-0 pointer-events-none before:absolute before:left-0 before:top-0 before:h-full before:w-12 before:bg-gradient-to-r before:from-background before:via-background/70 before:to-transparent before:rounded-l-lg after:absolute after:right-0 after:top-0 after:h-full after:w-12 after:bg-gradient-to-l after:from-background after:via-background/70 after:to-transparent after:rounded-r-lg" />
          <div className="space-y-4 py-4">
            <div className="flex gap-4 whitespace-nowrap animate-marquee-right group-hover:[animation-play-state:paused]">
              {doubled.map((review, idx) => (
                <ReviewCard review={review} key={`top-${idx}`} />
              ))}
            </div>
            <div className="flex gap-4 whitespace-nowrap animate-marquee-left group-hover:[animation-play-state:paused]">
              {doubled.map((review, idx) => (
                <ReviewCard review={review} key={`bottom-${idx}`} />
              ))}
            </div>
          </div>
        </div>
      </BaseContainer>
    </section>
  );
}

