import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { createServer } from "node:http";

import { query } from "./config/db.js";
import { swaggerSpec } from "./config/swagger.js";

import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import usersRoutes from "./routes/userRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";

import { errorHandler } from "./middlewares/errorHandler.js";
import { initializeSocket } from "./services/socketService.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD,
].filter((origin): origin is string => Boolean(origin));

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Static files
app.use(express.static("public"));

// Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "ViaNesso API Documentation",

    customfavIcon: "/uploads/logo.svg",

    customCss: `
      .swagger-ui .topbar {
        display: none;
      }
    `,
  }),
);

// Authentication
app.use("/api/auth", authRoutes);

// Users
app.use("/api/users", usersRoutes);

// Tickets
app.use("/api/tickets", ticketRoutes);

// Service Requests
app.use("/api/service-requests", serviceRequestRoutes);

// Uploads
app.use("/api/uploads", uploadRoutes);

// Technicians
app.use("/api/technician", technicianRoutes);

// Global Error Handler
app.use(errorHandler);

const httpServer = createServer(app);

initializeSocket(httpServer);

const verifyDatabaseConnection = async (): Promise<void> => {
  try {
    const result = await query("SELECT NOW()");

    console.log("✅ Database connected:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

httpServer.listen(PORT, async (): Promise<void> => {
  console.log(`🚀 Server running on port ${PORT}`);

  await verifyDatabaseConnection();
});

export default app;
