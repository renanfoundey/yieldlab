import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/store/builderStore'
import { DrawerShell } from './DrawerShell'

type Branch = 'main' | 'branch'
type Version = {
  id: number
  description: string
  tags: { label: string; tone: 'green' | 'blue' | 'amber' }[]
  author: string
  branch: Branch
}

const VERSIONS: Version[] = [
  { id: 374, description: 'Initial battery testing protocol', tags: [{ label: 'development', tone: 'green' }, { label: 'test-team', tone: 'blue' }], author: 'Dr. Sarah Chen', branch: 'main' },
  { id: 376, description: 'Specialized cathode research protocol', tags: [{ label: 'cathode-team', tone: 'blue' }], author: 'Dr. Priya Patel', branch: 'branch' },
  { id: 380, description: 'Advanced cathode material screening', tags: [{ label: 'cathode-team', tone: 'blue' }], author: 'Dr. Priya Patel', branch: 'branch' },
  { id: 382, description: 'Comprehensive cathode performance analysis', tags: [{ label: 'cathode-team', tone: 'blue' }], author: 'Dr. Priya Patel', branch: 'branch' },
  { id: 375, description: 'Enhanced cycle testing parameters', tags: [{ label: 'test-team', tone: 'blue' }], author: 'Marcus Rodriguez', branch: 'main' },
  { id: 377, description: 'Quality control standard protocol', tags: [{ label: 'golden-recipe', tone: 'amber' }], author: 'James Park', branch: 'branch' },
  { id: 378, description: 'Extended validation for development phase', tags: [{ label: 'development', tone: 'green' }], author: 'Dr. Sarah Chen', branch: 'main' },
  { id: 379, description: 'Optimized test suite with performance improvements', tags: [{ label: 'development', tone: 'green' }], author: 'Dr. Sarah Chen', branch: 'main' },
  { id: 381, description: 'Final production golden recipe', tags: [{ label: 'golden-recipe', tone: 'amber' }], author: 'James Park', branch: 'main' },
]

const tagClass: Record<'green' | 'blue' | 'amber', string> = {
  green: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
}

export function VersioningDrawer({ drawerId }: { drawerId: string }) {
  const closeDrawer = useBuilderStore((s) => s.closeDrawer)
  const [versionFilter, setVersionFilter] = useState('')
  const [messageFilter, setMessageFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  const filtered = VERSIONS.filter((v) => {
    if (versionFilter && !String(v.id).includes(versionFilter)) return false
    if (messageFilter && !v.description.toLowerCase().includes(messageFilter.toLowerCase()))
      return false
    if (tagFilter && !v.tags.some((t) => t.label.includes(tagFilter.toLowerCase()))) return false
    return true
  })

  return (
    <DrawerShell title="Recipe Lineage" onClose={() => closeDrawer(drawerId)} width="w-[560px]">
      <ScrollArea className="h-full">
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="font-semibold">Version History</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Main
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Branch
              </span>
            </div>
            <div className="flex gap-1.5">
              <Input
                placeholder="Filter by version…"
                value={versionFilter}
                onChange={(e) => setVersionFilter(e.target.value)}
                className="h-7 w-28 text-xs"
              />
              <Input
                placeholder="Filter by message…"
                value={messageFilter}
                onChange={(e) => setMessageFilter(e.target.value)}
                className="h-7 w-32 text-xs"
              />
              <Input
                placeholder="Filter by tag…"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="h-7 w-28 text-xs"
              />
            </div>
          </div>

          <div className="rounded-md border bg-white">
            <div className="grid grid-cols-[60px_1fr_220px_140px_60px] gap-2 border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <span>Version</span>
              <span>Description</span>
              <span>Tags</span>
              <span>Author</span>
              <span className="text-right">Actions</span>
            </div>
            {filtered.map((v) => (
              <div
                key={v.id}
                className="grid grid-cols-[60px_1fr_220px_140px_60px] items-center gap-2 border-b px-3 py-2 text-xs last:border-0"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      v.branch === 'main' ? 'bg-emerald-500' : 'bg-blue-500',
                    )}
                  />
                  <span className="font-mono text-slate-700">{v.id}</span>
                </span>
                <span className="truncate text-slate-700">{v.description}</span>
                <span className="flex flex-wrap gap-1">
                  {v.tags.map((t) => (
                    <Badge
                      key={t.label}
                      variant="outline"
                      className={cn('border-0 text-[10px]', tagClass[t.tone])}
                    >
                      {t.label}
                    </Badge>
                  ))}
                </span>
                <span className="truncate text-slate-600">{v.author}</span>
                <span className="text-right">
                  <Button size="sm" variant="outline" className="h-6 text-[10px]">
                    Load
                  </Button>
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-slate-500">No matches.</div>
            )}
          </div>
        </div>
      </ScrollArea>
    </DrawerShell>
  )
}
