import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Layers, BrainCircuit, Code2, ArrowRight, BarChart3, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const cards = [
    { title: 'Hiring Plan Builder', desc: 'Design end-to-end evaluation journeys with competency-driven round planning.', icon: Layers, url: '/hiring-plan', color: 'bg-primary/10 text-primary' },
    { title: 'MCQ Assessment Builder', desc: 'Create role-aware, AI-powered MCQ assessments with quality confidence.', icon: BrainCircuit, url: '/mcq-builder', color: 'bg-teal-light text-teal' },
    { title: 'Coding Assessment Builder', desc: 'Build coding challenges with language support, test cases, and scoring logic.', icon: Code2, url: '/coding-builder', color: 'bg-green-light text-hnxgreen' },
  ];

  const stats = [
    { label: 'Active Plans', value: '12', icon: FileText },
    { label: 'Assessments', value: '34', icon: BarChart3 },
    { label: 'Candidates', value: '256', icon: Users },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, Sarah</h1>
          <p className="text-sm text-muted-foreground mt-1">Build competency-driven hiring plans and assessments.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="hnx-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4">Build</h2>
        <div className="grid grid-cols-3 gap-5">
          {cards.map(card => (
            <Link key={card.url} to={card.url} className="hnx-card p-6 group hover:shadow-lg transition-all">
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{card.desc}</p>
              <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Open Builder <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
