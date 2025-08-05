"use client";

import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function Layout() {
  const isMobile = useIsMobile();
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <main className={`flex flex-1 flex-col gap-4 bg-background p-4 sm:p-6 md:gap-8 md:p-8 ${isMobile ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}