'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { name: '1월', sales: 12000000 },
  { name: '2월', sales: 19000000 },
  { name: '3월', sales: 30000000 },
  { name: '4월', sales: 50000000 },
  { name: '5월', sales: 20000000 },
  { name: '6월', sales: 27000000 },
  { name: '7월', sales: 35000000 },
  { name: '8월', sales: 44000000 },
  { name: '9월', sales: 33000000 },
  { name: '10월', sales: 52000000 },
  { name: '11월', sales: 41000000 },
  { name: '12월', sales: 37000000 },
]

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 매출 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 10000000).toFixed(0)}천만`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {label}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].value?.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="sales"
              strokeWidth={2}
              stroke="hsl(var(--primary))"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}