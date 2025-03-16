import { useState } from "react";
import MainHeader from "@/components/MainHeader";
import Sidebar from "@/components/Sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LeaderboardProps {
  user: any;
  onLogout: () => void;
}

interface Participant {
  id: number;
  teamName: string;
  projectTitle: string;
  scores: {
    projectDesign: number;
    functionality: number;
    presentation: number;
    webDesign: number;
    impact: number;
    finalScore: number;
  };
}

interface ScoreUpdate {
  participantId: number;
  criteria: string;
  value: number;
  scores: Record<string, number>;
}

export default function Leaderboard({ user, onLogout }: LeaderboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: leaderboard = [], isLoading, error } = useQuery<Participant[]>({
    queryKey: ['/api/leaderboard'],
  });

  const isAdmin = user?.role === 'admin';
  
  const handleScoreChange = async (update: ScoreUpdate) => {
    // Find existing score or create a new one
    try {
      // For a real app, we would need to get the existing score ID or create a new one
      // Here we'll simulate it with optimistic UI updates
      const scoreData = {
        participantId: update.participantId,
        judgeId: user?.id,
        ...update.scores
      };
      
      await apiRequest('POST', '/api/scores', scoreData);
      
      // Invalidate leaderboard query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      
      toast({
        title: "Score updated",
        description: "Score has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <MainHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
        isAdmin={isAdmin}
      />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <Card className="bg-gradient-to-b from-teal-100/70 to-teal-50/60">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold text-primary mb-6">Leaderboard</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <i className="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Failed to load leaderboard data</p>
              </div>
            ) : (
              <div className="leaderboard-table">
                <h2 className="leaderboard-title">Competition Leaderboard</h2>
                <div className="overflow-x-visible">
                <Table className="leaderboard">
                  <TableHeader>
                    <TableRow className="bg-primary">
                      <TableHead className="text-white rounded-tl-lg">Team</TableHead>
                      <TableHead className="text-white">Project Title</TableHead>
                      <TableHead className="text-white text-center">
                        Project Design
                        <span className="text-xs block">(25%)</span>
                      </TableHead>
                      <TableHead className="text-white text-center">
                        Functionality
                        <span className="text-xs block">(30%)</span>
                      </TableHead>
                      <TableHead className="text-white text-center">
                        Presentation
                        <span className="text-xs block">(15%)</span>
                      </TableHead>
                      <TableHead className="text-white text-center">
                        Web Design
                        <span className="text-xs block">(10%)</span>
                      </TableHead>
                      <TableHead className="text-white text-center">
                        Impact
                        <span className="text-xs block">(20%)</span>
                      </TableHead>
                      <TableHead className="text-white text-center rounded-tr-lg">
                        Final Score
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((participant, index) => (
                      <TableRow 
                        key={participant.id}
                        className={
                          index === 0 ? "bg-amber-300 border-b border-gray-200 rounded-[50px]" :
                          index === 1 ? "bg-amber-200/70 border-b border-gray-200 rounded-[50px]" :
                          index === 2 ? "bg-amber-100/60 border-b border-gray-200 rounded-[50px]" :
                          "bg-white border-b border-gray-200 rounded-[50px]"
                        }
                      >
                        <TableCell className="font-medium">{participant.teamName}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate hover:text-clip hover:overflow-visible hover:whitespace-normal hover:bg-white hover:shadow-md hover:p-2 hover:rounded hover:absolute hover:z-10 cursor-help transition-all duration-200">
                            {participant.projectTitle}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {isAdmin ? (
                            <Input
                              type="number"
                              className="w-16 mx-auto text-center"
                              value={participant.scores.projectDesign}
                              min={0}
                              max={25}
                              step={0.5}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                handleScoreChange({
                                  participantId: participant.id,
                                  criteria: 'projectDesign',
                                  value,
                                  scores: {
                                    projectDesign: value,
                                    functionality: participant.scores.functionality,
                                    presentation: participant.scores.presentation,
                                    webDesign: participant.scores.webDesign,
                                    impact: participant.scores.impact
                                  }
                                });
                              }}
                            />
                          ) : (
                            participant.scores.projectDesign.toFixed(1)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isAdmin ? (
                            <Input
                              type="number"
                              className="w-16 mx-auto text-center"
                              value={participant.scores.functionality}
                              min={0}
                              max={30}
                              step={0.5}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                handleScoreChange({
                                  participantId: participant.id,
                                  criteria: 'functionality',
                                  value,
                                  scores: {
                                    projectDesign: participant.scores.projectDesign,
                                    functionality: value,
                                    presentation: participant.scores.presentation,
                                    webDesign: participant.scores.webDesign,
                                    impact: participant.scores.impact
                                  }
                                });
                              }}
                            />
                          ) : (
                            participant.scores.functionality.toFixed(1)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isAdmin ? (
                            <Input
                              type="number"
                              className="w-16 mx-auto text-center"
                              value={participant.scores.presentation}
                              min={0}
                              max={15}
                              step={0.5}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                handleScoreChange({
                                  participantId: participant.id,
                                  criteria: 'presentation',
                                  value,
                                  scores: {
                                    projectDesign: participant.scores.projectDesign,
                                    functionality: participant.scores.functionality,
                                    presentation: value,
                                    webDesign: participant.scores.webDesign,
                                    impact: participant.scores.impact
                                  }
                                });
                              }}
                            />
                          ) : (
                            participant.scores.presentation.toFixed(1)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isAdmin ? (
                            <Input
                              type="number"
                              className="w-16 mx-auto text-center"
                              value={participant.scores.webDesign}
                              min={0}
                              max={10}
                              step={0.5}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                handleScoreChange({
                                  participantId: participant.id,
                                  criteria: 'webDesign',
                                  value,
                                  scores: {
                                    projectDesign: participant.scores.projectDesign,
                                    functionality: participant.scores.functionality,
                                    presentation: participant.scores.presentation,
                                    webDesign: value,
                                    impact: participant.scores.impact
                                  }
                                });
                              }}
                            />
                          ) : (
                            participant.scores.webDesign.toFixed(1)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isAdmin ? (
                            <Input
                              type="number"
                              className="w-16 mx-auto text-center"
                              value={participant.scores.impact}
                              min={0}
                              max={20}
                              step={0.5}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                handleScoreChange({
                                  participantId: participant.id,
                                  criteria: 'impact',
                                  value,
                                  scores: {
                                    projectDesign: participant.scores.projectDesign,
                                    functionality: participant.scores.functionality,
                                    presentation: participant.scores.presentation,
                                    webDesign: participant.scores.webDesign,
                                    impact: value
                                  }
                                });
                              }}
                            />
                          ) : (
                            participant.scores.impact.toFixed(1)
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {participant.scores.finalScore.toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {leaderboard.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No participants found. Add participants to see the leaderboard.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
