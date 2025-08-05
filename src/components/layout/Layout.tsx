"use client";

import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import * as React from "react";

export function Layout() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`grid min-h-screen w-full md:grid-cols-[${isCollapsed ? "68px" : "240px"}_1fr] transition-[grid-template-columns] duration-300 ease-in-out`}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="flex flex-1 flex-col gap-4 bg-background p-4 sm:p-6 md:gap-8 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}