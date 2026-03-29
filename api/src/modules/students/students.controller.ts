import { Request, Response } from "express";
import { studentsService } from "./students.service";

export const studentsController = {
  getAll: async (_req: Request, res: Response) => {
    const students = await studentsService.getAll();
    res.json(students);
  },

  create: async (req: Request, res: Response) => {
    try {
      const { firstName, email, phone, groupId } = req.body;

      if (!firstName) {
        return res.status(400).json({ message: "First name is required" });
      }

      const student = await studentsService.create({
        firstName,
        email,
        phone,
        groupId,
      });

      res.status(201).json(student);
    } catch (err: any) {
      res.status(err.status || 500).json({
        message: err.message || "Internal server error",
      });
    }
  },

  delete: async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
      await studentsService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Student not found" });
    }
  },

  restore: async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    try {
      const student = await studentsService.restore(id);
      res.json(student);
    } catch (error) {
      res.status(404).json({ message: "Student not found" });
    }
  },

  getById: async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const student = await studentsService.getById(id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  },
  updateGroup: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { groupId } = req.body;

    try {
      const student = await studentsService.updateGroup(id, groupId);
      res.json(student);
    } catch (error) {
      res.status(404).json({ message: "Student not found" });
    }
  },
};
