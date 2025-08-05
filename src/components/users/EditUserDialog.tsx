"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserProfile } from "@/pages/Users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserProfile;
  onSave: (user: UserProfile) => void;
}

const availablePermissions = [
  { key: 'view_users', label: 'Visualizar Usuários' },
  { key: 'edit_users', label: 'Editar Usuários' },
  { key: 'create_funnels', label: 'Criar Funis' },
  { key: 'edit_funnels', label: 'Editar Funis' },
  { key: 'delete_funnels', label: 'Excluir Funis' },
  { key: 'manage_stages', label: 'Gerenciar Estágios' },
  { key: 'manage_goals', label: 'Gerenciar Metas' },
];

export function EditUserDialog({ isOpen, onOpenChange, user, onSave }: EditUserDialogProps) {
  const [editedUser, setEditedUser] = React.useState<UserProfile>(user);

  React.useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleRoleChange = (role: UserProfile['role']) => {
    const newPermissions = role === 'gestor' ? editedUser.permissions : {};
    setEditedUser({ ...editedUser, role, permissions: newPermissions });
  };

  const handlePermissionChange = (key: string, value: boolean) => {
    setEditedUser({
      ...editedUser,
      permissions: {
        ...editedUser.permissions,
        [key]: value,
      },
    });
  };

  const handleSaveChanges = () => {
    onSave(editedUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere a função e as permissões de {user.first_name || 'usuário'}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Função
            </Label>
            <Select
              value={editedUser.role}
              onValueChange={(value: UserProfile['role']) => handleRoleChange(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="gestor">Gestor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editedUser.role === 'gestor' && (
            <Card>
              <CardHeader>
                <CardTitle>Permissões Granulares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePermissions.map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor={perm.key} className="flex-1">{perm.label}</Label>
                    <Switch
                      id={perm.key}
                      checked={!!editedUser.permissions[perm.key]}
                      onCheckedChange={(checked) => handlePermissionChange(perm.key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}