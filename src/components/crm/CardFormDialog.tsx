"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const taskSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "A descrição da tarefa é obrigatória."),
  completed: z.boolean(),
  dueDate: z.date().optional(),
});

const cardSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "O título é obrigatório."),
  description: z.string().optional(),
  contactId: z.string().optional(),
  stageId: z.string().min(1, "O estágio é obrigatório."),
  tasks: z.array(taskSchema).optional(),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface CardData {
  id: string;
  title: string;
  description?: string;
  contactId?: string;
  tasks: Array<z.infer<typeof taskSchema>>;
  stageId: string;
}

interface Contact {
  id: string;
  name: string;
}

interface CardFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: CardFormValues) => void;
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
      ...initialData,
      tasks: initialData?.tasks?.map(t => ({...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined})) || [],
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
    if (isOpen) {
      form.reset({
        ...initialData,
        tasks: initialData?.tasks?.map(t => ({...t, dueDate: t.dueDate ? new Date(t.dueDate) : undefined})) || [],
      });
    }
  }, [initialData, isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Editar Card" : "Criar Novo Card"}</DialogTitle>
          <DialogDescription>
            {initialData?.id
              ? "Edite os detalhes do card e gerencie as tarefas."
              : "Preencha as informações para criar um novo card no funil."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Card</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Follow-up com cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato Associado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um contato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adicione detalhes sobre a oportunidade..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estágio do Funil</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} required>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estágio inicial" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Lista de Tarefas</FormLabel>
              <div className="mt-2 space-y-2">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                    <Controller
                      name={`tasks.${index}.completed`}
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Controller
                      name={`tasks.${index}.text`}
                      control={form.control}
                      render={({ field }) => (
                        <Input {...field} className="flex-grow bg-transparent border-none focus:ring-0" />
                      )}
                    />
                    <Controller
                      name={`tasks.${index}.dueDate`}
                      control={form.control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[180px] justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "dd/MM/yyyy") : <span>Prazo</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Nova tarefa..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTask();
                    }
                  }}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={setNewTaskDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button type="button" onClick={handleAddTask}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar Card</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}