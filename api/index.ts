import express, { Express } from "express";
import path from "path";
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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handler should be last
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
