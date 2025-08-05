"use client";

import { NavLink } from "react-router-dom";
import { Home, KanbanSquare, Users, Settings, Code, Menu, Rocket, Calendar, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import * as React from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/funnels", icon: KanbanSquare, label: "Funis" },
  { to: "/contacts", icon: Users, label: "Contatos" },
  { to: "/calendar", icon: Calendar, label: "Calendário" },
  { to: "/goals", icon: Target, label: "Metas" },
  { to: "/settings", icon: Settings, label: "Configurações" },
  { to: "/api", icon: Code, label: "API" },
];

const NavLinks = ({ isMobile = false, isCollapsed = false }) => (
  <nav className="flex flex-col gap-2 px-2">
    {navItems.map(({ to, icon: Icon, label }) => {
      const linkContent = (
        <>
          <Icon className="h-5 w-5" />
          <span className={cn("truncate", isCollapsed && "hidden")}>{label}</span>
        </>
      );

      const link = (
        <NavLink
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              isCollapsed && "justify-center",
              isActive ? "bg-muted text-primary" : "text-muted-foreground"
            )
          }
        >
          {linkContent}
        </NavLink>
      );

      if (isMobile) {
        return <SheetClose asChild key={to}>{link}</SheetClose>;
      }

      if (isCollapsed) {
        return (
          <Tooltip key={to} delayDuration={0}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        );
      }

      return React.cloneElement(link, { key: to });
    })}
  </nav>
);

const SidebarHeader = ({ isCollapsed }: { isCollapsed: boolean }) => (
    <div className={cn("flex h-14 items-center border-b px-4 lg:h-[60px]", isCollapsed ? 'justify-center px-2' : 'lg:px-6')}>
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Rocket className="h-6 w-6 text-primary" />
            <span className={cn(isCollapsed && "hidden")}>Acelerador</span>
        </NavLink>
    </div>
);

export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <SidebarHeader isCollapsed={false} />
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <SheetClose asChild key={to}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                          isActive ? "bg-muted text-primary" : "text-muted-foreground"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </NavLink>
                  </SheetClose>
                ))}
              </nav>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col">
        <SidebarHeader isCollapsed={isCollapsed} />
        <div className="flex-1 overflow-auto py-2">
          <NavLinks isCollapsed={isCollapsed} />
        </div>
        <div className="mt-auto p-2 border-t">
          <Button variant="outline" size="icon" onClick={onToggle} className="w-full">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">Recolher menu</span>
          </Button>
        </div>
      </div>
    </div>
  );
}