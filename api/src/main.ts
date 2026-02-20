import express from "express";
import cors from "cors";
import "dotenv/config";
import { Pool } from "pg";
import { studentsRouter } from "./modules/students/students.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
  }),
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/students", studentsRouter);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool
  .query("SELECT 1")
  .then(() => console.log("DB OK"))
  .catch((err) => console.error("DB ERROR", err));

app.listen(3000, () => {
  console.log("API listening on http://localhost:3000");
});
