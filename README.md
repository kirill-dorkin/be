# Best Electronics Service Management

**Best Electronics (be.kg)** provides a comprehensive system for managing repair requests, tracking progress and keeping customers up to date. The platform helps streamline technician assignments and integrates customer orders and invoicing.

## Key Features

1. **Repair Request Management**  
   Accept repair requests from customers, categorize issues, and generate repair tickets for efficient tracking.

2. **Technician Assignment**  
   Automatically assign technicians based on their expertise and availability, ensuring balanced workloads and timely repair completion.

3. **Repair Progress Monitoring**  
   Track the progress of ongoing repairs, update statuses, and notify customers when repairs are complete.

4. **Billing & Invoicing**  
   Generate invoices for completed repairs, including labor and parts costs, and manage payments efficiently.

5. **Customer Notifications**  
   Integrate with **WhatsApp** to notify customers when their repair is completed and send the final invoice.

Built with **Next.js, TypeScript, Tailwind CSS, and MongoDB**, the system provides a fast, scalable, and user-friendly solution for laptop repair management.

The interface supports **Russian**, **Kyrgyz**, and **English**. Russian is the default language, and you can switch languages using the links in the top-right corner of the page.

## Authentication
Regular visitors do not need to register. When they open the site, they automatically have the `user` role and can submit repair requests. The `/login` page is reserved for employees and administrators.

## Requesting a Repair
Visit the home page and click **Request Repair** to open the request page. You can fill out the online form or reach us by phone at **+996 501‑31‑31‑14** or **+996 557‑31‑31‑14**.
Our service center is located at **Кулатова&nbsp;8/1, Bishkek** (find us on [2GIS](https://go.2gis.com/)). You can also message us on Instagram [@best___electronics](https://instagram.com/best___electronics).


## How to Use the Best Electronics Service System

### Prerequisites
Ensure you have Node.js and npm installed on your machine. You can download them from [here](https://nodejs.org/).

### Getting Started

1. **Clone the Repository:**

``` 
git clone https://github.com/kirill-dorkin/be.kg.git
cd be.kg
```

2. **Install Dependencies:**

```
npm install
# or
yarn install
# or
bun i
```
3. **Run the Development Server:**

Start the server locally to test the system.

```
npm run dev
# or
yarn dev
# or
bun run dev
```

4. **Access the System:**

Open http://localhost:3000 in your browser to access the application.
