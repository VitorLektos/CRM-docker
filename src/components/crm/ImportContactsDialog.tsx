"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ImportContactsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (newContacts: any[]) => void;
}

export function ImportContactsDialog({ isOpen, onOpenChange, onImport }: ImportContactsDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedData, setParsedData] = React.useState<any[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (fileToParse: File) => {
    Papa.parse(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast({ title: "Erro ao ler o arquivo", description: "Verifique o formato do seu CSV.", variant: "destructive" });
          return;
        }
        setHeaders(results.meta.fields || []);
        setParsedData(results.data);
      },
    });
  };

  const handleImport = () => {
    if (parsedData.length === 0) {
      toast({ title: "Nenhum dado para importar", description: "O arquivo parece estar vazio ou mal formatado.", variant: "destructive" });
      return;
    }
    
    const newContacts = parsedData.map(row => ({
      id: `contact-${Date.now()}-${Math.random()}`,
      name: row.name || row.Name || row.Nome || "",
      email: row.email || row.Email || "",
      phone: row.phone || row.Phone || row.Telefone || "",
    })).filter(contact => contact.name);

    onImport(newContacts);
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar Contatos de CSV</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV. As colunas devem ser nomeadas 'name', 'email', e 'phone' (ou variações em português).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="csv-file" className="text-right">
              Arquivo CSV
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          {parsedData.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Pré-visualização dos dados ({parsedData.length} registros)</h4>
              <div className="max-h-64 overflow-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {headers.map(header => <TableCell key={header}>{row[header]}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button onClick={handleImport} disabled={parsedData.length === 0}>
            Importar {parsedData.length > 0 ? parsedData.length : ''} Contatos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}