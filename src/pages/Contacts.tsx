"use client";

import { ContactForm } from "@/components/crm/ContactForm";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Contacts = () => {
  const { toast } = useToast();

  const handleContactSubmit = (data: any) => {
    toast({
      title: "Contato salvo",
      description: `Contato ${data.name} salvo com sucesso!`,
    });
    // Here you would typically call an API to save the contact
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
                <CardTitle>Lista de Contatos</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground">A lista de contatos aparecerá aqui.</p>
            </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Contacts;