import express from "express";
import AuthController from "../../controllers/auth/controller";

const authRouter = express.Router();
const authController = new AuthController()
authRouter.post("/signup", authController.signUp);
authRouter.post("/signin", authController.signIn);
authRouter.get("/signout", authController.signOut);

export default authRouter;
