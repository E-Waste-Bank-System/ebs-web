'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  count: number;
  color: string;
}

interface CategoryChartProps {
  data: CategoryData[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  return (
    <PieChart width={200} height={200}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={65}
        outerRadius={100}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip 
        formatter={(value: any, name: any, props: any) => [
          `${props.payload.count} items`,
          props.payload.name
        ]}
        contentStyle={{ 
          backgroundColor: 'white', 
          border: 'none', 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
        }} 
      />
    </PieChart>
  );
} 