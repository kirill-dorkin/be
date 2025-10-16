import { NextResponse } from "next/server";
import { z } from "zod";

import { repairServiceBySlug } from "@/lib/repair-services/data";
import { storefrontLogger } from "@/services/logging";
import { getServiceRequestService } from "@/services/service-request";

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

  const normalizedEmail = payload.email?.trim() ? payload.email.trim() : undefined;

  const serviceRequestService = await getServiceRequestService();
  const creationResult = await serviceRequestService.create({
    createdAt: now,
    request: {
      consent: payload.consent ?? false,
      deviceType: payload.deviceType,
      email: normalizedEmail,
      fullName: payload.fullName,
      message: payload.message,
      modifiers: payload.modifiers ?? {},
      needsPickup: payload.needsPickup ?? false,
      phone: payload.phone,
      preferredContact: payload.preferredContact,
      priceEstimate: payload.priceEstimate,
      serviceSlug: payload.serviceSlug,
      urgent: payload.urgent ?? false,
    },
    service: {
      category: service.category,
      group: service.group,
      name: service.name,
      slug: service.slug,
    },
  });

  if (!creationResult.ok) {
    storefrontLogger.error("[ServiceRequest] Failed to create Saleor task.", {
      errors: creationResult.errors,
      ...formatLogContext(payload),
    });

    return NextResponse.json(
      { ok: false, error: "TASK_CREATION_FAILED" },
      { status: 502 },
    );
  }

  const { assignedWorker, orderId, orderNumber } = creationResult.data;

  const webhookBody = JSON.stringify({
    ...payload,
    createdAt: now,
    serviceName: service.name,
    group: service.group,
    category: service.category,
    orderId,
    orderNumber,
    assignedWorker,
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
    orderId,
    assignedWorkerId: assignedWorker?.id,
  });

  return NextResponse.json(
    {
      ok: true,
      receivedAt: now,
      task: {
        orderId,
        orderNumber: orderNumber ?? null,
        assignedWorker,
      },
    },
    { status: 200 },
  );
}

export const runtime = "nodejs";
