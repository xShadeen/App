import { Router } from "express";
import { groupsController } from "./groups.controller";

const groupsRouter = Router();

groupsRouter.get("/", groupsController.getAll);
groupsRouter.post("/", groupsController.create);

export default groupsRouter;
