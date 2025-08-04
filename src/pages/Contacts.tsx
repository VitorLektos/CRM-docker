"use client";

import { ContactForm } from "@/components/crm/ContactForm";
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
    <div>
      <h1 className="text-3xl font-bold mb-6">Contatos</h1>
      <div className="max-w-md">
        <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Contato</h2>
        <ContactForm onSubmit={handleContactSubmit} />
      </div>
      {/* A list of existing contacts would go here */}
    </div>
  );
};

export default Contacts;