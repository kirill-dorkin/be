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
    title: t("static-pages.privacy-policy"),
    description: t("footer.open-source"),
  };
}

const policySections = [
  {
    title: "Какие данные мы собираем",
    items: [
      "Контактные данные: имя, email, телефон.",
      "Данные учетной записи: история заказов, адреса доставки и оплаты.",
      "Технические данные: cookies, IP-адрес, данные устройства (для аналитики и безопасности).",
    ],
  },
  {
    title: "Зачем мы это делаем",
    items: [
      "Оформление и доставка заказов, предоставление сервисов ремонта.",
      "Поддержка клиентов и уведомления о статусе заказов и сервисных заявок.",
      "Аналитика для улучшения сервиса и защита от мошенничества.",
    ],
  },
  {
    title: "Как мы защищаем данные",
    items: [
      "Шифрование соединений (HTTPS) и ограничение доступа по ролям.",
      "Хранение только необходимого минимума данных и регулярный аудит прав доступа.",
      "Удаление или анонимизация данных по запросу и по окончании сроков хранения.",
    ],
  },
  {
    title: "Ваши права",
    items: [
      "Получить копию своих данных и узнать, как они используются.",
      "Изменить или удалить данные, ограничить обработку и отозвать согласие.",
      "Настроить предпочтения уведомлений и cookies в настройках профиля.",
    ],
  },
  {
    title: "С кем мы делимся данными",
    items: [
      "Платежные провайдеры и службы доставки — только в объеме, необходимом для выполнения заказа.",
      "Партнеры по сервису и ремонту — для выполнения ваших заявок.",
      "Если требуется по закону или для защиты наших прав и безопасности пользователей.",
    ],
  },
  {
    title: "Контакты по вопросам конфиденциальности",
    items: [
      "Email: privacy@bestelectronics.com",
      "Поддержка в разделе “Помощь” — для запросов на доступ, изменение или удаление данных.",
    ],
  },
];

export default async function PrivacyPolicyPage(props: PageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return (
    <div className="container py-8 sm:py-12 lg:py-16">
      <header className="space-y-3 text-center sm:space-y-4">
        <span className="text-primary inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          {t("static-pages.privacy-policy")}
        </span>
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          Политика конфиденциальности
        </h1>
        <p className="text-muted-foreground mx-auto max-w-3xl text-sm leading-relaxed sm:text-base">
          Мы бережно относимся к вашим данным и используем их только для работы магазина и сервиса ремонта.
          Ниже — кратко о том, что собираем, зачем и как защищаем.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-2">
        {policySections.map((section) => (
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
