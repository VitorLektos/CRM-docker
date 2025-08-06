"use client";

import { NavLink, useNavigate } from "react-router-dom";
import { Home, KanbanSquare, Users, Settings, Code, Menu, Calendar, Target, BookUser, LogOut, ChevronsLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import * as React from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/funnels", icon: KanbanSquare, label: "Funis" },
  { to: "/contacts", icon: BookUser, label: "Contatos" },
  { to: "/calendar", icon: Calendar, label: "Calendário" },
  { to: "/goals", icon: Target, label: "Metas" },
  { to: "/users", icon: Users, label: "Usuários" },
  { to: "/settings", icon: Settings, label: "Configurações" },
  { to: "/api", icon: Code, label: "API" },
];

const NavLinks = ({ isMobile = false, isCollapsed = false }) => {
  const navContent = (
    <nav className={cn("flex flex-col gap-2", isMobile ? 'p-4' : isCollapsed ? 'px-2' : 'px-4')}>
      {navItems.map(({ to, icon: Icon, label }) => {
        const navLink = (
          <NavLink
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg py-2 transition-all hover:text-primary",
                isCollapsed && !isMobile ? "h-9 w-9 justify-center px-0" : "px-3",
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className={cn(isCollapsed && !isMobile ? "sr-only" : "")}>{label}</span>
          </NavLink>
        );

        if (isMobile) {
          return <SheetClose asChild key={to}>{navLink}</SheetClose>;
        }

        return (
          <Tooltip key={to}>
            <TooltipTrigger asChild>{navLink}</TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">{label}</TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </nav>
  );

  return isMobile ? navContent : <TooltipProvider delayDuration={0}>{navContent}</TooltipProvider>;
};

const SidebarHeader = ({ isCollapsed = false }) => (
    <div className={cn("flex h-14 items-center border-b lg:h-[60px]", isCollapsed ? "justify-center px-2" : "justify-start px-4")}>
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <img src="/acelerador-logo.png" alt="Acelerador Estratégico" className={cn("w-auto", isCollapsed ? "w-full" : "h-9")} />
        </NavLink>
    </div>
);

const LogoutButton = ({ isCollapsed = false }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className={cn("w-full justify-start gap-3 px-3 text-muted-foreground hover:text-primary", isCollapsed && "h-9 w-9 justify-center p-0")}>
          <LogOut className="h-5 w-5" />
          <span className={cn(isCollapsed ? "sr-only" : "")}>Sair</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Sua sessão será encerrada e você precisará fazer login novamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>Sair</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0 flex flex-col">
          <SidebarHeader />
          <div className="flex-1">
            <NavLinks isMobile />
          </div>
          <div className="mt-auto p-4 border-t">
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden border-r bg-muted/40 md:block relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 -right-4 h-8 w-8 rounded-full bg-background border hover:bg-muted z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronsLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
      </Button>
      <div className="flex h-full max-h-screen flex-col">
        <SidebarHeader isCollapsed={isCollapsed} />
        <div className="flex-1 py-2 overflow-y-auto">
          <NavLinks isCollapsed={isCollapsed} />
        </div>
        <div className={cn("mt-auto border-t", isCollapsed ? "p-2" : "p-4")}>
          <LogoutButton isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
}