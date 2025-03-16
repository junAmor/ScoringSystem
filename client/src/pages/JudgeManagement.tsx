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
      await apiRequest('DELETE', `/api/users/${id}`, {});
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

  const handleAddJudge = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate({ username, password });
  };

  const handleUpdateJudge = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingJudge) return;

    const updateData: any = {};
    
    if (editingJudge.username.trim()) {
      updateData.username = editingJudge.username;
    }
    
    if (editPassword.trim()) {
      updateData.password = editPassword;
    }
    
    if (Object.keys(updateData).length === 0) {
      toast({
        title: "Error",
        description: "No changes to update",
        variant: "destructive",
      });
      return;
    }
    
    updateMutation.mutate({
      id: editingJudge.id,
      ...updateData
    });
  };

  const handleDeleteClick = (judge: Judge) => {
    // Don't allow deleting self
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
            <h2 className="text-2xl font-bold text-primary mb-6">Judge Account Management</h2>
            
            <Card className="bg-white mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleAddJudge} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter judge username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter judge password"
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
                          <i className="fas fa-plus mr-2"></i> Add Judge
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary">
                      <TableHead className="text-white rounded-tl-lg">Username</TableHead>
                      <TableHead className="text-white">Role</TableHead>
                      <TableHead className="text-white text-center rounded-tr-lg">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {judges.filter(judge => judge.role === 'judge').map((judge) => (
                      <TableRow key={judge.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <TableCell className="font-medium">{judge.username}</TableCell>
                        <TableCell>Judge</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2 bg-blue-500 hover:bg-blue-600 text-white"
                            onClick={() => setEditingJudge(judge)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleDeleteClick(judge)}
                            disabled={judge.id === user.id}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {judges.filter(judge => judge.role === 'judge').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                          No judges found. Add a judge to get started.
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
      
      {/* Edit Judge Dialog */}
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
              <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Enter new password"
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
              This will permanently delete the judge account "{judgeToDelete?.username}".
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
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function JudgeManagement() {
  const { toast } = useToast();
  const [judges, setJudges] = useState([]);
  const [newJudge, setNewJudge] = useState({ username: '', password: '' });

  useEffect(() => {
    fetchJudges();
  }, []);

  const fetchJudges = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setJudges(data.filter(user => user.role === 'judge'));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch judges",
        variant: "destructive"
      });
    }
  };

  const handleAddJudge = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newJudge, role: 'judge' })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Judge added successfully"
        });
        setNewJudge({ username: '', password: '' });
        fetchJudges();
      } else {
        throw new Error('Failed to add judge');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add judge",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJudge = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Judge deleted successfully"
        });
        fetchJudges();
      } else {
        throw new Error('Failed to delete judge');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete judge",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Judge Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Username"
              value={newJudge.username}
              onChange={(e) => setNewJudge(prev => ({...prev, username: e.target.value}))}
            />
            <Input
              type="password"
              placeholder="Password"
              value={newJudge.password}
              onChange={(e) => setNewJudge(prev => ({...prev, password: e.target.value}))}
            />
            <Button onClick={handleAddJudge}>Add Judge</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {judges.map((judge: any) => (
                <TableRow key={judge.id}>
                  <TableCell>{judge.username}</TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteJudge(judge.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
