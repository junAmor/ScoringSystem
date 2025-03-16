import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface JudgeLoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export default function JudgeLogin({ onLogin }: JudgeLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await onLogin(username, password);
      if (!success) {
        toast({
          title: "Error",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white py-3 px-4 fixed top-0 w-full z-10 shadow-md">
        <div className="text-center">
          <h1 className="text-xl font-bold">2nd ARDUINO INNOVATOR CHALLENGE</h1>
          <p className="text-sm">Microcontroller-Based Competition</p>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center mt-24 px-4">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-teal-700">Judge Evaluation Portal</h1>
                <p className="text-gray-600 mt-2">Log in to access your judging panel</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                        Logging in...
                      </span>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-600">
                <p>For admin login, please go to the <a href="/" className="text-teal-600 hover:underline">main dashboard</a>.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}