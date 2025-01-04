﻿import express from "express";
import { EventController } from "../../controllers/event/controller";

const eventRouter = express.Router();
const eventController = new EventController()
eventRouter.get("/getEventDataById", eventController.getEvent);
eventRouter.post("/createEvent", eventController.addEvent);
eventRouter.get("/getEventsByUser", eventController.getEventByUser);
eventRouter.patch("/updateStatus", eventController.updateEventStatus);
eventRouter.post("/submitAvailability", eventController.submitAvailability);

export default eventRouter;
