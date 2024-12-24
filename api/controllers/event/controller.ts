import { NextFunction, Request, Response } from "express";
import { supabase } from "../../utils/supabase";

const generateRandomString = (length: number) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

async function generateEventId(creator_id: string) {
  const { data: creatorData, error: creatorError } = await supabase
    .from("users")
    .select("uuid")
    .eq("uuid", creator_id);
  if (creatorError) throw creatorError;
  if (creatorData.length === 0) throw new Error("Creator not found");
  const getUserIdPattern = creatorData[0].uuid.split("-")[0];
  const newId = `eventra-${getUserIdPattern}-${generateRandomString(5)}`;
  return newId;
}

export class EventController {
  public async addEvent(req: Request, res: Response, next: NextFunction) {
    const { name, description, location, start_date, end_date, duration_minute, creator_id } =
      req.body;
    const eventRequest = {
      id: await generateEventId(creator_id),
      creator_id,
      event_name: name,
      description,
      location,
      start_date,
      end_date,
      duration_minute,
    };

    try {
      const { data, error } = await supabase.from("events").insert(eventRequest);
      if (error) throw error;
      res.status(201).json({ message: "Event created successfully", data });
    } catch (error) {
      next(res.status(400).json({ error }));
    }
  }

  public async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id } = req.query;
      const { data, error } = await supabase.from("events").select("*").eq("id", event_id);
      if (error) throw error;
      res.status(200).json({ data });
    } catch (error) {
      next(res.status(404).json({ error }));
    }
  }

  public async getEventByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { creator_id } = req.query;
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("creator_id", creator_id);
      if (error) throw error;
      res.status(200).json({ data });
    } catch (error) {
      next(res.status(404).json({ error }));
    }
  }
}
