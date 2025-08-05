"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermission } from "@/hooks/use-permission";
import { supabase } from "@/integrations/supabase/client";
import { TeamTable } from "@/components/team/TeamTable";
import { EditUserDialog } from "@/components/team/EditUserDialog";
import { Skeleton } from "@/components/ui/skeleton";

const TeamPage = () => {
  const { profile } = usePermission();
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers();
    }
  }, [profile, fetchUsers]);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para ver esta página.</p>
      </div>
    );
  }

  return (
    <>
      <Header title="Gerenciamento de Equipe" />
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>Gerencie as funções e permissões dos usuários do seu CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <TeamTable users={users} onEditUser={handleEditUser} />
          )}
        </CardContent>
      </Card>
      <EditUserDialog
        user={selectedUser}
        isOpen={isEditDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUserUpdate={fetchUsers}
      />
    </>
  );
};

export default TeamPage;