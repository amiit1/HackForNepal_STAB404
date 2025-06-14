
'use client';
import { useState, useEffect, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Cow, MilkYield, HealthRecord } from '@/lib/types';
import { mockCows, mockMilkYields, mockHealthRecords } from '@/lib/mockData';
import useLocalStorage from '@/hooks/useLocalStorage';
import { MilkYieldChart, HealthHistoryList } from '@/components/AnalyticsCharts';
import { BarChartBig, PawPrint, PlusCircle, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/useTranslations';

export default function AnalyticsPage() {
  const { t } = useTranslations();
  const { toast } = useToast();

  const [cows, setCows] = useLocalStorage<Cow[]>('cows', mockCows);
  const [allMilkYields, setAllMilkYields] = useLocalStorage<MilkYield[]>('milkYields', mockMilkYields);
  const [allHealthRecords, setAllHealthRecords] = useLocalStorage<HealthRecord[]>('healthRecords', mockHealthRecords);
  
  const [selectedCowId, setSelectedCowId] = useState<string | undefined>(cows.length > 0 ? cows[0].id : undefined);

  const selectedCow = cows.find(cow => cow.id === selectedCowId);
  
  const cowMilkYields = useMemo(() => {
    if (!selectedCowId) return [];
    return allMilkYields
      .filter(yieldEntry => yieldEntry.cowId === selectedCowId)
      .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [selectedCowId, allMilkYields]);

  const cowHealthRecords = useMemo(() => {
    if (!selectedCowId) return [];
    return allHealthRecords.filter(record => record.cowId === selectedCowId);
  }, [selectedCowId, allHealthRecords]);

  // State for Add Milk Yield Dialog
  const [isAddYieldDialogOpen, setIsAddYieldDialogOpen] = useState(false);
  const [addYieldDate, setAddYieldDate] = useState<Date | undefined>(new Date());
  const [addYieldLiters, setAddYieldLiters] = useState<string>('');

  const resetAddYieldForm = () => {
    setAddYieldDate(new Date());
    setAddYieldLiters('');
  };

  const handleAddMilkYield = () => {
    if (!selectedCowId) return;
    if (!addYieldDate) {
      toast({ title: t('error'), description: t('analytics.validation.dateRequired'), variant: 'destructive' });
      return;
    }
    const liters = parseFloat(addYieldLiters);
    if (isNaN(liters) || liters <= 0) {
      toast({ title: t('error'), description: t('analytics.validation.litersPositive'), variant: 'destructive' });
      return;
    }

    const newYieldEntry: MilkYield = {
      id: crypto.randomUUID(),
      cowId: selectedCowId,
      date: format(addYieldDate, 'yyyy-MM-dd'),
      liters: liters,
    };

    setAllMilkYields(prevYields => [...prevYields, newYieldEntry]);
    toast({ title: t('analytics.yieldAddedSuccessTitle'), description: t('analytics.yieldAddedSuccessDescription')});
    setIsAddYieldDialogOpen(false);
    resetAddYieldForm();
  };


  return (
    <AppShell>
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <BarChartBig className="w-8 h-8 mr-2" /> {t('nav.record')}
            </CardTitle>
            <CardDescription>{t('analytics.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {cows.length > 0 ? (
              <Select value={selectedCowId} onValueChange={(value) => {setSelectedCowId(value); resetAddYieldForm();}}>
                <SelectTrigger className="w-full md:w-[280px] text-base py-3">
                  <SelectValue placeholder={t('analytics.selectCowPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {cows.map(cow => (
                    <SelectItem key={cow.id} value={cow.id} className="text-base">
                      {cow.name} {cow.earTagNo && `(#${cow.earTagNo})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
               <p className="text-muted-foreground">{t('analytics.noCowsRegistered')}</p>
            )}
          </CardContent>
        </Card>

        {selectedCow && (
          <div className="space-y-6">
             <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="font-headline text-lg text-primary flex items-center">
                        <PawPrint className="w-6 h-6 mr-2"/> {selectedCow.name} {t('analytics.detailsTitleSuffix')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <p><strong>{t('analytics.cowNameLabel')}:</strong> {selectedCow.name}</p>
                    {selectedCow.earTagNo && <p><strong>{t('analytics.earTagLabel')}:</strong> {selectedCow.earTagNo}</p>}
                    {selectedCow.breed && <p><strong>{t('analytics.breedLabel')}:</strong> {selectedCow.breed}</p>}
                    {selectedCow.birthDate && <p><strong>{t('analytics.birthDateLabel')}:</strong> {selectedCow.birthDate}</p>}
                </CardContent>
             </Card>
            
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline text-primary">{t('analytics.milkYieldTitle')}</CardTitle>
                  <CardDescription>{t('analytics.milkYieldDescription')}</CardDescription>
                </div>
                <Dialog open={isAddYieldDialogOpen} onOpenChange={(isOpen) => { setIsAddYieldDialogOpen(isOpen); if (!isOpen) resetAddYieldForm(); }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setIsAddYieldDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> {t('analytics.addMilkYieldButton')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-card">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-primary">{t('analytics.addMilkYieldDialogTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-2 md:items-center">
                        <Label htmlFor="yield-date" className="text-left md:text-right">{t('analytics.dateLabel')}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal md:col-span-3"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {addYieldDate ? format(addYieldDate, "PPP") : <span>{t('analytics.pickDate')}</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={addYieldDate}
                              onSelect={setAddYieldDate}
                              initialFocus
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-1 md:items-center">
                        <Label htmlFor="yield-liters" className="text-left md:text-right">{t('analytics.litersLabel')}</Label>
                        <Input 
                          id="yield-liters" 
                          type="number" 
                          value={addYieldLiters} 
                          onChange={(e) => setAddYieldLiters(e.target.value)} 
                          placeholder={t('analytics.litersPlaceholder')}
                          min="0"
                          step="0.1"
                          className="md:col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">{t('cancel')}</Button></DialogClose>
                      <Button onClick={handleAddMilkYield}>{t('analytics.saveButton')}</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <MilkYieldChart data={cowMilkYields} />
              </CardContent>
            </Card>

            <HealthHistoryList records={cowHealthRecords} />
          </div>
        )}
        {!selectedCow && cows.length > 0 && (
          <p className="text-center text-muted-foreground py-10">{t('analytics.selectCowPrompt')}</p>
        )}
      </div>
    </AppShell>
  );
}

    
