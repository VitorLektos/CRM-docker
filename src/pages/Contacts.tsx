"use client";

import * as React from "react";
import { ContactForm } from "@/components/crm/ContactForm";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { sampleContacts, type Contact } from "@/data/sample-data";
import { ContactsTable } from "@/components/crm/ContactsTable";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { ImportContactsDialog } from "@/components/crm/ImportContactsDialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Contacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = usePersistentState<Contact[]>("contacts_data", sampleContacts);
  const [isImportOpen, setImportOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [contactToDelete, setContactToDelete] = React.useState<string | null>(null);
  const [isEditOpen, setEditOpen] = React.useState(false);
  const [contactToEdit, setContactToEdit] = React.useState<Contact | null>(null);

  const handleContactSubmit = (data: any) => {
    if (data.id) {
      setContacts(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c));
      toast({
        title: "Contato atualizado",
        description: `Contato ${data.name} atualizado com sucesso!`,
      });
      setEditOpen(false);
      setContactToEdit(null);
    } else {
      const newContact: Contact = {
        id: `contact-${Date.now()}`,
        ...data,
      };
      setContacts(prev => [...prev, newContact]);
      toast({
        title: "Contato salvo",
        description: `Contato ${data.name} salvo com sucesso!`,
      });
    }
  };

  const handleEditRequest = (contact: Contact) => {
    setContactToEdit(contact);
    setEditOpen(true);
  };

  const handleDeleteRequest = (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (contactToDelete) {
      setContacts(prev => prev.filter(c => c.id !== contactToDelete));
      toast({ title: "Contato excluído", variant: "destructive" });
    }
    setDeleteConfirmOpen(false);
    setContactToDelete(null);
  };

  const handleExportCSV = () => {
    const headers = ["id", "name", "email", "phone", "company"];
    const csvRows = [
      headers.join(','),
      ...contacts.map(row => 
        headers.map(fieldName => JSON.stringify(row[fieldName as keyof Contact] || '')).join(',')
      )
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contatos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportação concluída", description: `${contacts.length} contatos exportados.` });
  };

  const handleImport = (newContacts: Contact[]) => {
    setContacts(prev => [...prev, ...newContacts]);
    toast({ title: "Importação Concluída", description: `${newContacts.length} novos contatos adicionados.` });
  };

  return (
    <>
      <Header title="Contatos" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Cadastrar Novo Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm onSubmit={handleContactSubmit} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Lista de Contatos</CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Importar
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ContactsTable contacts={contacts} onDelete={handleDeleteRequest} onEdit={handleEditRequest} />
            </CardContent>
        </Card>
      </div>
      <ImportContactsDialog isOpen={isImportOpen} onOpenChange={setImportOpen} onImport={handleImport} />
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o contato.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContactToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>
              Faça alterações nos dados do contato aqui. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <ContactForm 
              onSubmit={handleContactSubmit} 
              initialValues={contactToEdit || undefined} 
              isEdit={true} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Contacts;