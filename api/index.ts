
import express, { Express } from "express";
import path from "path";
import authRouter from "./routes/auth/authRouter";
import eventRouter from "./routes/event/eventRouter";
import userRouter from "./routes/user/userRouter";
import apiAuthentication from "./utils/middleware/apiAuthentication";
import errorHandler from "./utils/middleware/error.handler"; // Import the error handler
// Create a single supabase client for interacting with your database

const _dirname = path.resolve();


const app: Express = express();
const port = 3000;
const router = express.Router();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(apiAuthentication);
app.use(errorHandler);

app.use("/api/auth", authRouter ); // Auth Route
app.use("/api/user", userRouter ); // User Route
app.use("/api/event", eventRouter ); // Event Route

app.use(express.static(path.join(_dirname, "/client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(_dirname, "client", "dist", "index.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
