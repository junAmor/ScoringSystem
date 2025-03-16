import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Leaderboard from "@/pages/Leaderboard";
import ParticipantManagement from "@/pages/ParticipantManagement";
import JudgeManagement from "@/pages/JudgeManagement";
import JudgeEvaluation from "@/pages/JudgeEvaluation";
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";

type User = {
  id: number;
  username: string;
  role: 'admin' | 'judge';
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useLocation();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          
          // Redirect to appropriate page if on login page
          if (location === '/') {
            setLocation('/leaderboard');
          }
        } else {
          // If not authenticated and not on login page, redirect to login
          if (location !== '/') {
            setLocation('/');
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location, setLocation]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await apiRequest('POST', '/api/login', { username, password });
      const userData = await res.json();
      setUser(userData);
      setLocation('/leaderboard');
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout', {});
      setUser(null);
      setLocation('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading && location !== '/') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <Switch>
          <Route path="/">
            <Login onLogin={handleLogin} />
          </Route>
          <Route path="/leaderboard">
            <Leaderboard user={user} onLogout={handleLogout} />
          </Route>
          <Route path="/participants">
            <ParticipantManagement user={user} onLogout={handleLogout} />
          </Route>
          <Route path="/judges">
            <JudgeManagement user={user} onLogout={handleLogout} />
          </Route>
          <Route path="/evaluation">
            <JudgeEvaluation user={user} onLogout={handleLogout} />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
