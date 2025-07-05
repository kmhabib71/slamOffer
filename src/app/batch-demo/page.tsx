import { BatchGenerator } from '@/components/batch-generation/batch-generator'

export default function BatchDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto py-8">
        <BatchGenerator />
      </div>
    </div>
  )
}
