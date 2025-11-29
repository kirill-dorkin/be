"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

type LocalListing = {
  category: string;
  contact: string;
  description: string;
  photoUrl?: string;
  price: string;
  title: string;
};

const STORAGE_KEY = "be-seller-listings";

export const MyListings = () => {
  const [listings, setListings] = useState<LocalListing[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setListings(JSON.parse(stored));
      }
    } catch {
      setListings([]);
    }
  }, []);

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setListings([]);
  };

  if (!listings.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Черновики товаров</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Здесь появятся последние заявки, которые вы отправили. Список хранится только локально в браузере.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Мои последние заявки</h2>
        <Button size="sm" variant="ghost" className="gap-2" onClick={handleClear}>
          <Trash2 className="h-4 w-4" /> Очистить
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {listings.map((listing, index) => (
          <Card key={`${listing.title}-${index}`} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{listing.category}</span>
                <span className="rounded-full bg-muted px-2 py-1">Цена: {listing.price}</span>
              </div>
              <CardTitle className="text-base">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="line-clamp-3 leading-relaxed">{listing.description}</p>
              {listing.photoUrl && (
                <a
                  href={listing.photoUrl}
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Фото
                </a>
              )}
              <p className="text-xs text-foreground">Контакт: {listing.contact}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
