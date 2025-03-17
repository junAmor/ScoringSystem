import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertParticipantSchema, 
  insertScoreSchema 
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  const MemoryStoreSession = MemoryStore(session);
  
  // Set up session management
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "arduino-innovation-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Initialize passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // For judges, use standard password "2AIC"
        if (user.role === 'judge' && password === "2AIC") {
          return done(null, user);
        } 
        // For admin or using actual password
        else if (user.password === password) {
          return done(null, user);
        } 
        else {
          return done(null, false, { message: "Invalid username or password" });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any)?.role === 'admin') {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Admin access required" });
  };

  // Auth routes
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info.message });
      
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json({ 
          id: user.id,
          username: user.username,
          role: user.role
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", (req, res) => {
    if (req.isAuthenticated() || !req.isAuthenticated()) {
      return next();
    }
    
    const user = req.user as any;
    res.json({ 
      id: user.id,
      username: user.username,
      role: user.role
    });
  });

  // Users/Judges routes (admin only)
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Don't send passwords to client
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", isAdmin, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.format() });
      }
      
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(result.data);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only update fields that are provided
      const updateData: Partial<typeof req.body> = {};
      if (req.body.username) updateData.username = req.body.username;
      if (req.body.password) updateData.password = req.body.password;
      if (req.body.role) updateData.role = req.body.role;

      const updatedUser = await storage.updateUser(id, updateData);
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const success = await storage.deleteUser(id);
      if (success) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Participants routes
  app.get("/api/participants", isAuthenticated, async (req, res) => {
    try {
      const participants = await storage.getParticipants();
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  app.post("/api/participants", isAdmin, async (req, res) => {
    try {
      const result = insertParticipantSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid participant data", errors: result.error.format() });
      }
      
      const participant = await storage.createParticipant(result.data);
      res.status(201).json(participant);
    } catch (error) {
      res.status(500).json({ message: "Failed to create participant" });
    }
  });

  app.put("/api/participants/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid participant ID" });
      }

      const result = insertParticipantSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid participant data", errors: result.error.format() });
      }

      const updatedParticipant = await storage.updateParticipant(id, result.data);
      if (updatedParticipant) {
        res.json(updatedParticipant);
      } else {
        res.status(404).json({ message: "Participant not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update participant" });
    }
  });

  app.delete("/api/participants/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid participant ID" });
      }

      const success = await storage.deleteParticipant(id);
      if (success) {
        res.json({ message: "Participant deleted successfully" });
      } else {
        res.status(404).json({ message: "Participant not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete participant" });
    }
  });

  // Scores routes
  app.get("/api/scores", isAuthenticated, async (req, res) => {
    try {
      const scores = await storage.getScores();
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  app.get("/api/scores/judge/:judgeId", isAuthenticated, async (req, res) => {
    try {
      const judgeId = parseInt(req.params.judgeId);
      if (isNaN(judgeId)) {
        return res.status(400).json({ message: "Invalid judge ID" });
      }

      const scores = await storage.getScoresByJudgeId(judgeId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch judge scores" });
    }
  });

  app.get("/api/scores/participant/:participantId", isAuthenticated, async (req, res) => {
    try {
      const participantId = parseInt(req.params.participantId);
      if (isNaN(participantId)) {
        return res.status(400).json({ message: "Invalid participant ID" });
      }

      const scores = await storage.getScoresByParticipantId(participantId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch participant scores" });
    }
  });

  app.post("/api/scores", isAuthenticated, async (req, res) => {
    try {
      console.log("Received score data:", req.body);
      
      // Prepare data for validation - participantId and judgeId need to be numbers
      // but score values should stay as strings
      const parsedData = {
        ...req.body,
        participantId: Number(req.body.participantId),
        judgeId: Number(req.body.judgeId),
        // Keep these as strings per our schema
        projectDesign: String(req.body.projectDesign),
        functionality: String(req.body.functionality),
        presentation: String(req.body.presentation),
        webDesign: String(req.body.webDesign),
        impact: String(req.body.impact)
      };
      
      // Validate the data
      const result = insertScoreSchema.safeParse(parsedData);
      if (!result.success) {
        console.error("Validation errors:", result.error.format());
        return res.status(400).json({ message: "Invalid score data", errors: result.error.format() });
      }
      
      // Ensure the judge ID matches the authenticated user if not admin
      const user = req.user as any;
      if (user.role !== 'admin' && Number(result.data.judgeId) !== user.id) {
        return res.status(403).json({ message: "You can only submit scores as yourself" });
      }
      
      // Create the score
      const score = await storage.createScore(result.data);
      res.status(201).json(score);
    } catch (error) {
      console.error("Score creation error:", error);
      res.status(500).json({ message: "Failed to create score" });
    }
  });

  app.put("/api/scores/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid score ID" });
      }

      const existingScore = await storage.getScore(id);
      if (!existingScore) {
        return res.status(404).json({ message: "Score not found" });
      }

      // Only allow updating own scores or if admin
      const user = req.user as any;
      if (user.role !== 'admin' && existingScore.judgeId !== user.id) {
        return res.status(403).json({ message: "You can only update your own scores" });
      }

      // Convert score data to the correct types
      const parsedBody = { ...req.body };
      if (parsedBody.projectDesign !== undefined) {
        parsedBody.projectDesign = String(parsedBody.projectDesign);
      }
      if (parsedBody.functionality !== undefined) {
        parsedBody.functionality = String(parsedBody.functionality);
      }
      if (parsedBody.presentation !== undefined) {
        parsedBody.presentation = String(parsedBody.presentation);
      }
      if (parsedBody.webDesign !== undefined) {
        parsedBody.webDesign = String(parsedBody.webDesign);
      }
      if (parsedBody.impact !== undefined) {
        parsedBody.impact = String(parsedBody.impact);
      }
      
      // Use object to create partial validation
      const result = insertScoreSchema.safeParse({
        ...existingScore,
        ...parsedBody
      });
      
      if (!result.success) {
        console.error("Update validation errors:", result.error.format());
        return res.status(400).json({ message: "Invalid score data", errors: result.error.format() });
      }

      const updatedScore = await storage.updateScore(id, result.data);
      if (updatedScore) {
        res.json(updatedScore);
      } else {
        res.status(404).json({ message: "Score not found" });
      }
    } catch (error) {
      console.error("Score update error:", error);
      res.status(500).json({ message: "Failed to update score" });
    }
  });

  app.delete("/api/scores/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid score ID" });
      }

      const existingScore = await storage.getScore(id);
      if (!existingScore) {
        return res.status(404).json({ message: "Score not found" });
      }

      // Only allow deleting own scores or if admin
      const user = req.user as any;
      if (user.role !== 'admin' && existingScore.judgeId !== user.id) {
        return res.status(403).json({ message: "You can only delete your own scores" });
      }

      const success = await storage.deleteScore(id);
      if (success) {
        res.json({ message: "Score deleted successfully" });
      } else {
        res.status(404).json({ message: "Score not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete score" });
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
