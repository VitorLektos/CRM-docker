"use client";

import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import * as React from "react";

export function Layout() {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`grid min-h-screen w-full ${
        isCollapsed 
        ? 'md:grid-cols-[56px_1fr]' 
        : 'md:grid-cols-[200px_1fr]'
    } transition-all duration-300 ease-in-out`}>
      <Sidebar isCollapsed={isCollapsed} onToggle={handleToggleSidebar} />
      <main className={`flex flex-1 flex-col gap-4 bg-background p-4 sm:p-6 md:gap-8 md:p-8 ${isMobile ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}