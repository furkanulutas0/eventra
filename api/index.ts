
import express, { Express } from "express";
import authRouter from "./routes/auth/authRouter";
import eventRouter from "./routes/event/eventRouter";
import userRouter from "./routes/user/userRouter";
import apiAuthentication from "./utils/middleware/apiAuthentication";
import errorHandler from "./utils/middleware/error.handler"; // Import the error handler

// Create a single supabase client for interacting with your database

const app: Express = express();
const port = 3000;
const router = express.Router();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(apiAuthentication);
app.use(errorHandler);
app.use("/api", router);

router.use("/auth", authRouter ); // Auth Route
router.use("/user", userRouter ); // User Route
router.use("/event", eventRouter ); // Event Route

// Start server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
