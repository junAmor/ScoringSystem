import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

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
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary">
            <TableHead className="text-white rounded-tl-lg">Team</TableHead>
            <TableHead className="text-white w-1/4">Project Title</TableHead>
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
          {participants.map((participant, index) => (
            <TableRow 
              key={participant.id}
              className={
                index === 0 ? "bg-amber-300 border-b border-gray-200" :
                index === 1 ? "bg-amber-200/70 border-b border-gray-200" :
                index === 2 ? "bg-amber-100/60 border-b border-gray-200" :
                "bg-white border-b border-gray-200"
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
                    max={30}
                    step={0.5}
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
                    max={15}
                    step={0.5}
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
                    max={10}
                    step={0.5}
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
                    max={20}
                    step={0.5}
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
              <TableCell className="text-center font-bold">
                {participant.scores.finalScore.toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
          
          {participants.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No participants found. Add participants to see the leaderboard.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
