'use client';

import React from 'react';
import { PieChart, Pie } from 'recharts';

export default function EmptyChart() {
  return (
    <PieChart width={120} height={120}>
      <Pie 
        data={[{ value: 1 }]} 
        dataKey="value" 
        cx={60} 
        cy={60} 
        outerRadius={60} 
        fill="#E5E7EB"
        isAnimationActive={false}
      />
    </PieChart>
  );
} 