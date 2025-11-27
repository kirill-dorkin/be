import { serverEnvs } from "@/envs/server";

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
  const token = serverEnvs.TELEGRAM_BOT_TOKEN;
  const chatId = serverEnvs.TELEGRAM_CHAT_ID;

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

  const maxAttempts = 2;
  let lastError = "Failed to send Telegram notification.";

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(telegramUrl, body, 8000);

      if (response.ok) {
        return { ok: true };
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
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = "Telegram request timed out.";
      } else {
        lastError =
          error instanceof Error
            ? error.message
            : "Unexpected error while sending Telegram notification.";
      }
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
