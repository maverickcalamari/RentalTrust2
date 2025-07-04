import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { hashPassword, comparePasswords, storage } from "./storage";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ SESSION + PASSPORT middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.RENDER === "true" || process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ LANDLORD DASHBOARD ROUTE
app.get("/api/dashboard", async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.userType !== "landlord") {
      return res.sendStatus(403);
    }

    const dashboard = await storage.getDashboardData(req.user.id);
    res.json(dashboard);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.sendStatus(500);
  }
});

// ✅ API logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

// ✅ MAIN STARTUP FUNCTION
(async () => {
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Serve static frontend or Vite dev server
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ✅ START SERVER
  const port = 5000;
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
