import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DrawerShell({
  title,
  onClose,
  children,
  width = 'w-[380px]',
}: {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  width?: string
}) {
  return (
    <div className={cn('flex h-full shrink-0 flex-col border-l bg-white', width)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}
