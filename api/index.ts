import express, { Express } from "express";
import authRouter from "./routes/auth/authRouter";
import eventRouter from "./routes/event/eventRouter";
import userRouter from "./routes/user/userRouter";
import apiAuthentication from "./utils/middleware/apiAuthentication";
import errorHandler from "./utils/middleware/error.handler";

const app: Express = express();
const port = process.env.PORT || 3000;
const router = express.Router();

// Middleware
app.use(express.json());
app.use(apiAuthentication);
app.use("/api", router);

// Routes
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/event", eventRouter);

// Error handler
app.use(errorHandler);

// Export for Vercel
export default app;

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
