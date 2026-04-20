import { AppLayout } from '@/components/layout/AppLayout';
import { Sparkles, Layers, BrainCircuit, Code2 } from 'lucide-react';

export default function Index() {
  return (
    <AppLayout>
      <div className="p-8 max-w-[1200px] mx-auto">
        <div className="mb-8 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">HireNowX · Revamp in Progress</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Foundations (design tokens, types, mock data for both Engineering and Sales templates) are ready.
              The three builders — Job Template, MCQ, Coding — will be implemented next against the new type system.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {[
            { icon: Layers, title: 'Job Template Builder', desc: 'Round sequence planner with AI recommendations and drag-reorder.' },
            { icon: BrainCircuit, title: 'MCQ Assessment Builder', desc: '3-step flow: Confirm Context → Generate → Review & Finalize.' },
            { icon: Code2, title: 'Coding Assessment Builder', desc: 'First-class coding flow with test cases, languages, integrity.' },
          ].map(c => (
            <div key={c.title} className="hnx-card p-6">
              <div className="w-10 h-10 rounded-lg bg-teal-light text-teal flex items-center justify-center mb-3">
                <c.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-navy mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className="hnx-dot bg-warning" /> Scaffolding
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
