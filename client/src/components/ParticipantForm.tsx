import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ParticipantFormProps {
  onSubmit: (teamName: string, projectTitle: string) => void;
  isLoading: boolean;
}

export default function ParticipantForm({ onSubmit, isLoading }: ParticipantFormProps) {
  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim() && projectTitle.trim()) {
      onSubmit(teamName, projectTitle);
      // Don't clear the form here - let the parent component handle it on success
    }
  };

  return (
    <Card className="bg-white mb-8">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input
              id="projectTitle"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Enter project title"
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2 mt-2">
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Adding...
                </span>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i> Add Participant
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
