import { NextFunction, Request, Response } from "express";
import { supabase } from "./../../utils/supabase";
class AuthController {
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, vPassword } = req.body;

    const userRequest = {
      username,
      email,
      password,
      vPassword,
    };

    try {
      const { data, error } = await supabase.from("users").select("username").eq("username", userRequest.username);
      if (error) throw error;
      if (data.length > 0) {
        throw new Error("Bu username zaten kayıtlı!");
      }
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ data: "Ok" });
  };

  signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("access_token").json({
        success: true,
        message: "User signed out",
      });
    } catch (error) {
      //TODO Error handle edilecek
      throw new Error("Errors");
    }
  };
}

export default AuthController;
