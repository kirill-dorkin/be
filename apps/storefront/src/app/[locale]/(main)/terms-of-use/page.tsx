import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

import { type SupportedLocale } from "@/regions/types";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    title: t("static-pages.terms-of-use"),
    description: t("footer.open-source"),
  };
}

const termsSections = [
  {
    title: "1. Основные положения",
    items: [
      "Используя сайт, вы подтверждаете согласие с настоящими условиями.",
      "Сервис предоставляется на условиях «как есть»; мы можем обновлять функциональность и текции без уведомления.",
    ],
  },
  {
    title: "2. Аккаунт и безопасность",
    items: [
      "Вы отвечаете за конфиденциальность данных входа и все действия, совершённые с вашим аккаунтом.",
      "При подозрении на компрометацию аккаунта свяжитесь с поддержкой и смените пароль.",
    ],
  },
  {
    title: "3. Заказы и платежи",
    items: [
      "Цены и наличие товаров могут изменяться до момента подтверждения заказа.",
      "Оплата проводится через проверенные провайдеры; реквизиты карты не сохраняются в нашей системе.",
    ],
  },
  {
    title: "4. Доставка и сервис",
    items: [
      "Сроки и стоимость доставки зависят от выбранного способа и адреса.",
      "Услуги ремонта выполняются по согласованной смете; статус заявки доступен в личном кабинете.",
    ],
  },
  {
    title: "5. Возвраты и гарантии",
    items: [
      "Вы можете оформить возврат или гарантийное обращение согласно действующему законодательству и условиям магазина.",
      "Для регистрации возврата используйте раздел заказов в личном кабинете или обратитесь в поддержку.",
    ],
  },
  {
    title: "6. Ограничение ответственности",
    items: [
      "Мы не несем ответственности за косвенные убытки, вызванные использованием сервиса, за исключением случаев, предусмотренных законом.",
      "Материалы на сайте могут содержать технические неточности; мы исправляем их по мере обнаружения.",
    ],
  },
  {
    title: "7. Конфиденциальность и данные",
    items: [
      "Обработка данных регулируется Политикой конфиденциальности.",
      "Вы можете запросить копию, исправление или удаление данных согласно политике и требованиям закона.",
    ],
  },
  {
    title: "8. Контакты",
    items: [
      "Поддержка: support@bestelectronics.com",
      "Юридические вопросы: legal@bestelectronics.com",
    ],
  },
];

export default async function TermsOfUsePage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return (
    <div className="container py-8 sm:py-12 lg:py-16">
      <header className="space-y-3 text-center sm:space-y-4">
        <span className="text-primary inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          {t("static-pages.terms-of-use")}
        </span>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Условия использования
        </h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-sm leading-relaxed sm:text-base">
          Правила работы с BestElectronics: аккаунт, заказы, платежи, доставка, возвраты и ответственность.
          Пожалуйста, ознакомьтесь перед использованием сервиса.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-2">
        {termsSections.map((section) => (
          <Card key={section.title} className="border border-border/70 bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-foreground sm:text-xl">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm leading-relaxed sm:text-base">
              <ul className="list-disc space-y-1 pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
