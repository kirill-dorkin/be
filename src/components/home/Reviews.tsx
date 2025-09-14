"use client"
import BaseContainer from '@/components/BaseContainer'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { FaStar } from 'react-icons/fa'
import { useTranslations } from 'next-intl'

interface Review {
  id: number
  name: string
  avatar: string
  text: string
}

const getReviews = (t: any): Review[] => [
  {
    id: 1,
    name: 'Айзат',
    avatar: 'https://i.pravatar.cc/150?img=3',
    text: t('reviews.items.review1')
  },
  {
    id: 2,
    name: 'Бек',
    avatar: 'https://i.pravatar.cc/150?img=5',
    text: t('reviews.items.review2')
  },
  {
    id: 3,
    name: 'Мария',
    avatar: 'https://i.pravatar.cc/150?img=7',
    text: t('reviews.items.review3')
  },
  {
    id: 4,
    name: 'Тимур',
    avatar: 'https://i.pravatar.cc/150?img=8',
    text: t('reviews.items.review4')
  },
]

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="shadow flex flex-col items-center text-center p-6">
      <Image
        src={review.avatar}
        alt={review.name}
        width={60}
        height={60}
        className="rounded-full mb-4"
      />
      <div className="flex gap-1 text-primary mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar key={i} className="size-4" />
        ))}
      </div>
      <p className="font-medium">{review.text}</p>
      <span className="mt-2 text-sm text-muted-foreground">— {review.name}</span>
    </Card>
  )
}

export default function Reviews() {
  const t = useTranslations()
  const reviews = getReviews(t)
  
  return (
    <section id="reviews" className="py-20 bg-muted/50">
      <BaseContainer>
        <h2 className="text-3xl font-bold text-center mb-12">{t('reviews.title')}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <ReviewCard review={review} key={review.id} />
          ))}
        </div>
      </BaseContainer>
    </section>
  )
}
