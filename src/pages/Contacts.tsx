"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContactForm, ContactFormValues } from "@/components/crm/ContactForm";
import { DeleteContactDialog } from "@/components/crm/DeleteContactDialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Upload, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Papa from "papaparse";

export interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  industry?: string | null;
  company_url?: string | null;
  address?: string | null;
  created_at: string;
  created_by?: string | null;
}

const Contacts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const [isFormOpen, setFormOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);

  const fetchContacts = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao buscar contatos", description: error.message, variant: "destructive" });
    } else {
      setContacts(data as Contact[]);
    }
    setLoading(false);
  }, [toast]);

  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCreateOrUpdate = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    const contactData = { ...values, created_by: user?.id };

    let error;
    if (selectedContact) { // Update
      ({ error } = await supabase.from("contacts").update(contactData).eq("id", selectedContact.id));
    } else { // Create
      ({ error } = await supabase.from("contacts").insert(contactData));
    }

    if (error) {
      toast({ title: "Erro ao salvar contato", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: `Contato ${selectedContact ? 'atualizado' : 'criado'} com sucesso.` });
      setFormOpen(false);
      setSelectedContact(null);
      fetchContacts();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!selectedContact) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("contacts").delete().eq("id", selectedContact.id);
    if (error) {
      toast({ title: "Erro ao excluir contato", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contato excluído", description: "O contato foi removido com sucesso." });
      setDeleteOpen(false);
      setSelectedContact(null);
      fetchContacts();
    }
    setIsSubmitting(false);
  };

  const handleExport = () => {
    const csv = Papa.unparse(filteredContacts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "contatos.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const importedContacts = results.data.map((row: any) => ({
          name: row.name,
          email: row.email,
          phone: row.phone,
          company: row.company,
          role: row.role,
          industry: row.industry,
          company_url: row.company_url,
          address: row.address,
          created_by: user?.id,
        }));

        const { error } = await supabase.from("contacts").insert(importedContacts);
        if (error) {
          toast({ title: "Erro ao importar contatos", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Importação concluída!", description: `${importedContacts.length} contatos importados com sucesso.` });
          fetchContacts();
        }
      },
      error: (error) => {
        toast({ title: "Erro ao ler arquivo", description: error.message, variant: "destructive" });
      }
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header title="Contatos">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Exportar</Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Importar</Button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv" className="hidden" />
          <Button onClick={() => { setSelectedContact(null); setFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo Contato</Button>
        </div>
      </Header>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, email, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Empresa</TableHead>
                  <TableHead className="hidden lg:table-cell">Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{contact.company}</TableCell>
                      <TableCell className="hidden lg:table-cell">{format(new Date(contact.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedContact(contact); setFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedContact(contact); setDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">Nenhum contato encontrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContact ? "Editar Contato" : "Criar Novo Contato"}</DialogTitle>
          </DialogHeader>
          <ContactForm
            initialValues={selectedContact || undefined}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setFormOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {selectedContact && (
        <DeleteContactDialog
          isOpen={isDeleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDelete}
          isLoading={isSubmitting}
        />
      )}
    </>
  );
};

export default Contacts;