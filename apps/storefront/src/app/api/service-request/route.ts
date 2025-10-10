import { NextResponse } from "next/server";
import { z } from "zod";

import { repairServiceBySlug } from "@/lib/repair-services/data";
import { storefrontLogger } from "@/services/logging";

const requestSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(5).max(40),
  email: z
    .string()
    .email()
    .max(120)
    .optional()
    .or(z.literal("").optional()),
  message: z.string().max(2000).optional(),
  deviceType: z.string().min(2).max(40),
  serviceSlug: z.string().min(2).max(120),
  urgent: z.boolean().optional().default(false),
  needsPickup: z.boolean().optional().default(false),
  preferredContact: z.enum(["phone", "email"]).optional(),
  priceEstimate: z
    .object({
      min: z.number().nullable(),
      max: z.number().nullable(),
      currency: z.string().min(3).max(3),
    })
    .optional(),
  consent: z.boolean().optional().default(false),
  modifiers: z
    .record(z.string(), z.number())
    .optional()
    .default({}),
});

type RequestPayload = z.infer<typeof requestSchema>;

const webhookHeaders = {
  "Content-Type": "application/json",
};

const formatLogContext = (payload: RequestPayload) => ({
  serviceSlug: payload.serviceSlug,
  deviceType: payload.deviceType,
  urgent: payload.urgent,
  needsPickup: payload.needsPickup,
});

export async function POST(request: Request) {
  let jsonBody: unknown;

  try {
    jsonBody = await request.json();
  } catch (error) {
    storefrontLogger.warning("[ServiceRequest] Invalid JSON payload.", {
      error,
    });

    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(jsonBody);

  if (!parsed.success) {
    storefrontLogger.warning("[ServiceRequest] Validation failed.", {
      issues: parsed.error.issues,
    });

    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed.",
        issues: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  const payload = parsed.data;
  const service = repairServiceBySlug(payload.serviceSlug);

  if (!service) {
    storefrontLogger.warning("[ServiceRequest] Service not found.", {
      serviceSlug: payload.serviceSlug,
    });

    return NextResponse.json(
      { ok: false, error: "SERVICE_NOT_FOUND" },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();

  const webhookBody = JSON.stringify({
    ...payload,
    createdAt: now,
    serviceName: service.name,
    group: service.group,
    category: service.category,
  });

  const webhookUrl = process.env.SERVICE_REQUEST_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: webhookHeaders,
        body: webhookBody,
      });

      if (!response.ok) {
        storefrontLogger.error(
          "[ServiceRequest] Webhook returned non-200 status.",
          {
            status: response.status,
            serviceSlug: service.slug,
          },
        );
      }
    } catch (error) {
      storefrontLogger.error("[ServiceRequest] Webhook request failed.", {
        error,
        ...formatLogContext(payload),
      });
    }
  } else {
    storefrontLogger.info(
      "[ServiceRequest] Webhook URL not configured, storing payload in logs only.",
      formatLogContext(payload),
    );
  }

  storefrontLogger.info("[ServiceRequest] Request processed successfully.", {
    ...formatLogContext(payload),
  });

  return NextResponse.json(
    {
      ok: true,
      receivedAt: now,
    },
    { status: 200 },
  );
}

export const runtime = "nodejs";
