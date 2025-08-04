"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ApiDocs = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Documentação da API</h1>
      <Card>
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A documentação da API estará disponível aqui em breve.</p>
          <div className="mt-4 space-y-2 font-mono text-sm">
            <p><span className="font-bold text-green-600">POST</span> /api/contacts - Criar contato</p>
            <p><span className="font-bold text-blue-600">GET</span> /api/contacts/:id - Obter contato</p>
            <p><span className="font-bold text-green-600">POST</span> /api/cards - Criar card</p>
            <p><span className="font-bold text-orange-600">PUT</span> /api/cards/:id/stage - Mover card</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDocs;