import { serverEnvs } from "@/envs/server";
import { storefrontLogger } from "@/services/logging";

type TelegramResult =
  | { ok: true }
  | { error: Array<{ code: string; message: string }>; ok: false };

type WorkerApplicationPayload = {
  email: string;
  firstName: string;
  lastName: string;
  passwordLength: number;
  phone: string;
  role: string;
};

type SellerListingPayload = {
  category: string;
  contact: string;
  description: string;
  photoUrl?: string;
  price: number;
  title: string;
};

const escapeMarkdownV2 = (text: string): string =>
  text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");

const formatMessage = (payload: WorkerApplicationPayload) => {
  const { firstName, lastName, email, phone, role, passwordLength } = payload;

  const passwordDots = "•".repeat(Math.max(6, Math.min(passwordLength, 12)));
  const timestamp = new Date().toISOString();

  return [
    "*Новая заявка на подключение*",
    "",
    `*Роль:* ${escapeMarkdownV2(role)}`,
    `*Имя:* ${escapeMarkdownV2(firstName)} ${escapeMarkdownV2(lastName)}`,
    `*Email:* ${escapeMarkdownV2(email)}`,
    `*Телефон:* ${escapeMarkdownV2(phone)}`,
    `*Пароль:* ${passwordDots} ${escapeMarkdownV2(`(${passwordLength} символов)`)}`,
    `*Отправлено:* ${escapeMarkdownV2(timestamp)}`,
  ].join("\n");
};

const formatListingMessage = (payload: SellerListingPayload) => {
  const timestamp = new Date().toISOString();

  const lines = [
    "*Новая заявка продавца*",
    `*Товар:* ${escapeMarkdownV2(payload.title)}`,
    `*Категория:* ${escapeMarkdownV2(payload.category)}`,
    `*Цена:* ${escapeMarkdownV2(`${payload.price}`)}`,
    `*Описание:* ${escapeMarkdownV2(payload.description)}`,
    `*Контакт:* ${escapeMarkdownV2(payload.contact)}`,
    `*Отправлено:* ${escapeMarkdownV2(timestamp)}`,
  ];

  if (payload.photoUrl) {
    lines.splice(5, 0, `*Фото:* ${escapeMarkdownV2(payload.photoUrl)}`);
  }

  return lines.join("\n");
};

const fetchWithTimeout = async (
  url: string,
  body: Record<string, string>,
  timeoutMs: number,
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timer);
  }
};

export const sendWorkerApplicationToTelegram = async (
  payload: WorkerApplicationPayload,
): Promise<TelegramResult> => {
  // TODO: Persist applications locally (DB/file/queue) to avoid loss during Telegram downtime.
  const token = serverEnvs.TELEGRAM_BOT_TOKEN;
  const chatId = serverEnvs.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    storefrontLogger.error("[Telegram] Missing bot token or chat id", {
      email: payload.email,
      phone: payload.phone,
    });

    return {
      ok: false,
      error: [
        {
          code: "TELEGRAM_CONFIG_MISSING",
          message: "Telegram bot token or chat id is not configured.",
        },
      ],
    };
  }

  const text = formatMessage(payload);
  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

  const body: Record<string, string> = {
    chat_id: chatId,
    text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: "true",
  };

  if (serverEnvs.TELEGRAM_THREAD_ID) {
    body.message_thread_id = serverEnvs.TELEGRAM_THREAD_ID;
  }

  const maxAttempts = 2;
  let lastError = "Failed to send Telegram notification.";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(telegramUrl, body, 8000);

      if (response.ok) {
        storefrontLogger.info("[Telegram] Application sent", {
          email: payload.email,
          phone: payload.phone,
        });

        return { ok: true };
      }

      if (response.status === 429) {
        return {
          ok: false,
          error: [
            {
              code: "RATE_LIMITED",
              message:
                "Telegram rate limit. Please wait before sending another request.",
            },
          ],
        };
      }

      let errorMessage = "Failed to send Telegram notification.";
      const responseText = await response.clone().text();

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText) as { description?: string };

          if (parsed?.description) {
            errorMessage = parsed.description;
          } else {
            errorMessage = responseText;
          }
        } catch {
          errorMessage = responseText;
        }
      }

      lastError = errorMessage;
      storefrontLogger.error("[Telegram] Send failed", {
        attempt,
        email: payload.email,
        phone: payload.phone,
        error: errorMessage,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = "Telegram request timed out.";
      } else {
        lastError =
          error instanceof Error
            ? error.message
            : "Unexpected error while sending Telegram notification.";
      }

      storefrontLogger.error("[Telegram] Request error", {
        attempt,
        email: payload.email,
        phone: payload.phone,
        error: lastError,
      });
    }
  }

  return {
    ok: false,
    error: [
      {
        code: "TELEGRAM_REQUEST_ERROR",
        message: lastError,
      },
    ],
  };
};

export const sendSellerListingToTelegram = async (
  payload: SellerListingPayload,
): Promise<TelegramResult> => {
  const token = serverEnvs.TELEGRAM_BOT_TOKEN;
  const chatId = serverEnvs.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    storefrontLogger.error(
      "[Telegram] Missing bot token or chat id for listing",
      {
        title: payload.title,
        contact: payload.contact,
      },
    );

    return {
      ok: false,
      error: [
        {
          code: "TELEGRAM_CONFIG_MISSING",
          message: "Telegram bot token or chat id is not configured.",
        },
      ],
    };
  }

  const text = formatListingMessage(payload);
  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

  const body: Record<string, string> = {
    chat_id: chatId,
    text,
    parse_mode: "MarkdownV2",
    disable_web_page_preview: "false",
  };

  if (serverEnvs.TELEGRAM_THREAD_ID) {
    body.message_thread_id = serverEnvs.TELEGRAM_THREAD_ID;
  }

  try {
    const response = await fetchWithTimeout(telegramUrl, body, 8000);

    if (!response.ok) {
      const message = await response.text();

      storefrontLogger.error("[Telegram] Listing send failed", {
        status: response.status,
        title: payload.title,
        error: message,
      });

      return {
        ok: false,
        error: [
          {
            code: "TELEGRAM_REQUEST_ERROR",
            message: message || "Failed to send listing.",
          },
        ],
      };
    }

    storefrontLogger.info("[Telegram] Listing sent", { title: payload.title });

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while sending Telegram notification.";

    storefrontLogger.error("[Telegram] Listing request error", {
      title: payload.title,
      error: message,
    });

    return {
      ok: false,
      error: [
        {
          code: "TELEGRAM_REQUEST_ERROR",
          message,
        },
      ],
    };
  }
};
