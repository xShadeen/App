import { Request, Response } from "express";
import { CalendarService } from "./calendar.service";

const calendarService = new CalendarService();

export const syncCalendar = async (req: Request, res: Response) => {
  try {
    const result = await calendarService.sync();

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Calendar sync failed" });
  }
};
