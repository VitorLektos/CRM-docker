"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>
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
    </div>
  );
};

export default Settings;