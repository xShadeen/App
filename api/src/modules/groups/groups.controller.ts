import { Request, Response } from "express";
import { groupsService } from "./groups.service";

export const groupsController = {
  getAll: async (_req: Request, res: Response) => {
    const groups = await groupsService.getAll();
    res.json(groups);
  },

  create: async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const group = await groupsService.create({ name });

      res.status(201).json(group);
    } catch (err: any) {
      res.status(err.status || 500).json({
        message: err.message || "Internal server error",
      });
    }
  },
};
