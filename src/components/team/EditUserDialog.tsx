"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const permissionsList = [
  { id: 'funnels.create', label: 'Criar Funis' },
  { id: 'cards.move', label: 'Mover Cards entre Estágios' },
  { id: 'tasks.create', label: 'Criar Tarefas nos Cards' },
  { id: 'settings.update', label: 'Alterar Configurações Gerais' },
];

interface EditUserDialogProps {
  user: any | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUserUpdate: () => void;
}

export function EditUserDialog({ user, isOpen, onOpenChange, onUserUpdate }: EditUserDialogProps) {
  const { toast } = useToast();
  const form = useForm();

  React.useEffect(() => {
    if (user) {
      form.reset({
        role: user.role,
        permissions: permissionsList.reduce((acc, perm) => {
          acc[perm.id] = user.permissions?.[perm.id] || false;
          return acc;
        }, {} as { [key: string]: boolean }),
      });
    }
  }, [user, form]);

  const onSubmit = async (data: any) => {
    if (!user) return;

    const permissionsToSave = Object.entries(data.permissions)
      .filter(([, value]) => value === true)
      .reduce((obj, [key]) => {
        obj[key] = true;
        return obj;
      }, {} as { [key: string]: boolean });

    const { error } = await supabase
      .from('profiles')
      .update({ role: data.role, permissions: permissionsToSave })
      .eq('id', user.id);

    if (error) {
      toast({ title: "Erro ao atualizar usuário", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Usuário atualizado!", description: `As permissões de ${user.first_name || 'usuário'} foram salvas.` });
      onUserUpdate();
      onOpenChange(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário: {user.first_name} {user.last_name}</DialogTitle>
          <DialogDescription>Altere a função e as permissões específicas para este usuário.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecione uma função" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Permissões Específicas</FormLabel>
              <div className="space-y-2 mt-2 p-4 border rounded-md">
                {permissionsList.map((permission) => (
                  <FormField
                    key={permission.id}
                    control={form.control}
                    name={`permissions.${permission.id}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">{permission.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}