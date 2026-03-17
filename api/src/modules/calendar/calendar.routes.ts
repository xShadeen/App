import { Router } from "express";
import { syncCalendar } from "./calendar.controller";

const router = Router();

router.post("/sync", syncCalendar);

export default router;
