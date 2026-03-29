import { Router } from "express";
import { studentsController } from "./students.controller";

export const studentsRouter = Router();

studentsRouter.get("/", studentsController.getAll);
studentsRouter.get("/:id", studentsController.getById);

studentsRouter.post("/", studentsController.create);

studentsRouter.delete("/:id", studentsController.delete);
studentsRouter.patch("/:id/restore", studentsController.restore);

studentsRouter.patch("/:id/group", studentsController.updateGroup);
