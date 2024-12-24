import express from "express";
import { EventController } from "../../controllers/event/controller";

const eventRouter = express.Router();
const eventController = new EventController()
eventRouter.get("/getEventDataById", eventController.getEvent);
eventRouter.post("/addEvent", eventController.addEvent);
eventRouter.get("/getEventsByUser", eventController.getEventByUser);

export default eventRouter;
