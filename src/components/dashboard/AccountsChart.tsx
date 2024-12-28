import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccounts } from '@/hooks/useAccounts';

const CustomXAxis = (props: any) => (
  <XAxis
    {...props}
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
  />
);

const CustomYAxis = (props: any) => (
  <YAxis
    {...props}
    stroke="#888888"
    fontSize={12}
    tickLine={false}
    axisLine={false}
    tickFormatter={(value: number) => `${value}`}
  />
);

export function AccountsChart() {
  const { accounts } = useAccounts();
  
  // For now, just show the current number of accounts
  const data = [
    { date: new Date().toISOString().slice(0, 7), accounts: accounts.length }
  ];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Account Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CustomXAxis dataKey="date" />
              <CustomYAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="accounts"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}