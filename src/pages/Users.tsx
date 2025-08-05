"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { UsersTable } from "@/components/users/UsersTable";
import { EditUserDialog } from "@/components/users/EditUserDialog";
import { CreateUserDialog, CreateUserFormValues } from "@/components/users/CreateUserDialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [isCreateDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

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
    setEditDialogOpen(true);
  };

  const handleSaveUser = async (updatedUser: UserProfile) => {
    setIsSubmitting(true);
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
      setEditDialogOpen(false);
      fetchUsers();
    }
    setIsSubmitting(false);
  };

  const handleCreateUser = async (values: CreateUserFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('create-user', {
        body: values,
      });

      if (error) {
        // A função de borda retorna um JSON com a chave 'error' em caso de falha
        const errorMessage = error.context?.error || error.message;
        throw new Error(errorMessage);
      }

      toast({ title: "Usuário criado!", description: "O novo usuário foi criado com sucesso." });
      setCreateDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Erro ao criar usuário", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManageUsers = profile?.role === 'admin' || (profile?.role === 'gestor' && profile?.permissions?.edit_users);

  return (
    <>
      <Header title="Gerenciamento de Usuários">
        {canManageUsers && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </Header>
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
          isOpen={isEditDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          onSave={handleSaveUser}
        />
      )}

      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateUser}
        isLoading={isSubmitting}
      />
    </>
  );
};

export default Users;