"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { UsersTable } from "@/components/users/UsersTable";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'gestor' | 'admin';
  permissions: Record<string, boolean>;
};

const Users = () => {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const { toast } = useToast();

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, role, permissions");

    if (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Erro ao buscar usuários", description: error.message, variant: "destructive" });
    } else {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  }, [toast]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSaveUser = async (updatedUser: UserProfile) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        role: updatedUser.role,
        permissions: updatedUser.permissions,
      })
      .eq("id", updatedUser.id);

    if (error) {
      toast({ title: "Erro ao salvar usuário", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuário atualizado", description: "As permissões foram salvas com sucesso." });
      setDialogOpen(false);
      fetchUsers(); // Refresh the list
    }
  };

  return (
    <>
      <Header title="Gerenciamento de Usuários" />
      <Card>
        {loading ? (
          <div className="p-6 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <UsersTable users={users} onEditUser={handleEditUser} />
        )}
      </Card>
      {selectedUser && (
        <EditUserDialog
          isOpen={isDialogOpen}
          onOpenChange={setDialogOpen}
          user={selectedUser}
          onSave={handleSaveUser}
        />
      )}
    </>
  );
};

export default Users;