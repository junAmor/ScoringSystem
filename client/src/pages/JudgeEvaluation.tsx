import { useState, useEffect } from "react";
import MainHeader from "@/components/MainHeader";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import ScoreSlider from "@/components/ScoreSlider";
import SuccessModal from "@/components/SuccessModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface JudgeEvaluationProps {
  user: any;
  onLogout: () => void;
}

interface Participant {
  id: number;
  teamName: string;
  projectTitle: string;
}

interface Score {
  id?: number;
  participantId: number;
  judgeId: number;
  projectDesign: number;
  functionality: number;
  presentation: number;
  webDesign: number;
  impact: number;
  comments: string;
}

export default function JudgeEvaluation({ user, onLogout }: JudgeEvaluationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);
  const [scores, setScores] = useState<Score>({
    participantId: 0,
    judgeId: user?.id || 0,
    projectDesign: 50,
    functionality: 50,
    presentation: 50,
    webDesign: 50,
    impact: 50,
    comments: ""
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';

  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery<Participant[]>({
    queryKey: ['/api/participants'],
  });

  const { data: judgeScores = [], isLoading: isLoadingScores } = useQuery<Score[]>({
    queryKey: [`/api/scores/judge/${user?.id}`],
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Score) => {
      const res = await apiRequest('POST', '/api/scores', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/scores/judge/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      setScores({
        participantId: selectedParticipantId || 0,
        judgeId: user?.id,
        projectDesign: 50,
        functionality: 50,
        presentation: 50,
        webDesign: 50,
        impact: 50,
        comments: ""
      });
      setSuccessMessage("Evaluation submitted successfully!");
      setIsSuccessModalOpen(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit evaluation",
        variant: "destructive",
      });
    },
  });

  // Set initial participant if available
  useEffect(() => {
    if (participants.length > 0 && !selectedParticipantId) {
      setSelectedParticipantId(participants[0].id);
      setScores(prev => ({ ...prev, participantId: participants[0].id }));
    }
  }, [participants, selectedParticipantId]);

  // Load existing scores when participant changes
  useEffect(() => {
    if (selectedParticipantId && judgeScores.length > 0) {
      const existingScore = judgeScores.find(score => score.participantId === selectedParticipantId);
      
      if (existingScore) {
        setScores({
          ...existingScore,
          judgeId: user?.id,
        });
      } else {
        // Reset to defaults if no existing score
        setScores({
          participantId: selectedParticipantId,
          judgeId: user?.id,
          projectDesign: 50,
          functionality: 50,
          presentation: 50,
          webDesign: 50,
          impact: 50,
          comments: ""
        });
      }
    }
  }, [selectedParticipantId, judgeScores, user?.id]);

  // Calculate total score
  useEffect(() => {
    const weightedTotal = 
      (scores.projectDesign * 0.25) + 
      (scores.functionality * 0.30) + 
      (scores.presentation * 0.15) + 
      (scores.webDesign * 0.10) + 
      (scores.impact * 0.20);
    
    setTotalScore(weightedTotal);
  }, [scores]);

  const handleParticipantChange = (value: string) => {
    const participantId = parseInt(value);
    setSelectedParticipantId(participantId);
    setScores(prev => ({ ...prev, participantId }));
  };

  const handleScoreChange = (criteria: keyof Score, value: number) => {
    setScores(prev => ({ ...prev, [criteria]: value }));
  };

  const handleSubmit = () => {
    if (!selectedParticipantId) {
      toast({
        title: "Error",
        description: "Please select a participant to evaluate",
        variant: "destructive",
      });
      return;
    }
    
    submitMutation.mutate(scores);
  };

  const selectedParticipant = participants.find(p => p.id === selectedParticipantId);

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
            <h2 className="text-2xl font-bold text-primary mb-2">Welcome, {user?.username}!</h2>
            <p className="text-gray-600 mb-6">Please evaluate the project below using the given criteria.</p>
            
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Project Information</h3>
                  
                  <div className="mb-4">
                    <Label htmlFor="participant-select">Select Participant to Evaluate</Label>
                    <Select 
                      value={selectedParticipantId?.toString() || ""} 
                      onValueChange={handleParticipantChange}
                    >
                      <SelectTrigger id="participant-select" className="w-full">
                        <SelectValue placeholder="Select a participant" />
                      </SelectTrigger>
                      <SelectContent>
                        {participants.map(participant => (
                          <SelectItem key={participant.id} value={participant.id.toString()}>
                            {participant.teamName} - {participant.projectTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedParticipant && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md">
                      <div>
                        <p className="text-sm text-gray-600">Team Name</p>
                        <p className="font-medium">{selectedParticipant.teamName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Project Title</p>
                        <p className="font-medium">{selectedParticipant.projectTitle}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4">Evaluation Criteria</h3>
                  
                  <ScoreSlider
                    id="projectDesign"
                    label="Project Design"
                    percentage="25%"
                    min={0}
                    max={100}
                    defaultValue={scores.projectDesign}
                    onChange={(value) => handleScoreChange('projectDesign', value)}
                  />
                  
                  <ScoreSlider
                    id="functionality"
                    label="Functionality"
                    percentage="30%"
                    min={0}
                    max={100}
                    defaultValue={scores.functionality}
                    onChange={(value) => handleScoreChange('functionality', value)}
                  />
                  
                  <ScoreSlider
                    id="presentation"
                    label="Presentation"
                    percentage="15%"
                    min={0}
                    max={100}
                    defaultValue={scores.presentation}
                    onChange={(value) => handleScoreChange('presentation', value)}
                  />
                  
                  <ScoreSlider
                    id="webDesign"
                    label="Web Design"
                    percentage="10%"
                    min={0}
                    max={100}
                    defaultValue={scores.webDesign}
                    onChange={(value) => handleScoreChange('webDesign', value)}
                  />
                  
                  <ScoreSlider
                    id="impact"
                    label="Impact"
                    percentage="20%"
                    min={0}
                    max={100}
                    defaultValue={scores.impact}
                    onChange={(value) => handleScoreChange('impact', value)}
                  />
                  
                  <div className="p-4 bg-gray-50 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-primary flex items-center justify-between">
                      <span>Total Score:</span>
                      <span className="bg-primary text-white py-1 px-4 rounded-full text-xl">
                        {totalScore.toFixed(2)}
                      </span>
                    </h3>
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="comments" className="block font-medium mb-2">
                      Comments / Recommendations
                    </Label>
                    <Textarea
                      id="comments"
                      rows={4}
                      placeholder="Provide your feedback about this project..."
                      value={scores.comments}
                      onChange={(e) => setScores(prev => ({ ...prev, comments: e.target.value }))}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending || !selectedParticipantId}
                    >
                      {submitMutation.isPending ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Submitting...
                        </span>
                      ) : "Submit Evaluation"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </main>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        message={successMessage}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}
