import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MainHeaderProps {
  onToggleSidebar: () => void;
}

export default function MainHeader({ onToggleSidebar }: MainHeaderProps) {
  return (
    <header className="bg-primary text-white py-3 px-4 fixed top-0 w-full z-10 shadow-md">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-xl font-bold">2nd ARDUINO INNOVATOR CHALLENGE</h1>
          <p className="text-sm">Microcontroller-Based Competition</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-primary-foreground/10"
          onClick={onToggleSidebar}
        >
          <i className="fas fa-bars text-xl"></i>
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
    </header>
  );
}
