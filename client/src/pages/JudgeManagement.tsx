import { useState, useEffect } from "react";
import MainHeader from "@/components/MainHeader";
import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SuccessModal from "@/components/SuccessModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface JudgeManagementProps {
  user: any;
  onLogout: () => void;
}

interface Judge {
  id: number;
  username: string;
  role: string;
}

export default function JudgeManagement({ user, onLogout }: JudgeManagementProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [judgeToDelete, setJudgeToDelete] = useState<Judge | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Unauthorized Access</h2>
        <p className="mb-4">You do not have permission to view this page.</p>
        <Button onClick={() => window.location.href = "/leaderboard"}>
          Return to Leaderboard
        </Button>
      </div>
    );
  }

  const { data: judges = [], isLoading } = useQuery<Judge[]>({
    queryKey: ['/api/users'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/users', { ...data, role: 'judge' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setUsername("");
      setPassword("");
      setSuccessMessage("Judge added successfully!");
      setIsSuccessModalOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add judge",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; username?: string; password?: string }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest('PUT', `/api/users/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingJudge(null);
      setEditPassword("");
      setSuccessMessage("Judge updated successfully!");
      setIsSuccessModalOpen(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update judge",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/users/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setSuccessMessage("Judge deleted successfully!");
      setIsSuccessModalOpen(true);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete judge",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (judge: Judge) => {
    if (judge.id === user.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    setJudgeToDelete(judge);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (judgeToDelete) {
      deleteMutation.mutate(judgeToDelete.id);
      setIsDeleteDialogOpen(false);
      setJudgeToDelete(null);
    }
  };

  const handleUpdateJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJudge) {
      const updateData: { id: number; username?: string; password?: string } = {
        id: editingJudge.id,
      };
      if (editingJudge.username) updateData.username = editingJudge.username;
      if (editPassword) updateData.password = editPassword;
      updateMutation.mutate(updateData);
    }
  };

  return (
    <div className="min-h-screen">
      <MainHeader user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Judge Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button 
                    onClick={() => createMutation.mutate({ username, password })}
                    disabled={!username || !password}
                  >
                    Add Judge
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {judges.filter(judge => judge.role === 'judge').map((judge) => (
                      <TableRow key={judge.id}>
                        <TableCell>{judge.username}</TableCell>
                        <TableCell className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingJudge(judge)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteClick(judge)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {judges.filter(judge => judge.role === 'judge').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                          No judges found. Add a judge to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <Dialog 
        open={!!editingJudge} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingJudge(null);
            setEditPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Judge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateJudge} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editingJudge?.username || ""}
                onChange={(e) => setEditingJudge(prev => 
                  prev ? { ...prev, username: e.target.value } : null
                )}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the judge account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />
    </div>
  );
}