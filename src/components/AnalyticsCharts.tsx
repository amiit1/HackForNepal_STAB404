'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { MilkYield, HealthRecord } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';

interface MilkYieldChartProps {
  data: MilkYield[];
}

const milkYieldChartConfig = {
  liters: {
    label: "दूध (लिटर)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function MilkYieldChart({ data }: MilkYieldChartProps) {
  const chartData = data.map(item => ({
    date: format(parseISO(item.date), 'MMM d'),
    liters: item.liters,
  }));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-primary">दूध उत्पादन (Milk Yield)</CardTitle>
        <CardDescription>विगत केहि दिनको दूध उत्पादनको ग्राफ।</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={milkYieldChartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 6)}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                domain={[0, 'dataMax + 2']}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend />
              <Bar dataKey="liters" fill="var(--color-liters)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground text-center py-10"> दूध उत्पादनको कुनै डाटा छैन।</p>
        )}
      </CardContent>
    </Card>
  );
}

interface HealthHistoryListProps {
  records: HealthRecord[];
}

export function HealthHistoryList({ records }: HealthHistoryListProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-primary">स्वास्थ्य इतिहास (Health History)</CardTitle>
        <CardDescription>विगतका स्वास्थ्य जाँच र समस्याहरू।</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length > 0 ? (
          <ScrollArea className="h-[300px]">
            <ul className="space-y-3">
              {records.slice().sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map(record => (
                <li key={record.id} className="p-3 border rounded-lg bg-muted/20">
                  <p className="font-semibold">{format(parseISO(record.date), 'MMMM d, yyyy')}</p>
                  {record.bcsScore && <p className="text-sm">BCS: <span className="font-medium text-accent">{record.bcsScore}</span></p>}
                  {record.symptoms && <p className="text-sm">लक्षणहरू: {record.symptoms}</p>}
                  {record.advice && <p className="text-sm">सल्लाह: {record.advice}</p>}
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-10">स्वास्थ्य इतिहासको कुनै डाटा छैन।</p>
        )}
      </CardContent>
    </Card>
  );
}
