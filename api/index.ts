import { dotenv } from 'dotenv';

import express, { Express } from "express";
import authRouter from "./routes/auth/authRouter";
import eventRouter from "./routes/event/eventRouter";
import userRouter from "./routes/user/userRouter";
import apiAuthentication from "./utils/middleware/apiAuthentication";
import errorHandler from "./utils/middleware/error.handler"; // Import the error handler
import path from "path";

// Create a single supabase client for interacting with your database
dotenv.config();
// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 3000;
const router = express.Router();
const __dirname = path.resolve();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(apiAuthentication);
app.use(errorHandler);
app.use("/api", router);

router.use("/auth", authRouter ); // Auth Route
router.use("/user", userRouter ); // User Route
router.use("/event", eventRouter ); // Event Route

app.use(express.static(path.join(__dirname, "client", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
