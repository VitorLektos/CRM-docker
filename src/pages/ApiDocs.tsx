"use client";

import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const SUPABASE_URL = "https://zesbaoyralbtdvtjzeda.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inplc2Jhb3lyYWxidGR2dGp6ZWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTgxNDgsImV4cCI6MjA2OTk5NDE0OH0.587OL7spTLjNIEdVOPaePzlQDRXsrz54hl36klCtaEI";

const ApiDocs = () => {
  return (
    <>
      <Header title="Documentação da API" />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Autenticação</CardTitle>
            <CardDescription>
              Todas as requisições à API devem ser autenticadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Para se autenticar, você precisa incluir dois cabeçalhos (headers) em cada requisição:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">apikey</code>: Sua chave pública (anon key) da Supabase.</li>
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">Authorization</code>: Sua chave de API pessoal, precedida por "Bearer ".</li>
            </ol>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Onde encontrar sua Chave de API?</AlertTitle>
              <AlertDescription>
                Você pode gerar e copiar sua chave de API pessoal na página de <a href="/settings" className="font-semibold underline">Configurações</a>.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint: Contatos</CardTitle>
            <CardDescription>
              Gerencie os contatos do seu CRM. O endpoint base é <code className="font-mono bg-muted px-1 py-0.5 rounded">/rest/v1/contacts</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Criar um Contato (POST)</h3>
              <CodeBlock code={`curl -X POST '${SUPABASE_URL}/rest/v1/contacts' \\
-H "apikey: ${ANON_KEY}" \\
-H "Authorization: Bearer SUA_CHAVE_API_AQUI" \\
-H "Content-Type: application/json" \\
-d '{
  "name": "Novo Contato via API",
  "email": "contato.api@example.com",
  "company": "API Corp"
}'`} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Listar Contatos (GET)</h3>
              <CodeBlock code={`curl '${SUPABASE_URL}/rest/v1/contacts?select=*' \\
-H "apikey: ${ANON_KEY}" \\
-H "Authorization: Bearer SUA_CHAVE_API_AQUI"`} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Atualizar um Contato (PATCH)</h3>
              <CodeBlock code={`curl -X PATCH '${SUPABASE_URL}/rest/v1/contacts?id=eq.ID_DO_CONTATO' \\
-H "apikey: ${ANON_KEY}" \\
-H "Authorization: Bearer SUA_CHAVE_API_AQUI" \\
-H "Content-Type: application/json" \\
-d '{
  "phone": "(11) 99999-8888"
}'`} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Excluir um Contato (DELETE)</h3>
              <CodeBlock code={`curl -X DELETE '${SUPABASE_URL}/rest/v1/contacts?id=eq.ID_DO_CONTATO' \\
-H "apikey: ${ANON_KEY}" \\
-H "Authorization: Bearer SUA_CHAVE_API_AQUI"`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint: Cards</CardTitle>
            <CardDescription>
              Gerencie os cards (oportunidades) do seu funil. O endpoint base é <code className="font-mono bg-muted px-1 py-0.5 rounded">/rest/v1/cards</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Criar um Card (POST)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Você precisa do <code className="font-mono text-xs">id</code> de um estágio existente para criar um card.
              </p>
              <CodeBlock code={`curl -X POST '${SUPABASE_URL}/rest/v1/cards' \\
-H "apikey: ${ANON_KEY}" \\
-H "Authorization: Bearer SUA_CHAVE_API_AQUI" \\
-H "Content-Type: application/json" \\
-d '{
  "title": "Nova Oportunidade via API",
  "stage_id": "ID_DO_ESTAGIO_AQUI",
  "value": 5000,
  "contact_id": "ID_DO_CONTATO_OPCIONAL"
}'`} />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Mover um Card para outro Estágio (PATCH)</h3>
              <CodeBlock code={`curl -X PATCH '${SUPABASE_URL}/rest/v1/cards?id=eq.ID_DO_CARD' \\
-H "apikey: ${ANON_KEY}" \\
-H "Authorization: Bearer SUA_CHAVE_API_AQUI" \\
-H "Content-Type: application/json" \\
-d '{
  "stage_id": "ID_DO_NOVO_ESTAGIO"
}'`} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ApiDocs;