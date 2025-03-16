import { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import "./leaderboard-table.css";

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
  evaluations?: string; // Added evaluations field
}

interface LeaderboardTableProps {
  participants: Participant[];
  isAdmin: boolean;
  onScoreChange: (participantId: number, criteria: string, value: number) => void;
}

export default function LeaderboardTable({ 
  participants, 
  isAdmin, 
  onScoreChange 
}: LeaderboardTableProps) {
  const [animationClasses, setAnimationClasses] = useState<Record<number, string>>({});
  const prevRankingsRef = useRef<Record<number, number>>({});
  const [open, setOpen] = useState(false); // Added state for the dialog
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null); //Added state for selected participant


  // Track rank changes for animation
  useEffect(() => {
    if (participants.length === 0) return;

    // Create current rankings
    const currentRankings: Record<number, number> = {};
    participants.forEach((p, index) => {
      currentRankings[p.id] = index;
    });

    // Skip on first render
    if (Object.keys(prevRankingsRef.current).length === 0) {
      prevRankingsRef.current = currentRankings;
      return;
    }

    // Compare with previous rankings to determine move direction
    const newAnimationClasses: Record<number, string> = {};

    participants.forEach((participant) => {
      const prevRank = prevRankingsRef.current[participant.id];
      const currentRank = currentRankings[participant.id];

      if (prevRank !== undefined && prevRank !== currentRank) {
        if (prevRank > currentRank) {
          // Moved up in ranking
          newAnimationClasses[participant.id] = 'move-up';
        } else if (prevRank < currentRank) {
          // Moved down in ranking
          newAnimationClasses[participant.id] = 'move-down';
        }
      }
    });

    setAnimationClasses(newAnimationClasses);
    prevRankingsRef.current = currentRankings;

    // Clear animation classes after animation completes
    const timer = setTimeout(() => {
      setAnimationClasses({});
    }, 1100);

    return () => clearTimeout(timer);
  }, [participants]);

  // Sort participants by score
  const sortedParticipants = [...participants].sort((a, b) => 
    b.scores.finalScore - a.scores.finalScore
  );

  const handleViewEvaluations = (participant: Participant) => {
    setSelectedParticipant(participant);
    setOpen(true);
  };

  return (
    <div className="overflow-hidden">
      <Table className="leaderboard w-full">
        <TableHeader>
          <TableRow className="bg-primary rounded-t-[50px]">
            <TableHead className="text-white rounded-tl-[50px] font-bold w-[120px]">Team</TableHead>
            <TableHead className="text-white font-bold w-[150px]">Project Title</TableHead>
            <TableHead className="text-white text-center font-bold w-[100px]">
              Project Design
              <span className="text-xs block">(25%)</span>
            </TableHead>
            <TableHead className="text-white text-center font-bold w-[100px]">
              Functionality
              <span className="text-xs block">(30%)</span>
            </TableHead>
            <TableHead className="text-white text-center font-bold w-[100px]">
              Presentation
              <span className="text-xs block">(15%)</span>
            </TableHead>
            <TableHead className="text-white text-center font-bold w-[100px]">
              Web Design
              <span className="text-xs block">(10%)</span>
            </TableHead>
            <TableHead className="text-white text-center font-bold w-[100px]">
              Impact
              <span className="text-xs block">(20%)</span>
            </TableHead>
            <TableHead className="text-white text-center font-bold w-[100px]">
              Final Score
            </TableHead>
            <TableHead className="text-white text-center rounded-tr-[50px] font-bold w-[50px]">
              View Evaluations
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.map((participant, index) => (
            <TableRow 
              key={participant.id}
              className={`
                ${index === 0 ? "bg-amber-300 rounded-[50px]" :
                  index === 1 ? "bg-amber-200/70 rounded-[50px]" :
                  index === 2 ? "bg-amber-100/60 rounded-[50px]" :
                  "bg-white rounded-[50px] hover:bg-teal-50/70 hover:shadow-md"
                }
                ${animationClasses[participant.id] || ''}
              `}
            >
              <TableCell className="font-medium rounded-l-[50px]">
                <div className="flex items-center">
                  <span className="bg-primary text-white font-bold w-7 h-7 flex items-center justify-center rounded-full mr-2">
                    {index + 1}
                  </span>
                  {participant.teamName}
                </div>
              </TableCell>
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
                    max={100}
                    step={1}
                    onChange={(e) => onScoreChange(
                      participant.id, 
                      'projectDesign', 
                      parseFloat(e.target.value)
                    )}
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
                    max={100}
                    step={1}
                    onChange={(e) => onScoreChange(
                      participant.id, 
                      'functionality', 
                      parseFloat(e.target.value)
                    )}
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
                    max={100}
                    step={1}
                    onChange={(e) => onScoreChange(
                      participant.id, 
                      'presentation', 
                      parseFloat(e.target.value)
                    )}
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
                    max={100}
                    step={1}
                    onChange={(e) => onScoreChange(
                      participant.id, 
                      'webDesign', 
                      parseFloat(e.target.value)
                    )}
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
                    max={100}
                    step={1}
                    onChange={(e) => onScoreChange(
                      participant.id, 
                      'impact', 
                      parseFloat(e.target.value)
                    )}
                  />
                ) : (
                  participant.scores.impact.toFixed(1)
                )}
              </TableCell>
              <TableCell className="text-center font-bold rounded-r-[50px] text-lg">
                {participant.scores.finalScore.toFixed(1)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => handleViewEvaluations(participant)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {participants.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No participants found. Add participants to see the leaderboard.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedParticipant?.projectTitle} Evaluations
            </DialogTitle>
          </DialogHeader>
          <p>Evaluations: {selectedParticipant?.evaluations || "No evaluations available"}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}