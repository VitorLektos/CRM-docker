"use client";

import { NavLink } from "react-router-dom";
import { Home, KanbanSquare, Users, Settings, Code, Menu, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import * as React from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/funnels", icon: KanbanSquare, label: "Funis" },
  { to: "/contacts", icon: Users, label: "Contatos" },
  { to: "/settings", icon: Settings, label: "Configurações" },
  { to: "/api", icon: Code, label: "API" },
];

const NavLinks = ({ isMobile = false }) => (
  <nav className={`flex flex-col gap-2 ${isMobile ? 'p-4' : ''}`}>
    {navItems.map(({ to, icon: Icon, label }) => {
      const linkContent = (
        <>
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </>
      );

      if (isMobile) {
        return (
          <SheetClose asChild key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                }`
              }
            >
              {linkContent}
            </NavLink>
          </SheetClose>
        );
      }

      return (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              isActive ? "bg-muted text-primary" : "text-muted-foreground"
            }`
          }
        >
          {linkContent}
        </NavLink>
      );
    })}
  </nav>
);

const SidebarHeader = () => (
    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span>CRM</span>
        </NavLink>
    </div>
);


export function Sidebar() {
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
            <SidebarHeader />
            <div className="flex-1">
              <NavLinks isMobile />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <SidebarHeader />
        <div className="flex-1">
          <NavLinks />
        </div>
      </div>
    </div>
  );
}