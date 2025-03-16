import { useState } from "react";
import MainHeader from "@/components/MainHeader";
import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SuccessModal from "@/components/SuccessModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ParticipantManagementProps {
  user: any;
  onLogout: () => void;
}

interface Participant {
  id: number;
  teamName: string;
  projectTitle: string;
}

export default function ParticipantManagement({ user, onLogout }: ParticipantManagementProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const isAdmin = user?.role === 'admin';

  const { data: participants = [], isLoading } = useQuery<Participant[]>({
    queryKey: ['/api/participants'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { teamName: string; projectTitle: string }) => {
      const res = await apiRequest('POST', '/api/participants', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      setTeamName("");
      setProjectTitle("");
      setSuccessMessage("Participant added successfully!");
      setIsSuccessModalOpen(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add participant",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; teamName: string; projectTitle: string }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest('PUT', `/api/participants/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      setEditingParticipant(null);
      setSuccessMessage("Participant updated successfully!");
      setIsSuccessModalOpen(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update participant",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/participants/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      setSuccessMessage("Participant deleted successfully!");
      setIsSuccessModalOpen(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete participant",
        variant: "destructive",
      });
    },
  });

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName || !projectTitle) {
      toast({
        title: "Error",
        description: "Please enter both Team Name and Project Title",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate({ teamName, projectTitle });
  };

  const handleUpdateParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingParticipant || !editingParticipant.teamName || !editingParticipant.projectTitle) {
      toast({
        title: "Error",
        description: "Please enter both Team Name and Project Title",
        variant: "destructive",
      });
      return;
    }
    
    updateMutation.mutate({
      id: editingParticipant.id,
      teamName: editingParticipant.teamName,
      projectTitle: editingParticipant.projectTitle
    });
  };

  const handleDeleteClick = (participant: Participant) => {
    setParticipantToDelete(participant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (participantToDelete) {
      deleteMutation.mutate(participantToDelete.id);
      setIsDeleteDialogOpen(false);
      setParticipantToDelete(null);
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
            <h2 className="text-2xl font-bold text-primary mb-6">Participant Account Management</h2>
            
            {isAdmin && (
              <Card className="bg-white mb-8">
                <CardContent className="pt-6">
                  <form onSubmit={handleAddParticipant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teamName">Team Name</Label>
                      <Input
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter team name"
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
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <Button 
                        type="submit"
                        disabled={createMutation.isPending}
                        className="w-full md:w-auto"
                      >
                        {createMutation.isPending ? (
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
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary">
                      <TableHead className="text-white rounded-tl-lg">Team Name</TableHead>
                      <TableHead className="text-white">Project Title</TableHead>
                      {isAdmin && (
                        <TableHead className="text-white text-center rounded-tr-lg">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="font-medium">{participant.teamName}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate hover:text-clip hover:overflow-visible hover:whitespace-normal hover:cursor-help">
                            {participant.projectTitle}
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2 bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => setEditingParticipant(participant)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleDeleteClick(participant)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    
                    {participants.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 3 : 2} className="text-center py-8 text-gray-500">
                          No participants found. {isAdmin ? "Add a participant to get started." : ""}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Edit Participant Dialog */}
      <Dialog 
        open={!!editingParticipant} 
        onOpenChange={(open) => !open && setEditingParticipant(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Participant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateParticipant} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-teamName">Team Name</Label>
              <Input
                id="edit-teamName"
                value={editingParticipant?.teamName || ""}
                onChange={(e) => setEditingParticipant(prev => 
                  prev ? { ...prev, teamName: e.target.value } : null
                )}
                placeholder="Enter team name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-projectTitle">Project Title</Label>
              <Input
                id="edit-projectTitle"
                value={editingParticipant?.projectTitle || ""}
                onChange={(e) => setEditingParticipant(prev => 
                  prev ? { ...prev, projectTitle: e.target.value } : null
                )}
                placeholder="Enter project title"
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the participant "{participantToDelete?.teamName}" and all associated scores.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        message={successMessage}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}
