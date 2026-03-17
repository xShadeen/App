import { Request, Response } from "express";
import { lessonsService } from "./lessons.service";

export const lessonsController = {
  getByStudentId: async (req: Request, res: Response) => {
    const studentId = Number(req.params.studentId);
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!studentId) {
      return res.status(400).json({
        message: "Invalid studentId",
      });
    }

    const lessons = await lessonsService.getByStudentId(studentId, year, month);

    res.json(lessons);
  },

  markAsPaid: async (req: Request, res: Response) => {
    const lessonId = Number(req.params.id);

    if (!lessonId) {
      return res.status(400).json({
        message: "Invalid lesson id",
      });
    }

    const lesson = await lessonsService.markAsPaid(lessonId);

    res.json(lesson);
  },

  updateNotes: async (req: Request, res: Response) => {
    const lessonId = Number(req.params.id);
    const { notes } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        message: "Invalid lesson id",
      });
    }

    const lesson = await lessonsService.updateNotes(lessonId, notes);

    res.json(lesson);
  },
};
