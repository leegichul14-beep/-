import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border p-5 bg-white',
      accent ? 'border-pink-200 bg-pink-50' : 'border-gray-200'
    )}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold', accent ? 'text-pink-600' : 'text-gray-900')}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
