import { NextResponse } from "next/server";
import { z } from "zod";

import type { ServiceRequestCreateSuccess } from "@nimara/infrastructure/service-request/types";

import { repairServiceBySlug } from "@/lib/repair-services/data";
import { storefrontLogger } from "@/services/logging";
import { getServiceRequestService } from "@/services/service-request";

const priceEstimateSchema = z.object({
  min: z.number().nullable(),
  max: z.number().nullable(),
  currency: z.string().min(3).max(3),
});

const modifiersSchema = z
  .record(z.string(), z.number())
  .optional()
  .default({});

const serviceSelectionSchema = z.object({
  deviceType: z.string().min(2).max(40),
  serviceSlug: z.string().min(2).max(120),
  priceEstimate: priceEstimateSchema.optional(),
  modifiers: modifiersSchema,
  order: z.number().optional(),
});

const baseSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(5).max(40),
  email: z
    .string()
    .email()
    .max(120)
    .optional()
    .or(z.literal("").optional()),
  message: z.string().max(2000).optional(),
  urgent: z.boolean().optional().default(false),
  needsPickup: z.boolean().optional().default(false),
  preferredContact: z.enum(["phone", "email"]).optional(),
  consent: z.boolean().optional().default(false),
});

const legacySchema = baseSchema.extend({
  deviceType: z.string().min(2).max(40),
  serviceSlug: z.string().min(2).max(120),
  priceEstimate: priceEstimateSchema.optional(),
  modifiers: modifiersSchema,
});

const multiSchema = baseSchema.extend({
  serviceSelections: z.array(serviceSelectionSchema).min(1),
  totalEstimate: priceEstimateSchema.optional(),
});

const requestSchema = z.union([multiSchema, legacySchema]);

type MultiRequestPayload = z.infer<typeof multiSchema>;
type RequestPayload = z.infer<typeof requestSchema>;

type RepairServiceData = NonNullable<ReturnType<typeof repairServiceBySlug>>;

const webhookHeaders = {
  "Content-Type": "application/json",
};

const formatLogContext = (
  payload: { needsPickup?: boolean, urgent?: boolean; },
  selection: { deviceType: string, serviceSlug: string; },
) => ({
  serviceSlug: selection.serviceSlug,
  deviceType: selection.deviceType,
  urgent: payload.urgent,
  needsPickup: payload.needsPickup,
});

const extractNormalizedEmail = (email: string | undefined) => {
  if (!email) {
    return undefined;
  }

  const trimmed = email.trim();

  return trimmed.length ? trimmed : undefined;
};

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

  const payload: RequestPayload = parsed.data;
  const now = new Date().toISOString();

  const normalizedEmail = extractNormalizedEmail(
    "email" in payload ? payload.email : undefined,
  );

  const serviceRequestService = await getServiceRequestService();

  if ("serviceSelections" in payload) {
    const multiPayload = payload;
    const baseRequest = {
      consent: multiPayload.consent ?? false,
      email: normalizedEmail,
      fullName: multiPayload.fullName,
      message: multiPayload.message,
      needsPickup: multiPayload.needsPickup ?? false,
      phone: multiPayload.phone,
      preferredContact: multiPayload.preferredContact,
      urgent: multiPayload.urgent ?? false,
    };

    const selectionResults: Array<{
      selection: MultiRequestPayload["serviceSelections"][number];
      service: RepairServiceData;
      task: ServiceRequestCreateSuccess;
    }> = [];

    for (const selection of multiPayload.serviceSelections) {
      const service = repairServiceBySlug(selection.serviceSlug);

      if (!service) {
        storefrontLogger.warning("[ServiceRequest] Service not found.", {
          serviceSlug: selection.serviceSlug,
        });

        return NextResponse.json(
          { ok: false, error: "SERVICE_NOT_FOUND" },
          { status: 404 },
        );
      }

      const creationResult = await serviceRequestService.create({
        createdAt: now,
        request: {
          ...baseRequest,
          deviceType: selection.deviceType,
          modifiers: selection.modifiers ?? {},
          priceEstimate: selection.priceEstimate,
          serviceSlug: selection.serviceSlug,
        },
        service: {
          category: service.category,
          group: service.group,
          name: service.name,
          slug: service.slug,
        },
      });

      if (!creationResult.ok || !creationResult.data) {
        storefrontLogger.error(
          "[ServiceRequest] Failed to create Saleor task.",
          {
            errors: creationResult.errors,
            ...formatLogContext(multiPayload, selection),
          },
        );

        return NextResponse.json(
          { ok: false, error: "TASK_CREATION_FAILED" },
          { status: 502 },
        );
      }

      selectionResults.push({
        selection,
        service,
        task: creationResult.data,
      });

      storefrontLogger.info("[ServiceRequest] Task created.", {
        ...formatLogContext(multiPayload, selection),
        orderId: creationResult.data.orderId,
      });
    }

    const detailedSelections = selectionResults.map(
      ({ selection, service, task }) => ({
        deviceType: selection.deviceType,
        serviceSlug: service.slug,
        serviceName: service.name,
        category: service.category,
        group: service.group,
        priceEstimate: selection.priceEstimate ?? null,
        modifiers: selection.modifiers ?? {},
        order: selection.order ?? null,
        orderId: task.orderId,
        orderNumber: task.orderNumber ?? null,
        assignedWorker: task.assignedWorker,
      }),
    );

    const tasks = detailedSelections.map(
      ({ orderId, orderNumber, assignedWorker, serviceSlug, deviceType }) => ({
        orderId,
        orderNumber,
        assignedWorker,
        serviceSlug,
        deviceType,
      }),
    );

    const webhookBody = JSON.stringify({
      ...multiPayload,
      email: normalizedEmail,
      createdAt: now,
      selections: detailedSelections,
      totalEstimate: multiPayload.totalEstimate ?? null,
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
            },
          );
        }
      } catch (error) {
        storefrontLogger.error("[ServiceRequest] Webhook request failed.", {
          error,
        });
      }
    } else {
      storefrontLogger.info(
        "[ServiceRequest] Webhook URL not configured, storing payload in logs only.",
        { selections: detailedSelections.length },
      );
    }

    storefrontLogger.info("[ServiceRequest] Batch request processed.", {
      totalSelections: selectionResults.length,
      orders: tasks.map((task) => task.orderId),
    });

    return NextResponse.json(
      {
        ok: true,
        receivedAt: now,
        tasks,
      },
      { status: 200 },
    );
  }

  const legacyPayload = payload;
  const service = repairServiceBySlug(legacyPayload.serviceSlug);

  if (!service) {
    storefrontLogger.warning("[ServiceRequest] Service not found.", {
      serviceSlug: legacyPayload.serviceSlug,
    });

    return NextResponse.json(
      { ok: false, error: "SERVICE_NOT_FOUND" },
      { status: 404 },
    );
  }

  const creationResult = await serviceRequestService.create({
    createdAt: now,
    request: {
      consent: legacyPayload.consent ?? false,
      deviceType: legacyPayload.deviceType,
      email: normalizedEmail,
      fullName: legacyPayload.fullName,
      message: legacyPayload.message,
      modifiers: legacyPayload.modifiers ?? {},
      needsPickup: legacyPayload.needsPickup ?? false,
      phone: legacyPayload.phone,
      preferredContact: legacyPayload.preferredContact,
      priceEstimate: legacyPayload.priceEstimate,
      serviceSlug: legacyPayload.serviceSlug,
      urgent: legacyPayload.urgent ?? false,
    },
    service: {
      category: service.category,
      group: service.group,
      name: service.name,
      slug: service.slug,
    },
  });

  if (!creationResult.ok || !creationResult.data) {
    storefrontLogger.error("[ServiceRequest] Failed to create Saleor task.", {
      errors: creationResult.errors,
      ...formatLogContext(legacyPayload, legacyPayload),
    });

    return NextResponse.json(
      { ok: false, error: "TASK_CREATION_FAILED" },
      { status: 502 },
    );
  }

  const { assignedWorker, orderId, orderNumber } = creationResult.data;

  const webhookBody = JSON.stringify({
    ...legacyPayload,
    email: normalizedEmail,
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
        ...formatLogContext(legacyPayload, legacyPayload),
      });
    }
  } else {
    storefrontLogger.info(
      "[ServiceRequest] Webhook URL not configured, storing payload in logs only.",
      formatLogContext(legacyPayload, legacyPayload),
    );
  }

  storefrontLogger.info("[ServiceRequest] Request processed successfully.", {
    ...formatLogContext(legacyPayload, legacyPayload),
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
