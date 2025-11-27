import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToDatabase } from "./database";
// 🛑 CRITICAL FIX: Import the UserModel for seeding
import { User as UserModel } from "./models"; 

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -----------------------------------------------------------------
// 🛑 CRITICAL FIX: DATA SEEDING FUNCTION
// -----------------------------------------------------------------
async function seedSampleDoctors() {
  // Check if a doctor record already exists to prevent duplicate seeding
  const existingDoctor = await UserModel.findOne({ role: 'doctor' });
  
  if (!existingDoctor) {
    const sampleDoctor = new UserModel({
      email: "dr.gregory.house@clinic.com",
      password: "password123", // Use a placeholder, ensure this is hashed in a production environment
      role: "doctor",
      name: "Dr. Gregory House",
      phone: "+1-555-1234",
      profilePicture: "https://i.imgur.com/placeholder-dr.jpg", 
      specialty: "Infectious Disease Specialist",
      license: "MD-42069",
      experience: 15,
      rating: 4.8,
      isAvailable: true,
    });
    
    await sampleDoctor.save();
    log("Database successfully seeded with one sample doctor: Dr. Gregory House.");
  } else {
    log("Doctor data already exists. Skipping seed.");
  }
}
// -----------------------------------------------------------------


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

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB
  await connectToDatabase();
  
  // 🛑 CRITICAL FIX: Call the seeding function here after connection
  await seedSampleDoctors(); 

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
server.listen(
  {
    port,
    host: process.platform === "win32" ? "127.0.0.1" : "0.0.0.0",
  },
  () => {
    log(`serving on http://${process.platform === "win32" ? "127.0.0.1" : "0.0.0.0"}:${port}`);
  }
);
})();