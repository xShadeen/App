import { Router } from "express";
import { syncCalendar } from "./calendar.controller";

const calendarRouter = Router();

calendarRouter.post("/sync", syncCalendar);

export default calendarRouter;
