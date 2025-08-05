"use client";

import * as React from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, PlusCircle, Trash2, Mail, Phone, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const taskSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "A descrição da tarefa é obrigatória."),
  completed: z.boolean(),
  dueDate: z.date().optional(),
});

const cardSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "O título é obrigatório."),
  companyName: z.string().optional(),
  businessType: z.string().optional(),
  description: z.string().optional(),
  contactId: z.string().optional(),
  stageId: z.string().min(1, "O estágio é obrigatório."),
  tasks: z.array(taskSchema).optional(),
  value: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Deve ser um número" }).min(0).optional()
  ),
  source: z.string().optional(),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface HistoryEntry {
  id: string;
  date: string;
  description: string;
}

interface CardData {
  id: string;
  title: string;
  companyName?: string;
  businessType?: string;
  description?: string;
  contactId?: string;
  tasks: Array<z.infer<typeof taskSchema>>;
  stageId: string;
  value?: number;
  source?: string;
  createdAt?: string;
  history?: HistoryEntry[];
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CardFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: CardFormValues, initialData: Partial<CardData> | null) => void;
  initialData: Partial<CardData> | null;
  contacts: Contact[];
  stages: { id: string; name: string }[];
}

export function CardFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  initialData,
  contacts,
  stages,
}: CardFormDialogProps) {
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      tasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });

  const [newTaskText, setNewTaskText] = React.useState("");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState<Date | undefined>();

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      append({
        id: `task-${Date.now()}`,
        text: newTaskText.trim(),
        completed: false,
        dueDate: newTaskDueDate,
      });
      setNewTaskText("");
      setNewTaskDueDate(undefined);
    }
  };

  React.useEffect(() => {
    if (isOpen && initialData) {
      form.reset({
        ...initialData,
        value: initialData.value || undefined,
        tasks: initialData.tasks?.map(t => ({...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined})) || [],
      });
    } else if (isOpen) {
      form.reset({
        title: "",
        companyName: "",
        businessType: "",
        description: "",
        contactId: "",
        stageId: stages[0]?.id || "",
        tasks: [],
        value: undefined,
        source: "",
      });
    }
  }, [initialData, isOpen, form, stages]);

  const contactId = form.watch("contactId");
  const associatedContact = contacts.find(c => c.id === contactId);

  const onSubmit = (data: CardFormValues) => {
    onSave(data, initialData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Editar Card" : "Criar Novo Card"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow overflow-hidden flex flex-col">
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              <Card>
                <CardHeader><CardTitle>Detalhes do Card</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Título do Card</FormLabel><FormControl><Input placeholder="Ex: Follow-up com cliente" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem><FormLabel>Nome da Empresa</FormLabel><FormControl><Input placeholder="Ex: Acme Inc." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="businessType" render={({ field }) => (
                      <FormItem><FormLabel>Tipo de Negócio</FormLabel><FormControl><Input placeholder="Ex: Software, Consultoria" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="value" render={({ field }) => (
                      <FormItem><FormLabel>Valor do Negócio (R$)</FormLabel><FormControl><Input type="number" placeholder="1500,00" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="source" render={({ field }) => (
                      <FormItem><FormLabel>Fonte</FormLabel><FormControl><Input placeholder="Ex: Indicação" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea placeholder="Adicione detalhes sobre a oportunidade..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="stageId" render={({ field }) => (
                      <FormItem><FormLabel>Estágio</FormLabel><Select onValueChange={field.onChange} value={field.value} required><FormControl><SelectTrigger><SelectValue placeholder="Selecione o estágio" /></SelectTrigger></FormControl><SelectContent>{stages.map((stage) => (<SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactId" render={({ field }) => (
                      <FormItem><FormLabel>Contato</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um contato" /></SelectTrigger></FormControl><SelectContent>{contacts.map((contact) => (<SelectItem key={contact.id} value={contact.id}>{contact.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                  </div>
                  {associatedContact && (
                    <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                      <h4 className="font-semibold text-sm flex items-center"><User className="w-4 h-4 mr-2" />Informações do Contato</h4>
                      <p className="text-sm flex items-center"><Mail className="w-4 h-4 mr-2 text-muted-foreground" /> {associatedContact.email || "Não informado"}</p>
                      <p className="text-sm flex items-center"><Phone className="w-4 h-4 mr-2 text-muted-foreground" /> {associatedContact.phone || "Não informado"}</p>
                    </div>
                  )}
                  {initialData?.createdAt && (
                    <p className="text-xs text-muted-foreground pt-2">
                      Criado em: {format(new Date(initialData.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Tarefas</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fields.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                        <Controller name={`tasks.${index}.completed`} control={form.control} render={({ field }) => (<Checkbox checked={field.value} onCheckedChange={field.onChange} />)} />
                        <Controller name={`tasks.${index}.text`} control={form.control} render={({ field }) => (<Input {...field} className="flex-grow bg-transparent border-none focus:ring-0" />)} />
                        <Controller name={`tasks.${index}.dueDate`} control={form.control} render={({ field }) => (
                          <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-[180px] justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "dd/MM/yyyy") : <span>Prazo</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                        )} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-4 mt-2 border-t">
                    <Input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Nova tarefa..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(); } }} />
                    <Popover><PopoverTrigger asChild><Button variant="outline" size="icon"><CalendarIcon className="h-4 w-4" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newTaskDueDate} onSelect={setNewTaskDueDate} initialFocus /></PopoverContent></Popover>
                    <Button type="button" onClick={handleAddTask}><PlusCircle className="h-4 w-4 mr-2" /> Adicionar</Button>
                  </div>
                </CardContent>
              </Card>

              {initialData?.id && (
                <Card>
                  <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {initialData?.history?.slice().reverse().map(entry => (
                        <li key={entry.id} className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-full p-1.5 mt-1"><Clock className="w-3 h-3 text-primary" /></div>
                          <div>
                            <p className="text-sm">{entry.description}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(entry.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter className="p-4 border-t mt-auto shrink-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar Card</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}