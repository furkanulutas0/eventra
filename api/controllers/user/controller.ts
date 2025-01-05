import { NextFunction, Request, Response } from "express";
import { supabase } from "../../utils/supabase";

export class UserController {
  public async getUserDataById(req: Request, res: Response, next: NextFunction) {
    try {
      const { uuid } = req.query;
      const { data, error } = await supabase.from("users").select("*").eq("uuid", uuid);
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      next(res.status(404).json({ error }));
    }
  }
}
