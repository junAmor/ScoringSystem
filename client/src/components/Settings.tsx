import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <Link to="/leaderboard">
          <Button variant="outline">
            <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <Button
            variant="outline"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      </div>
    </div>
  );
}