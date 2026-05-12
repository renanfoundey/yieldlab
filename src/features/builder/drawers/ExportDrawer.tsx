import { useState } from 'react'
import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuilderStore } from '@/store/builderStore'
import { DrawerShell } from './DrawerShell'

const TARGET_FORMATS = [
  { id: 'instron-bluehill', label: 'Instron Bluehill (.im_ten)' },
  { id: 'mts-testsuite', label: 'MTS TestSuite (.tssx)' },
  { id: 'zwick-testxpert', label: 'Zwick testXpert (.zp2)' },
  { id: 'json', label: 'Yieldlab JSON (.json)' },
]

const SAMPLE_MODELS = [
  { id: 'astm-e8', label: 'ASTM E8 round bar 12.5mm' },
  { id: 'astm-e8-flat', label: 'ASTM E8 flat 50mm GL' },
  { id: 'iso-6892', label: 'ISO 6892-1 flat' },
  { id: 'astm-d638', label: 'ASTM D638 dogbone type IV' },
]

export function ExportDrawer({ drawerId }: { drawerId: string }) {
  const closeDrawer = useBuilderStore((s) => s.closeDrawer)
  const nodes = useBuilderStore((s) => s.nodes)
  const [filename, setFilename] = useState('')
  const [target, setTarget] = useState<string>('')
  const [sampleModel, setSampleModel] = useState<string>('')

  const canGenerate = !!target && !!sampleModel

  const handleGenerate = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      target,
      sampleModel,
      nodes,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename || 'protocol'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DrawerShell
      title="Protocol Translation"
      onClose={() => closeDrawer(drawerId)}
      width="w-[440px]"
    >
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          <p className="text-xs text-slate-500">
            Generate hardware-specific protocol files from your Yieldlab protocol.
          </p>

          <div>
            <Label className="text-xs text-slate-700">Custom File Name (Optional)</Label>
            <Input
              placeholder="Enter custom file name (optional)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="mt-1 h-8 text-xs"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              If not specified, the protocol name will be used as the file name.
            </p>
          </div>

          <div>
            <Label className="text-xs text-slate-700">Target Format</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Select target format" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_FORMATS.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-slate-400">
              Choose the hardware format you want to generate the protocol for.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <Label className="text-xs text-slate-700">Sample Model</Label>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Select value={sampleModel} onValueChange={setSampleModel}>
              <SelectTrigger className="mt-1 h-8 text-xs">
                <SelectValue placeholder="Select a sample model" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_MODELS.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            <Download className="h-4 w-4" /> Generate &amp; Download Protocol
          </Button>
        </div>
      </ScrollArea>
    </DrawerShell>
  )
}
