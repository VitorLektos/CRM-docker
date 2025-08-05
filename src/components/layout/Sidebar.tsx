"use client";

import { NavLink, useNavigate } from "react-router-dom";
import { Home, KanbanSquare, Users, Settings, Code, Menu, Rocket, Calendar, Target, BookUser, LogOut } from "lucide-react";
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
            <Rocket className="h-6 w-6 text-primary" />
            <span>Acelerador</span>
        </NavLink>
    </div>
);

const LogoutButton = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-primary">
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
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
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <SidebarHeader />
        <div className="flex-1">
          <NavLinks />
        </div>
        <div className="mt-auto p-4 border-t">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}