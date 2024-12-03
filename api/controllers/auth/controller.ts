import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { supabase } from "./../../utils/supabase";

class AuthController {
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, vPassword } = req.body;

    const userRequest = {
      username,
      email,
      password,
      // vPassword,
    };

    try {
      const { data: emailData, error: emailError } = await supabase
        .from("users")
        .select("email")
        .eq("email", userRequest.email);
      console.log(emailData);
      if (emailError) throw emailError;
      if (emailData.length > 0) {
        throw new Error("Bu email zaten kayıtlı!");
      }
    } catch (error) {
      return next(error);
    }

    try {
      const { data: usernameData, error: usernameError } = await supabase
        .from("users")
        .select("username")
        .eq("username", userRequest.username);
      console.log(usernameData);
      if (usernameError) throw usernameError;
      if (usernameData.length > 0) {
        throw new Error("Bu username zaten kayıtlı!");
      }
    } catch (error) {
      return next(error);
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userRequest.password, salt);

      if (!hashedPassword) {
        throw new Error("Password hashlenemedi!");
      }

      const { data, error } = await supabase.from("users").insert({
        username: userRequest.username,
        email: userRequest.email,
        password: hashedPassword,
      });

      if (error) throw error;

      res.status(201).json({ message: "User created successfully", data: data });
    } catch (error) {
      return next(error);
    }
  };

  public signOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("access_token").json({
        success: true,
        message: "User signed out",
      });
    } catch (error) {
      //TODO Error handle edilecek
      return next(new Error("Errors"));
    }
  };

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const userRequest = {
      email,
      password,
    };
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email, password")
        .eq("email", userRequest.email);
      if (!data || data.length === 0) throw error;

      const isPasswordEqual = await bcrypt.compare(userRequest.password, data![0].password);

      if (!isPasswordEqual) {
        throw new Error("Password hatalı girildi!");
      }

      res.status(201).json({
        sucess: true,
        message: "User başarıyla giriş yaptı.",
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default AuthController;
