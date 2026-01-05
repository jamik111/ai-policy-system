---
description: how to start the AI Policy Dashboard
---

# Starting the Dashboard

The dashboard requires two servers to be running:

## 1. Start the Backend Server

// turbo

```bash
cd d:\ISH\ai-policy-system\backend
npm start
```

This starts the API server on port **8082**.

## 2. Start the Frontend Dashboard

// turbo

```bash
cd d:\ISH\ai-policy-system\next-policy-dashboard
npm run dev
```

This starts the Next.js dashboard on port **3000**.

## 3. Access the Dashboard

Once both servers are running:

- **Landing Page**: <http://localhost:3000/>
- **Dashboard**: <http://localhost:3000/dashboard>

> **Important**: The servers must remain running in your terminal. If you close the terminal, the dashboard will stop working.
