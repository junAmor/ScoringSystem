import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  user?: { role: string };
}

export default function Sidebar({ isOpen, onClose, isAdmin, user }: SidebarProps) {
  // Close sidebar when clicking a link
  const handleNavigation = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay to capture clicks outside sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`fixed top-14 right-0 w-64 h-[calc(100vh-3.5rem)] bg-primary text-white shadow-lg transition-transform duration-300 z-30 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-4 space-y-2">
          <Link href="/leaderboard" onClick={handleNavigation}>
            <Button variant="secondary" className="w-full justify-start text-primary">
              <i className="fas fa-trophy mr-2"></i> Leaderboard
            </Button>
          </Link>

          <Link href="/participants" onClick={handleNavigation}>
            <Button variant="secondary" className="w-full justify-start text-primary">
              <i className="fas fa-users mr-2"></i> Participant Accounts
            </Button>
          </Link>

          {isAdmin && (
            <>
              <Link to="/judge-management" onClick={onClose}>
                <Button variant="secondary" className="w-full justify-start text-primary">
                  <i className="fas fa-user-shield mr-2"></i> Judge Accounts
                </Button>
              </Link>
              <Link to="/settings" onClick={onClose}>
                <Button variant="secondary" className="w-full justify-start text-primary">
                  <i className="fas fa-cog mr-2"></i> Settings
                </Button>
              </Link>
            </>
          )}

          {user?.role === 'judge' && (
            <Link to="/judge-evaluation" onClick={onClose}>
              <Button variant="secondary" className="w-full justify-start text-primary">
                <i className="fas fa-clipboard-check mr-2"></i> Evaluation
              </Button>
            </Link>
          )}

          <hr className="border-primary/30 my-2" />

          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={() => {
              onClose();
              onLogout();
            }}
          >
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
          </Button>
        </div>
      </aside>
    </>
  );
}