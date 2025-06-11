import express, { Router, Request, Response, NextFunction } from "express";
import AuthController from "../../controllers/auth/controller";

const authRouter: Router = express.Router();
const authController = new AuthController();

// Define routes with proper request handler types
authRouter.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  await authController.signUp(req, res, next);
});

authRouter.post("/signin", async (req: Request, res: Response, next: NextFunction) => {
  await authController.signIn(req, res, next);
});

authRouter.get("/signout", async (req: Request, res: Response, next: NextFunction) => {
  await authController.signOut(req, res, next);
});

export default authRouter;
