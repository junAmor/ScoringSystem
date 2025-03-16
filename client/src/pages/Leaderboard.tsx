import { useState, useEffect } from "react";
import MainHeader from "@/components/MainHeader";
import Sidebar from "@/components/Sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LeaderboardTable from "@/components/LeaderboardTable";

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

export default function Leaderboard({ user, onLogout }: LeaderboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Set up polling for real-time updates (every 5 seconds)
  const { data: leaderboard = [], isLoading, error } = useQuery<Participant[]>({
    queryKey: ['/api/leaderboard'],
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });

  const isAdmin = user?.role === 'admin';
  
  // WebSocket setup for real-time updates (if we had WebSockets)
  // Since we don't have actual WebSockets, we'll rely on polling

  // Handle score changes (admin only)
  const handleScoreChange = async (participantId: number, criteria: string, value: number) => {
    if (!isAdmin) return;
    
    try {
      // Find the participant
      const participant = leaderboard.find(p => p.id === participantId);
      if (!participant) return;
      
      // Create the updated scores object
      const scores = {
        projectDesign: participant.scores.projectDesign,
        functionality: participant.scores.functionality,
        presentation: participant.scores.presentation,
        webDesign: participant.scores.webDesign,
        impact: participant.scores.impact,
        [criteria]: value
      };
      
      // Send the update
      const scoreData = {
        participantId,
        judgeId: user?.id,
        ...scores
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
              <div className="leaderboard-container">
                <h2 className="text-xl font-bold text-primary text-center mb-4">2nd ARDUINO INNOVATOR CHALLENGE</h2>
                <LeaderboardTable 
                  participants={leaderboard}
                  isAdmin={isAdmin}
                  onScoreChange={handleScoreChange}
                />
                
                {/* Real-time update indicator */}
                <div className="mt-4 text-sm text-gray-500 text-right">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                  Live updates enabled
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
