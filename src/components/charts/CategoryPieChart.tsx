'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#EC4899','#F97316','#8B5CF6','#06B6D4',
  '#84CC16','#10B981','#3B82F6','#F59E0B',
  '#EF4444','#6B7280','#9CA3AF',
]

interface Props {
  data: { name: string; value: number }[]
}

export default function CategoryPieChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [`${v}개`, '입점 수']} />
      </PieChart>
    </ResponsiveContainer>
  )
}
