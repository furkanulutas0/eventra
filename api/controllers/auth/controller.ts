import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import errorHandler from "../../utils/middleware/error.handler";
import { supabase } from "../../utils/supabase";

class AuthController {
  private validateEmail(email: string): boolean {
    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return false;
    }
    // Additional checks
    if (email.length < 5 || email.length > 255) {
      return false;
    }
    if (email.startsWith('.') || email.endsWith('.')) {
      return false;
    }
    return true;
  }

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name, surname } = req.body;

    // Email validation
    if (!this.validateEmail(email)) {
      return res.status(400).json({ error: "Geçersiz email formatı!" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalı!" });
    }

    const userRequest = {
      email,
      password,
      name,
      surname
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
      return errorHandler(error, req, res, next);
    }

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
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userRequest.password, salt);

      if (!hashedPassword) {
        throw new Error("Password hashlenemedi!");
      }

      const { data, error } = await supabase.from("users").insert({
        email: userRequest.email,
        password: hashedPassword,
        name: userRequest.name,
        surname: userRequest.surname
      }).select("uuid");

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

    // Email validation
    if (!this.validateEmail(email)) {
      return res.status(400).json({ error: "Geçersiz email formatı!" });
    }

    const userRequest = {
      email,
      password,
    };
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", userRequest.email);
      if (!data || data.length === 0) throw error;

      const isPasswordEqual = await bcrypt.compare(userRequest.password, data![0].password);

      if (!isPasswordEqual) {
        throw new Error("Password hatalı girildi!");
      }

      res.status(201).json({
        sucess: true,
        message: "User başarıyla giriş yaptı.",
        data: data
      });
    } catch (error) {
      return next(error);
    }
  };
}

export default AuthController;
