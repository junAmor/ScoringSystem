import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";

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

  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery<Participant[]>({
    queryKey: ['/api/participants'],
  });

  const { data: judgeScores = [], isLoading: isLoadingScores } = useQuery<Score[]>({
    queryKey: [`/api/scores/judge/${user?.id}`],
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Score) => {
      // Convert all score values to numbers
      const numericData = {
        ...data,
        participantId: Number(data.participantId),
        judgeId: Number(data.judgeId),
        projectDesign: Number(data.projectDesign),
        functionality: Number(data.functionality),
        presentation: Number(data.presentation),
        webDesign: Number(data.webDesign),
        impact: Number(data.impact)
      };
      
      const res = await apiRequest('POST', '/api/scores', numericData);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit evaluation");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/scores/judge/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      
      // Reset form to defaults or load next participant
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
      
      // Show success message
      setSuccessMessage("Evaluation submitted successfully!");
      setIsSuccessModalOpen(true);
    },
    onError: (error: any) => {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit evaluation. Please try again.",
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

  const handleSliderChange = (sliderId: string, value: number) => {
    if (sliderId === "projectDesign") {
      handleScoreChange('projectDesign', value);
    } else if (sliderId === "functionality") {
      handleScoreChange('functionality', value);
    } else if (sliderId === "presentation") {
      handleScoreChange('presentation', value);
    } else if (sliderId === "webDesign") {
      handleScoreChange('webDesign', value);
    } else if (sliderId === "impact") {
      handleScoreChange('impact', value);
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="container max-w-3xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-teal-700">Welcome, {user?.username}!</h2>
              <div className="flex justify-end mb-2">
                <Button variant="outline" onClick={onLogout} size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                  Log Out
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="participant-select" className="font-medium text-teal-700">Select Participant to Evaluate</Label>
              <Select 
                value={selectedParticipantId?.toString() || ""} 
                onValueChange={handleParticipantChange}
              >
                <SelectTrigger id="participant-select" className="w-full mt-1">
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
              <div className="mb-6 bg-teal-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-teal-700">Team Name</p>
                    <p className="font-medium">{selectedParticipant.teamName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-teal-700">Project Title</p>
                    <p className="font-medium">{selectedParticipant.projectTitle}</p>
                  </div>
                </div>
              </div>
            )}
            
            <h3 className="text-xl font-bold text-teal-700 mb-4">Evaluation Criteria</h3>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Project Design <span className="text-sm text-gray-500">(25%)</span>
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  id="projectDesign" 
                  min={0} 
                  max={100} 
                  value={scores.projectDesign} 
                  onChange={(e) => handleSliderChange("projectDesign", parseInt(e.target.value))}
                  className="w-full h-2" 
                />
                <Badge variant="secondary" className="ml-4 bg-teal-100 text-teal-800 min-w-[3rem] text-center">
                  {scores.projectDesign}
                </Badge>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Functionality <span className="text-sm text-gray-500">(30%)</span>
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  id="functionality" 
                  min={0} 
                  max={100} 
                  value={scores.functionality} 
                  onChange={(e) => handleSliderChange("functionality", parseInt(e.target.value))}
                  className="w-full h-2" 
                />
                <Badge variant="secondary" className="ml-4 bg-teal-100 text-teal-800 min-w-[3rem] text-center">
                  {scores.functionality}
                </Badge>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Presentation <span className="text-sm text-gray-500">(15%)</span>
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  id="presentation" 
                  min={0} 
                  max={100} 
                  value={scores.presentation} 
                  onChange={(e) => handleSliderChange("presentation", parseInt(e.target.value))}
                  className="w-full h-2" 
                />
                <Badge variant="secondary" className="ml-4 bg-teal-100 text-teal-800 min-w-[3rem] text-center">
                  {scores.presentation}
                </Badge>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Web Design <span className="text-sm text-gray-500">(10%)</span>
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  id="webDesign" 
                  min={0} 
                  max={100} 
                  value={scores.webDesign} 
                  onChange={(e) => handleSliderChange("webDesign", parseInt(e.target.value))}
                  className="w-full h-2" 
                />
                <Badge variant="secondary" className="ml-4 bg-teal-100 text-teal-800 min-w-[3rem] text-center">
                  {scores.webDesign}
                </Badge>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Impact <span className="text-sm text-gray-500">(20%)</span>
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  id="impact" 
                  min={0} 
                  max={100} 
                  value={scores.impact} 
                  onChange={(e) => handleSliderChange("impact", parseInt(e.target.value))}
                  className="w-full h-2" 
                />
                <Badge variant="secondary" className="ml-4 bg-teal-100 text-teal-800 min-w-[3rem] text-center">
                  {scores.impact}
                </Badge>
              </div>
            </div>
            
            <div className="p-4 bg-teal-50 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-teal-700 flex items-center justify-between">
                <span>Total Score:</span>
                <span className="bg-teal-600 text-white py-1 px-4 rounded-full text-xl">
                  {totalScore.toFixed(2)}
                </span>
              </h3>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="comments" className="block font-medium text-teal-700 mb-2">
                Comments / Recommendations
              </Label>
              <Textarea
                id="comments"
                rows={4}
                placeholder="Provide your feedback about this project..."
                value={scores.comments}
                onChange={(e) => setScores(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleSubmit}
                disabled={submitMutation.isPending || !selectedParticipantId}
                className="bg-teal-600 hover:bg-teal-700 px-8"
              >
                {submitMutation.isPending ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Submitting...
                  </span>
                ) : "Submit Evaluation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        message={successMessage}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}
