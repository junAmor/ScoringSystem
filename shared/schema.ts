import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("judge"), // 'admin' or 'judge'
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  teamName: text("teamName").notNull(),
  projectTitle: text("projectTitle").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  participantId: serial("participantId").notNull().references(() => participants.id),
  judgeId: serial("judgeId").notNull().references(() => users.id),
  projectDesign: numeric("projectDesign").notNull(),
  functionality: numeric("functionality").notNull(),
  presentation: numeric("presentation").notNull(),
  webDesign: numeric("webDesign").notNull(),
  impact: numeric("impact").notNull(),
  comments: text("comments"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  teamName: true,
  projectTitle: true,
});

export const insertScoreSchema = createInsertSchema(scores).pick({
  participantId: true,
  judgeId: true,
  projectDesign: true,
  functionality: true,
  presentation: true,
  webDesign: true,
  impact: true,
  comments: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;

// Extended schema with virtual fields for API responses
export type ParticipantWithScores = Participant & {
  scores: {
    projectDesign: number;
    functionality: number;
    presentation: number;
    webDesign: number;
    impact: number;
    finalScore: number;
  };
};
