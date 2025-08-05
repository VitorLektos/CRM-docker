"use client";

import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Layout() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div 
      className={cn(
        "grid min-h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out",
        isCollapsed ? "md:grid-cols-[68px_1fr]" : "md:grid-cols-[240px_1fr]"
      )}
    >
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="flex flex-1 flex-col gap-4 bg-background p-4 sm:p-6 md:gap-8 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}