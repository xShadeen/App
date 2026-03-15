import { Router } from "express";
import { lessonsController } from "./lessons.controller";

export const lessonsRouter = Router();

lessonsRouter.get("/student/:studentId", lessonsController.getByStudentId);
lessonsRouter.patch("/:id/pay", lessonsController.markAsPaid);
lessonsRouter.patch("/:id", lessonsController.updateNotes);
