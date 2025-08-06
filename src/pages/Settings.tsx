"use client";

import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2 } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGenerateApiKey = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-api-key');
      if (error) throw error;
      setApiKey(data.apiKey);
      toast({ title: "Chave de API gerada!", description: "Copie e guarde sua chave em um local seguro." });
    } catch (error: any) {
      toast({ title: "Erro ao gerar chave", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    toast({ title: "Copiado!", description: "A chave de API foi copiada para a área de transferência." });
  };

  return (
    <>
      <Header title="Configurações" />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personalização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crm-name">Nome do CRM</Label>
              <Input id="crm-name" defaultValue="Meu CRM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm-logo">Logo</Label>
              <Input id="crm-logo" type="file" />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acesso via API</CardTitle>
            <CardDescription>
              Gere uma chave de API para integrar com serviços externos como n8n ou Typebot.
              Esta chave é pessoal e intransferível.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiKey ? (
              <div className="flex items-center gap-2">
                <Input readOnly value={apiKey} className="font-mono" />
                <Button variant="outline" size="icon" onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma chave de API gerada. Clique no botão abaixo para criar uma.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateApiKey} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {apiKey ? "Gerar Nova Chave (Invalida a anterior)" : "Gerar Chave de API"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Settings;