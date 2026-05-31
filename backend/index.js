import cors from "cors";
import express from "express";
import env from "./configs/env.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Routes - import (ESM requires full paths, not directory imports)
import authRoute from "./routes/api/auth/index.js";
import dashboardRoute from "./routes/api/dashboard/index.js";
import shopRoute from "./routes/api/shop/index.js";

// Middlewares - import
import { errorHandlerMiddleware, authMiddleware } from "./middlewares/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = env.server.PORT;
const localAddress = env.server.LOCAL_ADDRESS;

// ------- Middlewares -------
// > Middlewares (Server)
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// > Middlewares (security)
app.disable("x-powered-by");
app.use(cors());
// TODO: Implement more security middlewares [helmet, rate_limiting, express-validator]

// > Middlewares (logging)
// TODO: Implement logging middleware [morgan]

// ------- Routes -------
// > Routes (/api)
app.use("/api/auth", authRoute);
app.use("/api/dashboard", authMiddleware, dashboardRoute);
app.use("/api/shop", authMiddleware, shopRoute);

// ------- Global error handler -------
app.use(errorHandlerMiddleware);

// ------- Listener -------
app.listen(Number(port), String(localAddress), () => {
    console.log(`Server is running on ${localAddress}:${port}`);
});
