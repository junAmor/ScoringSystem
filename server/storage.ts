import { 
  users, type User, type InsertUser, 
  participants, type Participant, type InsertParticipant,
  scores, type Score, type InsertScore,
  type ParticipantWithScores
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Participant operations
  getParticipant(id: number): Promise<Participant | undefined>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipants(): Promise<Participant[]>;
  updateParticipant(id: number, participant: Partial<InsertParticipant>): Promise<Participant | undefined>;
  deleteParticipant(id: number): Promise<boolean>;
  
  // Score operations
  getScore(id: number): Promise<Score | undefined>;
  createScore(score: InsertScore): Promise<Score>;
  getScores(): Promise<Score[]>;
  getScoresByParticipantId(participantId: number): Promise<Score[]>;
  getScoresByJudgeId(judgeId: number): Promise<Score[]>;
  updateScore(id: number, score: Partial<InsertScore>): Promise<Score | undefined>;
  deleteScore(id: number): Promise<boolean>;
  
  // Composite operations
  getLeaderboard(): Promise<ParticipantWithScores[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private participants: Map<number, Participant>;
  private scores: Map<number, Score>;
  private userId: number;
  private participantId: number;
  private scoreId: number;

  constructor() {
    this.users = new Map();
    this.participants = new Map();
    this.scores = new Map();
    this.userId = 1;
    this.participantId = 1;
    this.scoreId = 1;

    // Seed an admin user
    this.createUser({ 
      username: "admin", 
      password: "admin1", 
      role: "admin" 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Participant operations
  async getParticipant(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.participantId++;
    const participant: Participant = { 
      ...insertParticipant, 
      id,
      createdAt: new Date() 
    };
    this.participants.set(id, participant);
    return participant;
  }

  async getParticipants(): Promise<Participant[]> {
    return Array.from(this.participants.values());
  }

  async updateParticipant(id: number, participantData: Partial<InsertParticipant>): Promise<Participant | undefined> {
    const participant = this.participants.get(id);
    if (!participant) return undefined;

    const updatedParticipant = { ...participant, ...participantData };
    this.participants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async deleteParticipant(id: number): Promise<boolean> {
    // Delete associated scores
    Array.from(this.scores.values())
      .filter(score => score.participantId === id)
      .forEach(score => this.scores.delete(score.id));

    return this.participants.delete(id);
  }

  // Score operations
  async getScore(id: number): Promise<Score | undefined> {
    return this.scores.get(id);
  }

  async createScore(insertScore: InsertScore): Promise<Score> {
    const id = this.scoreId++;
    
    // Make sure all values are strings when storing (as per schema)
    const score: Score = { 
      ...insertScore, 
      id,
      createdAt: new Date(),
      projectDesign: String(insertScore.projectDesign),
      functionality: String(insertScore.functionality),
      presentation: String(insertScore.presentation),
      webDesign: String(insertScore.webDesign),
      impact: String(insertScore.impact),
      participantId: Number(insertScore.participantId),
      judgeId: Number(insertScore.judgeId)
    };
    
    console.log("Storing score:", score);
    this.scores.set(id, score);
    return score;
  }

  async getScores(): Promise<Score[]> {
    return Array.from(this.scores.values());
  }

  async getScoresByParticipantId(participantId: number): Promise<Score[]> {
    return Array.from(this.scores.values())
      .filter(score => score.participantId === participantId);
  }

  async getScoresByJudgeId(judgeId: number): Promise<Score[]> {
    return Array.from(this.scores.values())
      .filter(score => score.judgeId === judgeId);
  }

  async updateScore(id: number, scoreData: Partial<InsertScore>): Promise<Score | undefined> {
    const score = this.scores.get(id);
    if (!score) return undefined;

    // Convert values to strings if they exist in the update data
    const parsedScoreData = { ...scoreData };
    
    if (parsedScoreData.projectDesign !== undefined) {
      parsedScoreData.projectDesign = String(parsedScoreData.projectDesign);
    }
    if (parsedScoreData.functionality !== undefined) {
      parsedScoreData.functionality = String(parsedScoreData.functionality);
    }
    if (parsedScoreData.presentation !== undefined) {
      parsedScoreData.presentation = String(parsedScoreData.presentation);
    }
    if (parsedScoreData.webDesign !== undefined) {
      parsedScoreData.webDesign = String(parsedScoreData.webDesign);
    }
    if (parsedScoreData.impact !== undefined) {
      parsedScoreData.impact = String(parsedScoreData.impact);
    }
    if (parsedScoreData.participantId !== undefined) {
      parsedScoreData.participantId = Number(parsedScoreData.participantId);
    }
    if (parsedScoreData.judgeId !== undefined) {
      parsedScoreData.judgeId = Number(parsedScoreData.judgeId);
    }

    const updatedScore = { ...score, ...parsedScoreData };
    console.log("Updating score:", updatedScore);
    this.scores.set(id, updatedScore);
    return updatedScore;
  }

  async deleteScore(id: number): Promise<boolean> {
    return this.scores.delete(id);
  }

  // Composite operations
  async getLeaderboard(): Promise<ParticipantWithScores[]> {
    const allParticipants = await this.getParticipants();
    const allScores = await this.getScores();

    return allParticipants.map(participant => {
      // Get latest score from each judge for this participant
      const participantScores = allScores
        .filter(score => score.participantId === participant.id)
        .reduce((latest, score) => {
          const existingScore = latest.find(s => s.judgeId === score.judgeId);
          if (!existingScore || new Date(score.createdAt) > new Date(existingScore.createdAt)) {
            return [...latest.filter(s => s.judgeId !== score.judgeId), score];
          }
          return latest;
        }, [] as Score[]);

      // Calculate averages for each criteria
      let totalProjectDesign = 0;
      let totalFunctionality = 0;
      let totalPresentation = 0;
      let totalWebDesign = 0;
      let totalImpact = 0;
      
      participantScores.forEach(score => {
        totalProjectDesign += Number(score.projectDesign);
        totalFunctionality += Number(score.functionality);
        totalPresentation += Number(score.presentation);
        totalWebDesign += Number(score.webDesign);
        totalImpact += Number(score.impact);
      });

      const scoreCount = participantScores.length || 1; // Avoid division by zero
      
      const avgProjectDesign = totalProjectDesign / scoreCount;
      const avgFunctionality = totalFunctionality / scoreCount;
      const avgPresentation = totalPresentation / scoreCount;
      const avgWebDesign = totalWebDesign / scoreCount;
      const avgImpact = totalImpact / scoreCount;

      // Calculate final score (weighted)
      const finalScore = 
        (avgProjectDesign * 0.25) + 
        (avgFunctionality * 0.30) + 
        (avgPresentation * 0.15) + 
        (avgWebDesign * 0.10) + 
        (avgImpact * 0.20);

      return {
        ...participant,
        scores: {
          projectDesign: avgProjectDesign,
          functionality: avgFunctionality,
          presentation: avgPresentation,
          webDesign: avgWebDesign,
          impact: avgImpact,
          finalScore
        }
      };
    }).sort((a, b) => b.scores.finalScore - a.scores.finalScore);
  }
}

export const storage = new MemStorage();
