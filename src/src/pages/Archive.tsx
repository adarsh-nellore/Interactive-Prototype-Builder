import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '../store';
import {
  Button,
  StatusPill,
  ConfidenceBadge,
  SeverityBadge } from
'../components/ui';
import {
  ArrowLeft,
  Clock,
  FileText,
  Download,
  Sparkles,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flag,
  PauseCircle,
  XCircle,
  ChevronRight } from
'lucide-react';
import { TaskState } from '../types';
const stateConfig: Record<
  string,
  {
    tone: any;
    Icon: any;
    label: string;
  }> =
{
  complete: {
    tone: 'emerald',
    Icon: CheckCircle2,
    label: 'Complete'
  },
  stalled: {
    tone: 'red',
    Icon: PauseCircle,
    label: 'Stalled'
  },
  cancelled: {
    tone: 'zinc',
    Icon: XCircle,
    label: 'Cancelled'
  },
  awaiting_evidence_review: {
    tone: 'amber',
    Icon: AlertTriangle,
    label: 'Active · awaiting review'
  }
};
const stateOf = (state: TaskState) =>
stateConfig[state] || {
  tone: 'blue',
  Icon: Sparkles,
  label: state.replace(/_/g, ' ')
};
const formatDate = (iso: string) =>
new Date(iso).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});
const formatDuration = (start: string, end: string | null) => {
  if (!end) return '—';
  const mins = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000
  );
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};
export const TaskArchive = () => {
  const { tasks } = useTaskStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<
    'all' | 'complete' | 'stalled' | 'cancelled'>(
    'all');
  const [query, setQuery] = useState('');
  const allTasks = Object.values(tasks).sort(
    (a, b) =>
    new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
  const filtered = allTasks.filter((t) => {
    if (filter !== 'all' && t.state !== filter) return false;
    if (query && !t.name.toLowerCase().includes(query.toLowerCase()))
    return false;
    return true;
  });
  const stats = {
    total: allTasks.length,
    complete: allTasks.filter((t) => t.state === 'complete').length,
    stalled: allTasks.filter((t) => t.state === 'stalled').length,
    active: allTasks.filter(
      (t) =>
      t.state.startsWith('awaiting') ||
      t.state.startsWith('running') ||
      t.state.startsWith('drafting') ||
      t.state.startsWith('generating') ||
      t.state.startsWith('extracting')
    ).length
  };
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500">
            
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-zinc-900">
              Task Archive
            </h1>
            <p className="text-xs text-zinc-500">
              Complete history of delegated agent tasks · NDA 214-555
            </p>
          </div>
        </div>
        <Button variant="outline" className="h-8 px-3 text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export compliance report
        </Button>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stat row */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Total tasks" value={stats.total} />
          <StatCard label="Complete" value={stats.complete} tone="emerald" />
          <StatCard label="Active" value={stats.active} tone="blue" />
          <StatCard label="Stalled" value={stats.stalled} tone="red" />
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {(['all', 'complete', 'stalled', 'cancelled'] as const).map((f) =>
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'}`}>
              
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-md bg-white w-64 outline-none focus:border-blue-400" />
            
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_160px_120px_120px_60px] gap-4 px-5 py-2.5 bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <div>Task</div>
            <div>Section</div>
            <div>Status</div>
            <div>Started</div>
            <div>Duration</div>
            <div></div>
          </div>
          {filtered.length === 0 &&
          <div className="px-5 py-12 text-center text-sm text-zinc-500">
              No tasks match your filters.
            </div>
          }
          {filtered.map((task) => {
            const cfg = stateOf(task.state);
            return (
              <button
                key={task.id}
                onClick={() => navigate(`/archive/${task.id}`)}
                className="w-full text-left grid grid-cols-[1fr_120px_160px_120px_120px_60px] gap-4 px-5 py-3 border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 transition-colors group items-center">
                
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-900 truncate">
                    {task.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {task.source_document_ids.length} source docs
                  </div>
                </div>
                <div className="text-xs font-mono text-zinc-600">
                  {task.target_section}
                </div>
                <div>
                  <StatusPill label={cfg.label} tone={cfg.tone} />
                </div>
                <div className="text-xs text-zinc-600">
                  {formatDate(task.started_at)}
                </div>
                <div className="text-xs text-zinc-600 font-mono">
                  {formatDuration(task.started_at, task.completed_at)}
                </div>
                <div className="text-zinc-400 group-hover:text-zinc-700">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>);

          })}
        </div>
      </div>
    </div>);

};
const StatCard = ({
  label,
  value,
  tone = 'zinc'




}: {label: string;value: number;tone?: 'zinc' | 'emerald' | 'blue' | 'red';}) => {
  const tones = {
    zinc: 'text-zinc-900',
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    red: 'text-red-700'
  };
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className={`text-2xl font-bold mt-1 tabular-nums ${tones[tone]}`}>
        {value}
      </div>
    </div>);

};
/* -------------------------------------------------------------------------- */
/* Detail page                                                                */
/* -------------------------------------------------------------------------- */
export const TaskArchiveDetail = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { tasks, reasoning, evidence, drafts, gaps, actions } = useTaskStore();
  const task = taskId ? tasks[taskId] : null;
  const [tab, setTab] = useState<
    'reasoning' | 'evidence' | 'draft' | 'gaps' | 'actions'>(
    'reasoning');
  if (!task) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-zinc-500">Task not found.</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => navigate('/archive')}>
            
            Back to archive
          </Button>
        </div>
      </div>);

  }
  const cfg = stateOf(task.state);
  const taskReasoning = reasoning[task.id] || [];
  const taskEvidence = evidence[task.id] || [];
  const taskDraft = drafts[task.id] || [];
  const taskGaps = gaps[task.id] || [];
  const taskActions = actions[task.id] || [];
  const tabs = [
  {
    id: 'reasoning',
    label: 'Reasoning trail',
    count: taskReasoning.length,
    Icon: Sparkles
  },
  {
    id: 'evidence',
    label: 'Evidence',
    count: taskEvidence.length,
    Icon: FileText
  },
  {
    id: 'draft',
    label: 'Draft',
    count: taskDraft.length,
    Icon: FileText
  },
  {
    id: 'gaps',
    label: 'Gaps',
    count: taskGaps.length,
    Icon: Flag
  },
  {
    id: 'actions',
    label: 'Actions',
    count: taskActions.length,
    Icon: CheckCircle2
  }] as
  const;
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/archive')}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500">
            
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/archive')}
            className="text-xs text-zinc-500 hover:text-zinc-900">
            
            Archive
          </button>
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          <span className="text-xs font-mono text-zinc-700">
            {task.target_section}
          </span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-zinc-900 truncate">
              {task.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
              <StatusPill label={cfg.label} tone={cfg.tone} />
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(task.started_at)}
              </span>
              <span>
                Duration: {formatDuration(task.started_at, task.completed_at)}
              </span>
              <span>{task.source_document_ids.length} sources</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" className="h-8 px-3 text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export trail
            </Button>
            <Button variant="outline" className="h-8 px-3 text-xs">
              Open in workspace
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex items-center border-b border-zinc-200 mb-5 bg-white rounded-t-lg px-2 -mb-px shadow-sm">
          {tabs.map((t) =>
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${tab === t.id ? 'text-zinc-900 border-zinc-900' : 'text-zinc-500 border-transparent hover:text-zinc-700'}`}>
            
              <t.Icon className="w-3.5 h-3.5" />
              {t.label}
              <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-zinc-100 text-zinc-700 text-[9px] font-bold tabular-nums">
                {t.count}
              </span>
            </button>
          )}
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-6">
          {tab === 'reasoning' &&
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Reasoning trail
                </h2>
                <div className="text-xs text-zinc-500">
                  {taskReasoning.length} entries · streamed live during
                  execution
                </div>
              </div>
              <ol className="space-y-3 relative">
                {taskReasoning.map((entry, idx) =>
              <li key={entry.id} className="pl-6 relative">
                    <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500" />
                    {idx < taskReasoning.length - 1 &&
                <span className="absolute left-[3px] top-3.5 bottom-[-12px] w-px bg-zinc-200" />
                }
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                        {entry.step}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-700 leading-relaxed">
                      {entry.text}
                    </p>
                  </li>
              )}
              </ol>
            </div>
          }

          {tab === 'evidence' &&
          <div className="space-y-3">
              {taskEvidence.length === 0 &&
            <p className="text-sm text-zinc-500">
                  No evidence captured for this task.
                </p>
            }
              {taskEvidence.map((e) =>
            <div
              key={e.id}
              className="border border-zinc-200 rounded-lg p-4">
              
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-xs font-semibold text-zinc-900">
                      {e.source_document_id} · pg {e.page_number} · §
                      {e.section_ref}
                    </div>
                    <ConfidenceBadge level={e.confidence} />
                  </div>
                  <p className="text-sm text-zinc-700 italic font-serif">
                    "{e.passage_text}"
                  </p>
                </div>
            )}
            </div>
          }

          {tab === 'draft' &&
          <article className="prose prose-sm max-w-none font-serif text-zinc-800">
              {taskDraft.length === 0 ?
            <p className="text-sm text-zinc-500 font-sans">
                  No draft produced for this task.
                </p> :

            <p className="leading-loose text-base">
                  {taskDraft.map((s) =>
              <span
                key={s.id}
                className={
                s.confidence === 'low' ?
                'decoration-amber-500 underline-offset-4 decoration-2 underline' :
                ''
                }>
                
                      {s.text}{' '}
                    </span>
              )}
                </p>
            }
            </article>
          }

          {tab === 'gaps' &&
          <div className="space-y-3">
              {taskGaps.length === 0 &&
            <p className="text-sm text-zinc-500">
                  No gaps recorded for this task.
                </p>
            }
              {taskGaps.map((g) =>
            <div
              key={g.id}
              className="border border-zinc-200 rounded-lg p-4">
              
                  <div className="flex items-center justify-between mb-2">
                    <SeverityBadge level={g.severity} />
                    <span className="text-[10px] font-mono text-zinc-400">
                      linked sentence: {g.sentence_id}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-800 font-medium mb-2">
                    {g.description}
                  </p>
                  <p className="text-xs text-zinc-600">
                    <strong>Regulatory basis:</strong> {g.regulatory_basis}
                  </p>
                </div>
            )}
            </div>
          }

          {tab === 'actions' &&
          <div className="space-y-3">
              {taskActions.length === 0 &&
            <p className="text-sm text-zinc-500">
                  No action items generated for this task.
                </p>
            }
              {taskActions.map((a) =>
            <div
              key={a.id}
              className="border border-zinc-200 rounded-lg p-4">
              
                  <h4 className="text-sm font-semibold text-zinc-900 mb-1">
                    {a.description}
                  </h4>
                  <p className="text-xs text-zinc-600 mb-3">
                    {a.resolution_path}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                    <span>
                      <strong className="text-zinc-700">Owner:</strong>{' '}
                      {a.recommended_owner}
                    </span>
                    <span>
                      <strong className="text-zinc-700">Urgency:</strong>{' '}
                      {a.urgency}
                    </span>
                    <StatusPill
                  label={a.status === 'committed' ? 'Committed' : 'Pending'}
                  tone={a.status === 'committed' ? 'emerald' : 'zinc'} />
                
                  </div>
                </div>
            )}
            </div>
          }
        </div>
      </div>
    </div>);

};