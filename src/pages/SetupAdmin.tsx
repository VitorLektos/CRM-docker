"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const setupSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().optional(),
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
});

type SetupFormValues = z.infer<typeof setupSchema>;

const SetupAdmin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      firstName: "SDR",
      lastName: "Acelerador",
      email: "sdr.acelerador@gmail.com",
      password: "",
    },
  });

  const handleFormSubmit = async (values: SetupFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('create-user', {
        body: { ...values, role: 'admin' }, // Always create an admin
      });

      if (error) {
        const errorMessage = error.context?.error || error.message;
        throw new Error(errorMessage);
      }

      toast({ title: "Administrador criado!", description: "Você já pode fazer login com suas novas credenciais." });
      navigate('/login');
    } catch (error: any) {
      toast({ title: "Erro ao criar administrador", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Configurar Administrador</CardTitle>
          <CardDescription>
            Crie a primeira conta de administrador para acessar o sistema. Use as credenciais fornecidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} readOnly /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" placeholder="Digite a senha: @acelerador2025sdr" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Criando..." : "Criar Administrador"}
                  </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAdmin;