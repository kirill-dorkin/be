## Repair Services Management

This storefront now ships with a curated catalogue of repair services and a request flow.

### Data sources

- `apps/storefront/src/lib/repair-services/data.ts` — single source of truth for the service catalogue.
- `apps/storefront/src/lib/repair-services/seed.ts` — mapper that converts a service into a Saleor-friendly payload.

### Dashboard seeding

1. Ensure `SERVICE_CHANNEL_SLUG` and `SERVICE_CATEGORY_SLUG` are defined (defaults: `default-channel`, `repair-services`).
2. Run the helper API: `GET /api/repair-services/seed`. The response contains ready-to-import payloads for Saleor’s `productBulkCreate` mutation.
3. Create a dedicated Saleor product type named `Repair Service` with attributes:
   - `device-type`, `service-group`, `service-category`, `pricing-kind` (all as plain text / dropdowns).
4. Import the payload into Saleor Cloud and manage price ranges or descriptions right from the dashboard.

### Storefront usage

- `GET /api/repair-services` — returns the raw catalogue for integrations.
- `GET /api/repair-services/seed` — returns the Saleor seed data described above.
- `POST /api/service-request` — receives request submissions coming from the storefront form.

### Updating the catalogue

1. Edit `data.ts` to add, remove, or update services.
2. Optional: adjust `mapServiceToSaleorSeed` if new attributes/metadata are required.
3. Reimport the payload or update products directly through the Saleor dashboard.

### Roadmap ideas

- Store calculator modifiers in Saleor metadata once the services are managed in the dashboard.
- Pipe submitted requests into a dedicated Saleor App (database + notifications).
