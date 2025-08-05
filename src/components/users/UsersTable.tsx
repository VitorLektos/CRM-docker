"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { UserProfile } from "@/pages/Users";

interface UsersTableProps {
  users: UserProfile[];
  onEditUser: (user: UserProfile) => void;
}

const roleLabels: Record<UserProfile['role'], string> = {
  user: 'Usuário',
  gestor: 'Gestor',
  admin: 'Admin',
};

export function UsersTable({ users, onEditUser }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Função</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              {user.first_name || 'N/A'} {user.last_name || ''}
            </TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {roleLabels[user.role]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => onEditUser(user)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}