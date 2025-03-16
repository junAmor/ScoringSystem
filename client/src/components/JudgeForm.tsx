import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface JudgeFormProps {
  onSubmit: (username: string, password: string) => void;
  isLoading: boolean;
}

export default function JudgeForm({ onSubmit, isLoading }: JudgeFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onSubmit(username, password);
      // Don't clear the form here - let the parent component handle it on success
    }
  };

  return (
    <Card className="bg-white mb-8">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter judge username"
              disabled={isLoading}
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
                  <i className="fas fa-plus mr-2"></i> Add Judge
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
