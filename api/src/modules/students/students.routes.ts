import { Router } from "express";
import { studentsController } from "./students.controller";

export const studentsRouter = Router();

studentsRouter.get("/", studentsController.getAll);
studentsRouter.post("/", studentsController.create);
studentsRouter.delete("/:id", studentsController.delete);
