'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryData {
  category: string;
  corrections: number;
  averageImprovement: number;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
}

const CategoryDistributionChart = ({ data }: CategoryDistributionChartProps) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No correction data available</p>
          <p className="text-xs mt-1">Data will appear as corrections are submitted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            stroke="#6b7280"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'corrections') {
                return [value, 'Corrections Needed'];
              }
              if (name === 'averageImprovement') {
                return [`${value.toFixed(1)}%`, 'Avg Improvement'];
              }
              return [value, name];
            }}
          />
          <Bar 
            dataKey="corrections" 
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            name="corrections"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDistributionChart; 