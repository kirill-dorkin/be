import BaseContainer from "@/shared/ui/BaseContainer";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccessPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <BaseContainer className="flex items-center justify-center">
        <Card className="w-full max-w-xl border border-border/70 bg-white/95 text-center shadow-lg shadow-slate-900/5">
          <CardContent className="space-y-6 px-10 py-12">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold">Спасибо за заказ!</h1>
              <p className="text-sm text-muted-foreground">
                Мы уже начали обработку заявки. Менеджер свяжется с вами в течение рабочего дня, чтобы подтвердить детали доставки.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-muted-foreground">
              Номер заказа: <span className="font-semibold text-foreground">{params.id}</span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Вернуться в каталог
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              >
                На главную
              </Link>
            </div>
          </CardContent>
        </Card>
      </BaseContainer>
    </main>
  );
}
