'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface RetrainingData {
  id: string;
  type: 'correction' | 'validation' | 'improvement';
  original_category: string;
  corrected_category?: string;
  original_confidence: number;
  created_at: string;
  is_processed: boolean;
}

interface PerformanceChartProps {
  data: RetrainingData[];
}

const PerformanceChart = ({ data }: PerformanceChartProps) => {
  // Group data by month and calculate metrics
  const chartData = data.reduce((acc, item) => {
    const month = format(new Date(item.created_at), 'MMM yyyy');
    
    if (!acc[month]) {
      acc[month] = {
        month,
        corrections: 0,
        validations: 0,
        avgConfidence: 0,
        totalConfidence: 0,
        count: 0
      };
    }
    
    if (item.type === 'correction') {
      acc[month].corrections++;
    } else if (item.type === 'validation') {
      acc[month].validations++;
    }
    
    acc[month].totalConfidence += item.original_confidence;
    acc[month].count++;
    acc[month].avgConfidence = (acc[month].totalConfidence / acc[month].count) * 100;
    
    return acc;
  }, {} as Record<string, any>);

  const chartArray = Object.values(chartData).slice(-6); // Last 6 months

  if (chartArray.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No performance data available</p>
          <p className="text-xs mt-1">Data will appear as retraining samples are processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartArray}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
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
              if (name === 'avgConfidence') {
                return [`${value.toFixed(1)}%`, 'Avg Confidence'];
              }
              return [value, name === 'corrections' ? 'Corrections' : 'Validations'];
            }}
          />
          <Line 
            type="monotone" 
            dataKey="avgConfidence" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="corrections" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="validations" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart; 