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

  const response = await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // Telegram API is external; if it fails, we want the error back
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    return {
      ok: false,
      error: [
        {
          code: "TELEGRAM_SEND_FAILED",
          message: errorText || "Failed to send Telegram notification.",
        },
      ],
    };
  }

  return { ok: true };
};
