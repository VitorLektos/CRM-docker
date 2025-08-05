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

const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  industry: z.string().optional(),
  companyUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  address: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  initialValues?: Partial<ContactFormValues>;
  onSubmit: (values: ContactFormValues) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export function ContactForm({ initialValues, onSubmit, isLoading, isEdit = false }: ContactFormProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialValues || {
      name: "",
      email: "",
      phone: "",
      company: "",
      role: "",
      industry: "",
      companyUrl: "",
      address: "",
    },
  });

  React.useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Nome do contato" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem><FormLabel>Cargo/Posição</FormLabel><FormControl><Input placeholder="Ex: Gerente de Vendas" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="company" render={({ field }) => (
            <FormItem><FormLabel>Empresa</FormLabel><FormControl><Input placeholder="Nome da empresa" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="industry" render={({ field }) => (
            <FormItem><FormLabel>Setor da Empresa</FormLabel><FormControl><Input placeholder="Ex: Tecnologia" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="companyUrl" render={({ field }) => (
          <FormItem><FormLabel>URL da Empresa</FormLabel><FormControl><Input placeholder="https://exemplo.com" {...field} /></FormControl><FormMessage /></FormMessage>
        )} />
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input placeholder="Rua, Número, Cidade, Estado" {...field} /></FormControl><FormMessage /></FormMessage>
        )} />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : (isEdit ? "Salvar Alterações" : "Salvar Contato")}
        </Button>
      </form>
    </Form>
  );
}