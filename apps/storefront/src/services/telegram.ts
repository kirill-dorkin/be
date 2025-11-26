import { serverEnvs } from "@/envs/server";

const FALLBACK_TELEGRAM_TOKEN =
  "8534764498:AAGdC5YUl9GkmsV_usRuy6NVAb9lj2ncaP0";
const FALLBACK_CHAT_ID = "-1003390998915"; // test channel

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

const escapeMarkdown = (value: string) =>
  value.replace(/[_*[\]()`~>#+\-=|{}.!]/g, (match) => `\\${match}`);

const formatMessage = (payload: WorkerApplicationPayload) => {
  const { firstName, lastName, email, phone, role, passwordLength } = payload;

  return [
    "*Новая заявка на подключение*",
    "",
    `*Роль:* ${escapeMarkdown(role)}`,
    `*Имя:* ${escapeMarkdown(firstName)} ${escapeMarkdown(lastName)}`,
    `*Email:* ${escapeMarkdown(email)}`,
    `*Телефон:* ${escapeMarkdown(phone)}`,
    `*Пароль:* ${"•".repeat(Math.max(6, Math.min(passwordLength, 12)))} (${passwordLength} символов)`,
    `*Отправлено:* ${escapeMarkdown(new Date().toISOString())}`,
  ].join("\n");
};

export const sendWorkerApplicationToTelegram = async (
  payload: WorkerApplicationPayload,
): Promise<TelegramResult> => {
  const token = serverEnvs.TELEGRAM_BOT_TOKEN ?? FALLBACK_TELEGRAM_TOKEN;
  const chatId = serverEnvs.TELEGRAM_CHAT_ID ?? FALLBACK_CHAT_ID;

  if (!token || !chatId) {
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

  try {
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      let errorMessage = "Failed to send Telegram notification.";

      try {
        const parsed = (await response.json()) as { description?: string };

        if (parsed?.description) {
          errorMessage = parsed.description;
        }
      } catch {
        const text = await response.text();

        if (text) {
          errorMessage = text;
        }
      }

      return {
        ok: false,
        error: [
          {
            code: "TELEGRAM_SEND_FAILED",
            message: errorMessage,
          },
        ],
      };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error while sending Telegram notification.";

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
