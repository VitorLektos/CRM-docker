"use client";

import * as React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { DayTasksDialog } from "@/components/crm/DayTasksDialog";
import { sampleCards, type CardData } from "@/data/sample-data";

interface TaskEvent {
  title: string;
  date: string;
  extendedProps: {
    cardTitle: string;
    cardId: string;
  };
}

const CalendarPage = () => {
  const [events, setEvents] = React.useState<TaskEvent[]>([]);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTasks, setSelectedTasks] = React.useState<TaskEvent[]>([]);

  React.useEffect(() => {
    let allCards: CardData[] = sampleCards;
    try {
      const storedCards = window.localStorage.getItem("cards_data");
      if (storedCards) {
        allCards = JSON.parse(storedCards);
      }
    } catch (error) {
      console.warn("Could not parse cards from localStorage", error);
    }

    const allTasks = allCards.flatMap(card => 
      card.tasks
        .filter(task => task.dueDate)
        .map(task => ({
          title: task.text,
          date: task.dueDate!,
          extendedProps: {
            cardTitle: card.title,
            cardId: card.id,
          }
        }))
    );
    setEvents(allTasks);
  }, []);

  const handleDateClick = (arg: any) => {
    const clickedDate = arg.dateStr;
    const tasksForDay = events.filter(event => event.date.startsWith(clickedDate));
    
    setSelectedDate(arg.date);
    setSelectedTasks(tasksForDay);
    setDialogOpen(true);
  };

  return (
    <>
      <Header title="Calendário de Tarefas" />
      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,listWeek",
            }}
            events={events}
            dateClick={handleDateClick}
            locale="pt-br"
            buttonText={{
                today:    'Hoje',
                month:    'Mês',
                week:     'Semana',
                day:      'Dia',
                list:     'Lista'
            }}
            eventDisplay="block"
            dayMaxEvents={2}
            height="auto"
            aspectRatio={1.75}
          />
        </CardContent>
      </Card>
      <DayTasksDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        tasks={selectedTasks}
      />
    </>
  );
};

export default CalendarPage;