import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDb from "./database/connection.js";
import { clientRouter } from "./routes/client-routes.js";
import { counselorRouter } from "./routes/counselor-routes.js";
import { availabilityRouter } from "./routes/slotManager-routes.js";
import { startCronJobs } from "./utils/cornJob.js";
import { demoRouter } from "./routes/demo-routes.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Client Routes
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/counselors", counselorRouter);
app.use("/api/v1/slotManagement", availabilityRouter);
app.use("/api/v1/demo", demoRouter);

const Port = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(Port, () => {
      console.log(`Server is running on port ${Port}`);
      startCronJobs();
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
  });
