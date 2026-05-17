import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Modal,
  Sheet,
  Button,
  ConfidenceBadge,
  SeverityBadge,
  Badge,
  StatusPill,
  FilterChip } from
'./ui';
import { useTaskStore } from '../store';
import {
  FileText,
  AlertTriangle,
  Check,
  X as XIcon,
  ArrowUpDown,
  Layers,
  Sparkles,
  Users,
  Clock,
  ExternalLink,
  ShieldAlert } from
'lucide-react';
import toast from 'react-hot-toast';
import { ConfidenceLevel } from '../types';
/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
const relevanceFromConfidence = (c: ConfidenceLevel) => {
  if (c === 'high')
  return {
    label: 'Material',
    tone: 'emerald' as const
  };
  if (c === 'medium')
  return {
    label: 'Ambiguous',
    tone: 'amber' as const
  };
  if (c === 'low')
  return {
    label: 'Likely irrelevant',
    tone: 'zinc' as const
  };
  if (c === 'conflicted')
  return {
    label: 'Conflicted',
    tone: 'red' as const
  };
  return {
    label: 'Outside scope',
    tone: 'amber' as const
  };
};
const RelevanceTag = ({ level }: {level: ConfidenceLevel;}) => {
  const { label, tone } = relevanceFromConfidence(level);
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    zinc: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${tones[tone]}`}>
      
      {label}
    </span>);

};
const SmallTag = ({
  children,
  tone = 'zinc'



}: {children: React.ReactNode;tone?: 'zinc' | 'blue' | 'violet';}) => {
  const tones = {
    zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100'
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border font-mono ${tones[tone]}`}>
      
      {children}
    </span>);

};
/* -------------------------------------------------------------------------- */
/* Evidence Review                                                            */
/* -------------------------------------------------------------------------- */
export const EvidenceReviewModal = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { evidence, acceptEvidence } = useTaskStore();
  const items = taskId ? evidence[taskId] || [] : [];
  const [filter, setFilter] = useState<'all' | ConfidenceLevel>('all');
  const [selected, setSelected] = useState<Set<string>>(
    new Set(items.filter((i) => i.confidence === 'high').map((i) => i.id))
  );
  const [sortBy, setSortBy] = useState<'confidence' | 'source'>('confidence');
  const confidenceOrder: Record<ConfidenceLevel, number> = {
    conflicted: 0,
    low: 1,
    unverified: 2,
    medium: 3,
    high: 4
  };
  const filtered = useMemo(() => {
    const f =
    filter === 'all' ? items : items.filter((i) => i.confidence === filter);
    return [...f].sort((a, b) => {
      if (sortBy === 'confidence')
      return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
      return a.source_document_id.localeCompare(b.source_document_id);
    });
  }, [items, filter, sortBy]);
  const counts = {
    all: items.length,
    high: items.filter((i) => i.confidence === 'high').length,
    medium: items.filter((i) => i.confidence === 'medium').length,
    low: items.filter((i) => i.confidence === 'low').length,
    conflicted: items.filter((i) => i.confidence === 'conflicted').length
  };
  const hasConflict = items.some((i) => i.confidence === 'conflicted');
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);else
    next.add(id);
    setSelected(next);
  };
  const handleConfirm = () => {
    if (taskId) acceptEvidence(taskId);
    navigate('/');
  };
  return (
    <Sheet
      isOpen={true}
      onClose={() => navigate('/')}
      title="Evidence Review"
      status={<StatusPill label="Awaiting evidence review" tone="amber" />}
      headerActions={
      <Button variant="outline" className="h-8 px-3 text-xs gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort: Confidence
        </Button>
      }
      filters={
      <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            count={counts.all}>
            
              All
            </FilterChip>
            <FilterChip
            active={filter === 'high'}
            onClick={() => setFilter('high')}
            count={counts.high}>
            
              High
            </FilterChip>
            <FilterChip
            active={filter === 'medium'}
            onClick={() => setFilter('medium')}
            count={counts.medium}>
            
              Medium
            </FilterChip>
            <FilterChip
            active={filter === 'low'}
            onClick={() => setFilter('low')}
            count={counts.low}>
            
              Low
            </FilterChip>
            {counts.conflicted > 0 &&
          <FilterChip
            active={filter === 'conflicted'}
            onClick={() => setFilter('conflicted')}
            count={counts.conflicted}>
            
                Conflicted
              </FilterChip>
          }
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">
            {filtered.length} of {items.length} shown
          </div>
        </div>
      }
      footer={
      <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-700">
            <span className="font-semibold tabular-nums">{selected.size}</span>
            <span className="text-zinc-500"> of {items.length} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              Save draft
            </Button>
            <Button variant="outline" onClick={() => setSelected(new Set())}>
              Dismiss selected
            </Button>
            <Button onClick={handleConfirm}>Confirm and continue</Button>
          </div>
        </div>
      }>
      
      <div className="px-6 py-4 space-y-3">
        {hasConflict &&
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
            <div className="flex items-center gap-2 text-red-800">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Source conflict detected
              </span>
              <span className="text-sm text-red-700/80">
                — two passages disagree on the same claim. Resolve before
                continuing.
              </span>
            </div>
            <Button
            variant="outline"
            className="h-7 px-2.5 text-xs border-red-200 text-red-700 hover:bg-red-100">
            
              Resolve conflict
            </Button>
          </div>
        }

        <div className="rounded-lg border border-zinc-200 overflow-hidden bg-white">
          <div className="grid grid-cols-[28px_180px_1fr_120px_110px_140px] gap-3 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            <span></span>
            <span>Source</span>
            <span>Passage</span>
            <span>Relevance</span>
            <span>Confidence</span>
            <span className="text-right">Action</span>
          </div>
          {filtered.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <div
                key={item.id}
                className={`grid grid-cols-[28px_180px_1fr_120px_110px_140px] gap-3 px-4 py-3 border-b border-zinc-100 last:border-b-0 transition-colors ${isSelected ? 'bg-blue-50/40' : 'hover:bg-zinc-50/50'}`}>
                
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(item.id)}
                  className="mt-1 w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`Select evidence ${item.id}`} />
                
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 truncate">
                    {item.source_document_id}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <SmallTag tone="violet">AI candidate</SmallTag>
                    <SmallTag>§{item.section_ref}</SmallTag>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                    pg {item.page_number}
                  </div>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  "{item.passage_text}"
                </p>
                <div>
                  <RelevanceTag level={item.confidence} />
                </div>
                <div>
                  <ConfidenceBadge level={item.confidence} />
                </div>
                <div className="flex justify-end gap-1.5">
                  <Button variant="outline" className="h-7 px-2 text-xs">
                    Dismiss
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-7 px-2 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
                    
                    Confirm
                  </Button>
                </div>
              </div>);

          })}
        </div>
      </div>
    </Sheet>);

};
/* -------------------------------------------------------------------------- */
/* Gap Review                                                                 */
/* -------------------------------------------------------------------------- */
export const GapReviewModal = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { gaps, acknowledgeGaps } = useTaskStore();
  const items = taskId ? gaps[taskId] || [] : [];
  const [filter, setFilter] = useState<
    'all' | 'critical' | 'notable' | 'minor'>(
    'all');
  const filtered =
  filter === 'all' ? items : items.filter((g) => g.severity === filter);
  const counts = {
    critical: items.filter((g) => g.severity === 'critical').length,
    notable: items.filter((g) => g.severity === 'notable').length,
    minor: items.filter((g) => g.severity === 'minor').length
  };
  const handleConfirm = () => {
    if (taskId) acknowledgeGaps(taskId);
    navigate('/');
  };
  return (
    <Sheet
      isOpen={true}
      onClose={() => navigate('/')}
      title="Gap Analysis Review"
      status={<StatusPill label="Awaiting gap review" tone="amber" />}
      headerActions={
      <Button variant="outline" className="h-8 px-3 text-xs gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Group by section
        </Button>
      }
      filters={
      <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            count={items.length}>
            
              All
            </FilterChip>
            <FilterChip
            active={filter === 'critical'}
            onClick={() => setFilter('critical')}
            count={counts.critical}>
            
              Critical
            </FilterChip>
            <FilterChip
            active={filter === 'notable'}
            onClick={() => setFilter('notable')}
            count={counts.notable}>
            
              Notable
            </FilterChip>
            <FilterChip
            active={filter === 'minor'}
            onClick={() => setFilter('minor')}
            count={counts.minor}>
            
              Minor
            </FilterChip>
          </div>
          <Button variant="outline" className="h-7 px-2.5 text-xs">
            Batch acknowledge minor
          </Button>
        </div>
      }
      footer={
      <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-700">
            <span className="font-semibold tabular-nums">
              {filtered.length}
            </span>
            <span className="text-zinc-500"> gaps shown · </span>
            <span className="text-red-600 font-medium">
              {counts.critical} critical
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm and generate actions
            </Button>
          </div>
        </div>
      }>
      
      <div className="px-6 py-4 space-y-3">
        {filtered.map((gap) =>
        <div
          key={gap.id}
          className="border border-zinc-200 rounded-lg p-4 bg-white shadow-sm hover:border-zinc-300 transition-colors">
          
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <SeverityBadge level={gap.severity} />
                <SmallTag tone="violet">AI candidate</SmallTag>
                <SmallTag>§5.3.5.1</SmallTag>
                <span className="text-[10px] text-zinc-400 font-mono">
                  sentence {gap.sentence_id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Override
                </label>
                <select
                className="text-xs border border-zinc-200 rounded px-2 py-1 bg-white text-zinc-700 outline-none focus:border-blue-400"
                defaultValue={gap.severity}>
                
                  <option value="critical">Critical</option>
                  <option value="notable">Notable</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-zinc-900 font-medium leading-snug">
              {gap.description}
            </p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="flex items-start gap-2 p-2.5 bg-blue-50/40 rounded text-xs text-blue-900/90 border border-blue-100">
                <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <div className="font-semibold text-blue-900 mb-0.5">
                    Regulatory basis
                  </div>
                  <p>{gap.regulatory_basis}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 bg-zinc-50 rounded text-xs text-zinc-700 border border-zinc-200">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-zinc-500" />
                <div>
                  <div className="font-semibold text-zinc-900 mb-0.5">
                    Knowledge basis
                  </div>
                  <p className="font-mono">FDA draft guidance · 2024-09</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-zinc-100">
              <Button variant="ghost" className="h-7 px-2 text-xs">
                Dismiss
              </Button>
              <Button variant="outline" className="h-7 px-2 text-xs">
                View sentence
              </Button>
              <Button
              variant="secondary"
              className="h-7 px-2 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
              
                Acknowledge
              </Button>
            </div>
          </div>
        )}
      </div>
    </Sheet>);

};
/* -------------------------------------------------------------------------- */
/* Action Approval                                                            */
/* -------------------------------------------------------------------------- */
export const ActionApprovalModal = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { actions, commitActions } = useTaskStore();
  const items = taskId ? actions[taskId] || [] : [];
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const filtered =
  filter === 'all' ? items : items.filter((a) => a.urgency === filter);
  const counts = {
    all: items.length,
    high: items.filter((a) => a.urgency === 'high').length,
    medium: items.filter((a) => a.urgency === 'medium').length,
    low: items.filter((a) => a.urgency === 'low').length
  };
  const toggle = (id: string) => {
    const next = new Set(approved);
    if (next.has(id)) next.delete(id);else
    next.add(id);
    setApproved(next);
  };
  const handleCommit = () => {
    if (taskId) commitActions(taskId);
    toast.success(`${items.length} action items committed to tracker.`);
    navigate('/');
  };
  return (
    <Sheet
      isOpen={true}
      onClose={() => navigate('/')}
      title="Action Approval"
      status={<StatusPill label="Awaiting action approval" tone="amber" />}
      headerActions={
      <>
          <Button variant="outline" className="h-8 px-3 text-xs gap-1.5">
            <Users className="w-3.5 h-3.5" /> Group by owner
          </Button>
          <Button
          variant="outline"
          className="h-8 px-3 text-xs"
          onClick={() => setApproved(new Set(items.map((i) => i.id)))}>
          
            Approve all routine
          </Button>
        </>
      }
      filters={
      <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterChip
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            count={counts.all}>
            
              All
            </FilterChip>
            <FilterChip
            active={filter === 'high'}
            onClick={() => setFilter('high')}
            count={counts.high}>
            
              High urgency
            </FilterChip>
            <FilterChip
            active={filter === 'medium'}
            onClick={() => setFilter('medium')}
            count={counts.medium}>
            
              Medium
            </FilterChip>
            <FilterChip
            active={filter === 'low'}
            onClick={() => setFilter('low')}
            count={counts.low}>
            
              Low
            </FilterChip>
          </div>
          <div className="text-[11px] text-zinc-500 font-medium">
            {approved.size} of {items.length} ready to commit
          </div>
        </div>
      }
      footer={
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs">
            <StatusPill label={`${approved.size} approved`} tone="emerald" />
            <StatusPill
            label={`${items.length - approved.size} pending review`}
            tone="zinc" />
          
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              Save draft
            </Button>
            <Button onClick={handleCommit}>Commit to tracker</Button>
          </div>
        </div>
      }>
      
      <div className="px-6 py-4 space-y-2.5">
        {filtered.map((action) => {
          const isApproved = approved.has(action.id);
          const urgencyTone =
          action.urgency === 'high' ?
          'red' :
          action.urgency === 'medium' ?
          'amber' :
          'zinc';
          return (
            <div
              key={action.id}
              className={`border rounded-lg p-4 bg-white shadow-sm transition-all ${isApproved ? 'border-emerald-300 bg-emerald-50/30' : 'border-zinc-200 hover:border-zinc-300'}`}>
              
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <SmallTag tone="violet">AI candidate</SmallTag>
                  <StatusPill
                    label={`${action.urgency} urgency`}
                    tone={urgencyTone as any} />
                  
                  <SmallTag>§5.3.5.1</SmallTag>
                  <span className="text-[10px] font-mono text-zinc-400">
                    linked to gap {action.gap_item_id}
                  </span>
                </div>
                <button
                  onClick={() => toggle(action.id)}
                  className={`shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded text-xs font-semibold border transition-colors ${isApproved ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'}`}>
                  
                  {isApproved ?
                  <>
                      <Check className="w-3.5 h-3.5" /> Approved
                    </> :

                  'Approve'
                  }
                </button>
              </div>
              <h4 className="text-sm font-semibold text-zinc-900 mb-1">
                {action.description}
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed mb-3">
                <span className="font-semibold text-zinc-700">
                  Resolution path:{' '}
                </span>
                {action.resolution_path}
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold shrink-0">
                    Owner
                  </label>
                  <select className="text-xs border border-zinc-200 rounded px-2 py-1 bg-white flex-1 outline-none focus:border-blue-400">
                    <option>{action.recommended_owner}</option>
                    <option>Priya Menon</option>
                    <option>Sonia VP</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold shrink-0">
                    Urgency
                  </label>
                  <select
                    className="text-xs border border-zinc-200 rounded px-2 py-1 bg-white flex-1 outline-none focus:border-blue-400"
                    defaultValue={action.urgency}>
                    
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <Button
                  variant="ghost"
                  className="h-7 px-2 text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50">
                  
                  <XIcon className="w-3.5 h-3.5 mr-1" /> Dismiss
                </Button>
              </div>
            </div>);

        })}
      </div>
    </Sheet>);

};
/* -------------------------------------------------------------------------- */
/* Task Launcher — stays a true centered modal (it's a launch, not a queue)   */
/* -------------------------------------------------------------------------- */
export const TaskLauncherModal = () => {
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState(
    'Section 5.3.5.1 — Safety Summary (Study 204)'
  );
  const [section, setSection] = useState('5.3.5.1');
  const [sources, setSources] = useState<string[]>([
  'Study 204 CSR',
  'Study 196 CSR']
  );
  const [styleGuide, setStyleGuide] = useState('FDA NDA Style Guide v3.2');
  const availableDocs = [
  'Study 204 CSR',
  'Study 196 CSR',
  'Integrated Safety Report',
  'Study 188 CSR',
  'Preclinical Summary'];

  const toggleSource = (doc: string) => {
    setSources((prev) =>
    prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };
  const scopeText = `I will extract evidence for CTD Section ${section} from ${sources.length} selected source document${sources.length === 1 ? '' : 's'}, draft the section summary, identify weak or missing support, and generate recommended follow-up actions.`;
  return (
    <Modal
      isOpen={true}
      onClose={() => navigate('/')}
      title="Launch new agent task"
      footer={
      <>
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button variant="secondary">Save draft</Button>
          <Button onClick={() => navigate('/')} disabled={sources.length === 0}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Launch task
          </Button>
        </>
      }>
      
      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 block">
            Task name
          </label>
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 block">
              Target CTD section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
              
              <option value="5.3.5.1">
                5.3.5.1 — Individual Study Reports
              </option>
              <option value="2.7.4">2.7.4 — Summary of Clinical Safety</option>
              <option value="2.7.3">
                2.7.3 — Summary of Clinical Efficacy
              </option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 block">
              Style guide{' '}
              <span className="text-zinc-400 normal-case font-normal">
                (optional)
              </span>
            </label>
            <select
              value={styleGuide}
              onChange={(e) => setStyleGuide(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
              
              <option>FDA NDA Style Guide v3.2</option>
              <option>EMA Submission Style v2.1</option>
              <option>None</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5 block">
            Source documents
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableDocs.map((doc) => {
              const selected = sources.includes(doc);
              return (
                <button
                  key={doc}
                  onClick={() => toggleSource(doc)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selected ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}>
                  
                  {selected && <Check className="w-3 h-3" />}
                  {doc}
                </button>);

            })}
          </div>
        </div>

        {/* Scope confirmation card */}
        <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 bg-blue-50/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Agent restatement — confirm scope
              </h4>
            </div>
            <button className="text-[10px] uppercase tracking-wider font-semibold text-blue-700 hover:underline">
              Edit
            </button>
          </div>
          <p className="text-sm text-blue-900 leading-relaxed italic">
            "{scopeText}"
          </p>
          <p className="text-[11px] text-blue-700/70 mt-3">
            If this doesn't match your intent, edit the scope or adjust the
            inputs above before launching.
          </p>
        </div>
      </div>
    </Modal>);

};