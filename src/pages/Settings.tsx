"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/use-permission";

const Settings = () => {
  const { hasPermission } = usePermission();
  const canEditSettings = hasPermission('settings.update');

  return (
    <>
      <Header title="Configurações" />
      <Card>
        <CardHeader>
          <CardTitle>Personalização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crm-name">Nome do CRM</Label>
            <Input id="crm-name" defaultValue="Meu CRM" disabled={!canEditSettings} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crm-logo">Logo</Label>
            <Input id="crm-logo" type="file" disabled={!canEditSettings} />
          </div>
          <Button disabled={!canEditSettings}>Salvar Alterações</Button>
        </CardContent>
      </Card>
    </>
  );
};

export default Settings;