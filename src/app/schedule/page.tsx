
'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppShell from '@/components/layout/AppShell';
import type { FarmTask, TaskType } from '@/lib/types';
import { mockTasks } from '@/lib/mockData';
import useLocalStorage from '@/hooks/useLocalStorage';
import { format, parseISO, isValid, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, isFuture } from 'date-fns';
import { CalendarPlus, CheckSquare, Edit3, Trash2, Syringe, Wheat, ListChecks, BellRing, Milk, BellDot } from 'lucide-react';
import { adToBs, ใกล้เคียง } from '@/lib/utils';
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from '@/hooks/use-toast';

const taskTypeIcons: Record<TaskType, React.ReactNode> = {
  vaccination: <Syringe className="w-5 h-5 mr-2" />,
  feeding: <Wheat className="w-5 h-5 mr-2" />,
  deworming: <ListChecks className="w-5 h-5 mr-2" />,
  breeding: <BellRing className="w-5 h-5 mr-2" />,
  milking: <Milk className="w-5 h-5 mr-2" />,
  other: <ListChecks className="w-5 h-5 mr-2" />,
};

const PRE_REMINDER_MINUTES = 15;

export default function SchedulePage() {
  const { t } = useTranslations();
  const { toast } = useToast();
  const [tasks, setTasks] = useLocalStorage<FarmTask[]>('farmTasks', mockTasks);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FarmTask | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('other');
  const [description, setDescription] = useState('');

  const [displayBsDate, setDisplayBsDate] = useState<string | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const activeTimeouts = useRef<Map<string, number[]>>(new Map());

  const taskTypeLabels: Record<TaskType, string> = {
    vaccination: t('schedule.taskType.vaccination'),
    feeding: t('schedule.taskType.feeding'),
    deworming: t('schedule.taskType.deworming'),
    breeding: t('schedule.taskType.breeding'),
    milking: t('schedule.taskType.milking'),
    other: t('schedule.taskType.other'),
  };

  useEffect(() => {
    if (!('Notification' in window)) {
      toast({ title: t('schedule.notifications.notSupportedTitle'), description: t('schedule.notifications.notSupportedBody'), variant: 'destructive'});
      setNotificationPermission('denied');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationPermission('granted');
    } else if (Notification.permission === 'denied') {
      setNotificationPermission('denied');
      toast({ title: t('schedule.notifications.permissionDeniedTitle'), description: t('schedule.notifications.permissionDeniedBody')});
    } else {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast({ title: t('schedule.notifications.permissionGrantedTitle'), description: t('schedule.notifications.permissionGrantedBody') });
        } else {
          toast({ title: t('schedule.notifications.permissionDeniedTitle'), description: t('schedule.notifications.permissionDeniedBody')});
        }
      });
    }
  }, [t, toast]);

  const clearTaskTimeouts = useCallback((taskId: string) => {
    const timeoutIds = activeTimeouts.current.get(taskId);
    if (timeoutIds) {
      timeoutIds.forEach(clearTimeout);
      activeTimeouts.current.delete(taskId);
    }
  }, []);

  const scheduleTaskNotification = useCallback((task: FarmTask, preReminderMins?: number) => {
    if (notificationPermission !== 'granted' || !task.date || !task.time || task.isCompleted) {
      return;
    }

    try {
      const [hours, minutes] = task.time.split(':').map(Number);
      let taskDateTime = setMilliseconds(setSeconds(setMinutes(setHours(parseISO(task.date), hours), minutes), 0), 0);
      
      let notificationBody = t('schedule.notifications.taskDueBody', { title: task.title });
      let notificationTitle = t('schedule.notifications.taskDueTitle');

      if (preReminderMins) {
        taskDateTime = addMinutes(taskDateTime, -preReminderMins);
        notificationBody = t('schedule.notifications.taskReminderBody', { title: task.title, minutes: preReminderMins.toString() });
        notificationTitle = t('schedule.notifications.taskReminderTitle');
      }

      const delay = taskDateTime.getTime() - Date.now();

      if (delay > 0) {
        const timeoutId = window.setTimeout(() => {
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/icons/icon-192x192.png', 
          });
          const taskTimeouts = activeTimeouts.current.get(task.id) || [];
          const index = taskTimeouts.indexOf(timeoutId);
          if (index > -1) taskTimeouts.splice(index, 1);
          if(taskTimeouts.length === 0) activeTimeouts.current.delete(task.id); else activeTimeouts.current.set(task.id, taskTimeouts);

        }, delay);

        const taskTimeouts = activeTimeouts.current.get(task.id) || [];
        taskTimeouts.push(timeoutId);
        activeTimeouts.current.set(task.id, taskTimeouts);
      }
    } catch (error) {
      console.error("Error scheduling notification for task:", task.id, error);
    }
  }, [notificationPermission, t]);

  useEffect(() => {
    activeTimeouts.current.forEach(timeoutIds => timeoutIds.forEach(clearTimeout));
    activeTimeouts.current.clear();

    if (notificationPermission === 'granted') {
      tasks.forEach(task => {
        if (!task.isCompleted && task.date && task.time) {
           try {
            const taskDateTime = setMilliseconds(setSeconds(setMinutes(setHours(parseISO(task.date), parseInt(task.time.split(':')[0])), parseInt(task.time.split(':')[1])),0),0);
            if (isFuture(taskDateTime)) {
              scheduleTaskNotification(task); 
              if (PRE_REMINDER_MINUTES > 0) {
                 scheduleTaskNotification(task, PRE_REMINDER_MINUTES); 
              }
            }
          } catch (e) {
            console.error("Error processing task for notification scheduling", task, e);
          }
        }
      });
    }
    return () => {
      activeTimeouts.current.forEach(timeoutIds => timeoutIds.forEach(clearTimeout));
      activeTimeouts.current.clear();
    };
  }, [tasks, notificationPermission, scheduleTaskNotification]);


  const resetForm = useCallback(() => {
    setTitle('');
    setTaskDate(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    setTaskTime('');
    setTaskType('other');
    setDescription('');
  }, [selectedDate]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setTaskDate(editingTask.date);
      setTaskTime(editingTask.time || '');
      setTaskType(editingTask.type);
      setDescription(editingTask.description || '');
    } else {
      resetForm();
    }
  }, [editingTask, resetForm]);

  useEffect(() => {
    if (selectedDate) {
      const bsDate = adToBs(selectedDate);
      setDisplayBsDate(`${bsDate} (${ใกล้เคียง})`);
      if (!editingTask) {
        setTaskDate(format(selectedDate, 'yyyy-MM-dd'));
      }
    } else {
      setDisplayBsDate(null);
    }
  }, [selectedDate, editingTask]);


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !taskDate || !taskType) {
      toast({title: t('error'), description: t('schedule.validation.requiredFields'), variant: 'destructive'});
      return;
    }
    if (taskTime && !/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(taskTime)) {
        toast({title: t('error'), description: t('schedule.validation.invalidTime'), variant: 'destructive'});
        return;
    }
    
    const newTask: FarmTask = {
      id: editingTask ? editingTask.id : crypto.randomUUID(),
      title,
      date: taskDate,
      time: taskTime || undefined,
      type: taskType,
      description: description || undefined,
      isCompleted: editingTask ? editingTask.isCompleted : false,
    };

    clearTaskTimeouts(newTask.id); 

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? newTask : t));
    } else {
      setTasks([...tasks, newTask]);
    }

    if (!newTask.isCompleted && newTask.date && newTask.time) {
      try {
        const taskDateTime = setMilliseconds(setSeconds(setMinutes(setHours(parseISO(newTask.date), parseInt(newTask.time.split(':')[0])), parseInt(newTask.time.split(':')[1])),0),0);
        if (isFuture(taskDateTime)) {
          scheduleTaskNotification(newTask);
          if (PRE_REMINDER_MINUTES > 0) {
            scheduleTaskNotification(newTask, PRE_REMINDER_MINUTES);
          }
        }
      } catch(e) { console.error("Error scheduling notification on submit", e); }
    }

    setIsFormOpen(false);
    setEditingTask(null);
    toast({title: editingTask ? t('schedule.taskUpdated') : t('schedule.taskAdded')});
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, isCompleted: !task.isCompleted };
        clearTaskTimeouts(taskId); 
        if (!updatedTask.isCompleted && updatedTask.date && updatedTask.time) {
           try {
            const taskDateTime = setMilliseconds(setSeconds(setMinutes(setHours(parseISO(updatedTask.date), parseInt(updatedTask.time.split(':')[0])), parseInt(updatedTask.time.split(':')[1])),0),0);
            if (isFuture(taskDateTime)) {
                scheduleTaskNotification(updatedTask);
                if (PRE_REMINDER_MINUTES > 0) {
                    scheduleTaskNotification(updatedTask, PRE_REMINDER_MINUTES);
                }
            }
          } catch(e) { console.error("Error re-scheduling notification on toggle", e); }
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    clearTaskTimeouts(taskId); 
    setTasks(tasks.filter(task => task.id !== taskId));
    toast({title: t('schedule.taskDeleted')});
  };

  const openEditForm = (task: FarmTask) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => {
      try {
        return format(parseISO(task.date), 'yyyy-MM-dd') === (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '');
      } catch {
        return false; 
      }
    }).sort((a,b) => (a.time || "24:00").localeCompare(b.time || "24:00"));
  }, [tasks, selectedDate]);

  return (
    <AppShell>
      <div className="space-y-4 mb-4">
        {notificationPermission === 'default' && (
             <Card className="bg-yellow-50 border-yellow-300">
                <CardContent className="pt-4 text-yellow-700 flex items-center">
                    <BellDot className="w-5 h-5 mr-3"/>
                    <p>{t('schedule.notifications.permissionPrompt')}</p>
                </CardContent>
            </Card>
        )}
        {notificationPermission === 'denied' && (
             <Card className="bg-red-50 border-red-300">
                <CardContent className="pt-4 text-red-700 flex items-center">
                    <BellDot className="w-5 h-5 mr-3"/>
                    <p>{t('schedule.notifications.permissionDeniedManuallyEnable')}</p>
                </CardContent>
            </Card>
        )}
         <p className="text-xs text-muted-foreground">{t('schedule.notifications.note')}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
       
        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">{t('schedule.calendarTitle')}</CardTitle>
            <CardDescription>{t('schedule.calendarDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border p-0 bg-card"
              modifiers={{ 
                highlighted: tasks.map(task => {
                  try { return parseISO(task.date); } catch { return new Date(0); }
                }).filter(date => isValid(date))
              }}
              modifiersStyles={{ highlighted: { border: "2px solid hsl(var(--primary))", borderRadius: "var(--radius)"} }}
            />
            {displayBsDate && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {t('schedule.bsDateLabel')}: {displayBsDate}
                <br />
                <span className="text-xs">({t('schedule.bsDateApproxNote')})</span>
              </p>
            )}
          </CardContent>
           <CardFooter>
             <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setEditingTask(null); }}>
              <DialogTrigger asChild>
                <Button className="w-full text-lg py-3" onClick={() => { setEditingTask(null); resetForm(); setIsFormOpen(true); }}>
                  <CalendarPlus className="mr-2 h-5 w-5" /> {t('schedule.addNewTaskButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card">
                <DialogHeader>
                  <DialogTitle className="font-headline text-primary">{editingTask ? t('schedule.editTaskTitle') : t('schedule.newTaskTitle')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                    <Label htmlFor="title" className="text-left md:text-right">{t('schedule.form.titleLabel')}:</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="md:col-span-3" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                    <Label htmlFor="date" className="text-left md:text-right">{t('schedule.form.dateLabel')}:</Label>
                    <Input id="date" type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="md:col-span-3" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                    <Label htmlFor="time" className="text-left md:text-right">{t('schedule.form.timeLabel')}:</Label>
                    <Input id="time" type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} className="md:col-span-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                    <Label htmlFor="type" className="text-left md:text-right">{t('schedule.form.typeLabel')}:</Label>
                    <Select value={taskType} onValueChange={(value) => setTaskType(value as TaskType)}>
                      <SelectTrigger className="md:col-span-3">
                        <SelectValue placeholder={t('schedule.form.typePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(taskTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-start">
                    <Label htmlFor="description" className="text-left md:text-right pt-0 md:pt-2">{t('schedule.form.descriptionLabel')}:</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="md:col-span-3" />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline">{t('cancel')}</Button></DialogClose>
                    <Button type="submit">{editingTask ? t('schedule.form.saveButton') : t('schedule.form.addButton')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
           </CardFooter>
        </Card>

        <Card className="md:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : t('schedule.selectDatePrompt')} {t('schedule.tasksForDateTitleSuffix')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksForSelectedDate.length > 0 ? (
              <ul className="space-y-3">
                {tasksForSelectedDate.map(task => (
                  <li key={task.id} className={`p-4 rounded-lg border flex justify-between items-center transition-all ${task.isCompleted ? 'bg-muted/50 border-green-500' : 'bg-card'}`}>
                    <div>
                      <h4 className={`font-semibold flex items-center ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {taskTypeIcons[task.type]} {task.title}
                      </h4>
                      <p className={`text-sm ${task.isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {taskTypeLabels[task.type]}
                        {task.time && ` - ${task.time}`}
                      </p>
                      {task.description && <p className={`text-xs mt-1 ${task.isCompleted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>{task.description}</p>}
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                       <Button variant="ghost" size="icon" onClick={() => toggleTaskCompletion(task.id)} title={task.isCompleted ? t('schedule.markIncomplete') : t('schedule.markComplete')}>
                        <CheckSquare className={`w-5 h-5 ${task.isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(task)} title={t('schedule.editTaskTooltip')}>
                        <Edit3 className="w-5 h-5 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} title={t('schedule.deleteTaskTooltip')}>
                        <Trash2 className="w-5 h-5 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">{t('schedule.noTasksForDate')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

    
