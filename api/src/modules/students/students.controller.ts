import { Request, Response } from "express";
import { studentsService } from "./students.service";

export const studentsController = {
  getAll: async (_req: Request, res: Response) => {
    const students = await studentsService.getAll();
    res.json(students);
  },

  create: async (req: Request, res: Response) => {
    const { firstName, email, phone } = req.body;

    if (!firstName) {
      return res.status(400).json({ message: "firstName is required" });
    }

    const student = await studentsService.create({
      firstName,
      email,
      phone,
    });

    res.status(201).json(student);
  },

  delete: async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
      await studentsService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Student not found" });
    }
  },
};
