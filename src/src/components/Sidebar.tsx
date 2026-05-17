import React, { useEffect, useMemo, useState, useRef, Component } from 'react';
import { motion } from 'framer-motion';
import {
  Activity as ActivityIcon,
  CheckCircle2,
  FileText,
  Flag,
  ChevronRight,
  Download,
  Pause,
  Bell,
  Send,
  MoreHorizontal,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  FileSearch,
  PenLine,
  ListChecks,
  Zap,
  Cpu,
  Check,
  X as XIcon } from
'lucide-react';
import { useTaskStore } from '../store';
import { cn } from '../lib/cn';
import { useNavigate } from 'react-router-dom';
import { TaskState, Banner, ReasoningEntry } from '../types';
/* ========================================================================== */
/* Constants & Helpers                                                        */
/* ========================================================================== */
const STEPS = [
{
  id: 'evidence',
  label: 'Evidence'
},
{
  id: 'draft',
  label: 'Draft'
},
{
  id: 'gaps',
  label: 'Gaps'
},
{
  id: 'actions',
  label: 'Actions'
}];

const STATE_INDEX: Record<string, number> = {
  extracting_evidence: 0,
  awaiting_evidence_review: 1,
  drafting_section: 2,
  draft_ready: 3,
  running_gap_analysis: 4,
  awaiting_gap_review: 5,
  generating_actions: 6,
  awaiting_action_approval: 7,
  complete: 8
};
const STEP_TARGETS = [1, 3, 5, 7];
const formatElapsed = (startISO: string) => {
  const ms = Date.now() - new Date(startISO).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};
const formatTime = (iso: string) =>
new Date(iso).toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit'
});
/* ========================================================================== */
/* Chat message synthesis                                                     */
/* ========================================================================== */
type ChatItem =
{
  kind: 'user';
  id: string;
  text: string;
  meta?: string;
} |
{
  kind: 'agent';
  id: string;
  text: string;
  timestamp: string;
} |
{
  kind: 'tool';
  id: string;
  timestamp: string;
  tool: string;
  target: string;
  summary: string;
  detail?: string;
  state: 'running' | 'completed' | 'failed';
  result?: {
    label: string;
    value: string;
  }[];
} |
{
  kind: 'review';
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  actionLabel: string;
  to: string;
  urgent?: boolean;
  completed?: boolean;
} |
{
  kind: 'divider';
  id: string;
  label: string;
};
const toolForEntry = (entry: ReasoningEntry): ChatItem | null => {
  const text = entry.text;
  const id = `t-${entry.id}`;
  const ts = entry.timestamp;
  if (/^Indexed/.test(text)) {
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'index_documents',
      target: '3 source documents',
      summary: 'Indexed 1,847 pages',
      detail: text,
      state: 'completed',
      result: [
      {
        label: 'docs',
        value: '3'
      },
      {
        label: 'pages',
        value: '1,847'
      }]

    };
  }
  if (/^Scanning/.test(text)) {
    const target = text.match(/Scanning ([^\.]+?)( for|\.)/)?.[1] ?? 'source';
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'scan_passages',
      target,
      summary: 'Scanning for relevant passages',
      detail: text,
      state: 'completed'
    };
  }
  if (/^Extracted/.test(text)) {
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'extract_passage',
      target: text.match(/from page \d+/)?.[0] ?? 'page reference',
      summary: text.split('.')[0] || 'Extracted passage',
      detail: text,
      state: 'completed'
    };
  }
  if (/^Found/.test(text)) {
    const isLow = /Low/i.test(text);
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'score_confidence',
      target: 'Study 196 CSR §9.4',
      summary: isLow ? 'Confidence scored Low — flagged' : 'Confidence scored',
      detail: text,
      state: isLow ? 'failed' : 'completed'
    };
  }
  if (/^Detected/.test(text) || /contradiction/i.test(text)) {
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'detect_conflict',
      target: 'ISR §4.1 vs Study 196 §9.4.2',
      summary: 'Source contradiction detected',
      detail: text,
      state: 'failed',
      result: [
      {
        label: 'severity',
        value: 'non-blocking'
      }]

    };
  }
  if (/^Composing sentences/.test(text)) {
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'compose_sentences',
      target: text.match(/sentences? [\d–-]+/)?.[0] ?? 'sentences',
      summary: 'Drafting sentences with citations',
      detail: text,
      state: 'completed'
    };
  }
  if (/^Composing sentence/.test(text)) {
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'compose_sentence',
      target: 'sentence 4',
      summary: 'Low-confidence annotation applied',
      detail: text,
      state: 'failed'
    };
  }
  if (/^Identified critical gap/.test(text)) {
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'analyze_gap',
      target: 'sentence 4 (hepatic claim)',
      summary: 'Critical gap identified',
      detail: text,
      state: 'failed'
    };
  }
  if (/^Action \d+/.test(text)) {
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'generate_action',
      target: text.match(/Action \d+/)?.[0] ?? 'action',
      summary: text.split('.')[0],
      detail: text,
      state: 'completed'
    };
  }
  return null;
};
const agentNarration = (entry: ReasoningEntry): ChatItem | null => {
  const text = entry.text;
  const id = `a-${entry.id}`;
  if (/Task launched/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: "I'll start by indexing your three designated sources and extracting evidence relevant to §5.3.5.1. I'll flag anything below high confidence."
  };
  if (/Extracted 6 evidence items/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: "I've extracted **6 evidence items** across the three sources. One pair is **conflicted** — the ISR says no Hy's Law cases, but Study 196 §9.4.2 documents one. I won't draft until you've reviewed."
  };
  if (/Evidence review complete/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: "Thanks — drafting §5.3.5.1.4 now. I'll mark any sentence I can't ground in High-confidence evidence with an amber underline."
  };
  if (/Draft complete/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: "Draft is ready (**8 sentences**). Sentence 4 carries a Low-confidence annotation due to the broad hepatic-function source, and sentence 7 is **unsourced** — I couldn't find direct evidence for the no-deaths claim."
  };
  if (/Draft review complete/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: 'Running gap analysis against **FDA DILI guidance (2009)** and **ICH E3**. Looking for under-supported claims and missing denominators.'
  };
  if (/3 gaps identified/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: "Identified **3 gaps**: 1 critical (hepatotoxicity single-source), 1 notable (Hy's Law contradiction to disclose), 1 minor (unsourced death claim). I'd recommend acknowledging at least the critical before I generate actions."
  };
  if (/Gaps acknowledged/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: 'Generating resolution actions and recommended owners.'
  };
  if (/3 action items ready/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: "**3 actions** drafted. Marcus Chen is the recommended owner for the hepatic source search (high urgency). You're flagged for the Hy's Law reconciliation. Review and commit when ready."
  };
  if (/Task complete/i.test(text))
  return {
    kind: 'agent',
    id,
    timestamp: entry.timestamp,
    text: '✓ All actions committed to the tracker. Section §5.3.5.1.4 is ready for medical writer hand-off.'
  };
  return null;
};
const buildChat = (
entries: ReasoningEntry[],
taskState: TaskState,
taskId: string)
: ChatItem[] => {
  const items: ChatItem[] = [];
  items.push({
    kind: 'user',
    id: 'u-init',
    text: 'Draft the §5.3.5.1.4 Integrated Safety Summary from the three CSRs. Surface any weak support before drafting.',
    meta: '3 docs attached'
  });
  let lastStep: string | null = null;
  for (const entry of entries) {
    if (entry.step !== lastStep) {
      const labels: Record<string, string> = {
        evidence: 'Evidence Extraction',
        draft: 'Section Drafting',
        gaps: 'Gap Analysis',
        actions: 'Action Generation'
      };
      items.push({
        kind: 'divider',
        id: `d-${entry.step}`,
        label: labels[entry.step] || entry.step
      });
      lastStep = entry.step;
    }
    const narration = agentNarration(entry);
    if (narration) {
      items.push(narration);
      continue;
    }
    const tool = toolForEntry(entry);
    if (tool) items.push(tool);
  }
  const insertReviewAfter = (afterStep: string, card: ChatItem) => {
    const lastDividerIdx = items.findIndex(
      (i) =>
      i.kind === 'divider' &&
      (i as any).label.toLowerCase().includes(afterStep)
    );
    if (lastDividerIdx === -1) {
      items.push(card);
      return;
    }
    let insertAt = items.length;
    for (let i = lastDividerIdx + 1; i < items.length; i++) {
      if (items[i].kind === 'divider') {
        insertAt = i;
        break;
      }
    }
    items.splice(insertAt, 0, card);
  };
  if (
  taskState === 'awaiting_evidence_review' ||
  STATE_INDEX[taskState] > STATE_INDEX.awaiting_evidence_review)
  {
    insertReviewAfter('evidence', {
      kind: 'review',
      id: 'r-evidence',
      title: 'Evidence table ready',
      subtitle: '6 passages · 1 conflict · 1 low-confidence',
      icon: FileText,
      actionLabel: 'Review evidence',
      to: `/tasks/${taskId}/evidence`,
      urgent: taskState === 'awaiting_evidence_review'
    });
    if (STATE_INDEX[taskState] > STATE_INDEX.awaiting_evidence_review) {
      const idx = items.findIndex((i) => i.id === 'r-evidence');
      items.splice(idx + 1, 0, {
        kind: 'user',
        id: 'u-after-evidence',
        text: 'Reviewed — 5 accepted, 1 flagged for disclosure. Proceed with drafting.'
      });
    }
  }
  if (
  taskState === 'draft_ready' ||
  STATE_INDEX[taskState] > STATE_INDEX.draft_ready)
  {
    insertReviewAfter('draft', {
      kind: 'review',
      id: 'r-draft',
      title: 'Draft section ready',
      subtitle: '8 sentences · 1 amber-flagged · 1 unsourced',
      icon: PenLine,
      actionLabel: 'Open draft review',
      to: `/tasks/${taskId}/draft`,
      urgent: taskState === 'draft_ready'
    });
    if (STATE_INDEX[taskState] > STATE_INDEX.draft_ready) {
      const idx = items.findIndex((i) => i.id === 'r-draft');
      items.splice(idx + 1, 0, {
        kind: 'user',
        id: 'u-after-draft',
        text: 'Draft accepted. Run gap analysis.'
      });
    }
  }
  if (
  taskState === 'awaiting_gap_review' ||
  STATE_INDEX[taskState] > STATE_INDEX.awaiting_gap_review)
  {
    insertReviewAfter('gap', {
      kind: 'review',
      id: 'r-gaps',
      title: 'Gap analysis complete',
      subtitle: '3 gaps · 1 critical · 1 notable · 1 minor',
      icon: Flag,
      actionLabel: 'Review gaps',
      to: `/tasks/${taskId}/gaps`,
      urgent: taskState === 'awaiting_gap_review'
    });
    if (STATE_INDEX[taskState] > STATE_INDEX.awaiting_gap_review) {
      const idx = items.findIndex((i) => i.id === 'r-gaps');
      items.splice(idx + 1, 0, {
        kind: 'user',
        id: 'u-after-gaps',
        text: 'Acknowledged. Generate actions.'
      });
    }
  }
  if (taskState === 'awaiting_action_approval' || taskState === 'complete') {
    insertReviewAfter('action', {
      kind: 'review',
      id: 'r-actions',
      title:
      taskState === 'complete' ?
      'Action items committed' :
      'Action items ready for approval',
      subtitle: '3 actions · linked to gaps',
      icon: ListChecks,
      actionLabel:
      taskState === 'complete' ? 'View summary' : 'Review & approve',
      to: `/tasks/${taskId}/actions`,
      urgent: taskState === 'awaiting_action_approval',
      completed: taskState === 'complete'
    });
  }
  return items;
};
/* ========================================================================== */
/* Sidebar root                                                               */
/* ========================================================================== */
export const TaskMonitorSidebar = () => {
  const { activeTaskId, tasks, reasoning, banners } = useTaskStore();
  const task = activeTaskId ? tasks[activeTaskId] : null;
  const entries = activeTaskId ? reasoning[activeTaskId] || [] : [];
  const activeBanners = banners.filter((b) => b.taskId === activeTaskId);
  const [tab, setTab] = useState<'chat' | 'alerts'>('chat');
  const prevAlerts = useRef(activeBanners.length);
  useEffect(() => {
    if (activeBanners.length > prevAlerts.current) setTab('alerts');
    prevAlerts.current = activeBanners.length;
  }, [activeBanners.length]);
  if (!task) {
    return (
      <aside className="w-[400px] border-l border-hairline-strong bg-soft p-6 flex flex-col items-center justify-center text-center shrink-0">
        <ActivityIcon className="w-8 h-8 text-faint mb-4" />
        <h3 className="text-sm font-medium text-ink">No active task</h3>
        <p className="text-xs text-muted mt-1">
          Launch a new task to start a copilot session.
        </p>
      </aside>);

  }
  const stateIdx = STATE_INDEX[task.state] ?? 0;
  const isStreaming = [
  'extracting_evidence',
  'drafting_section',
  'running_gap_analysis',
  'generating_actions'].
  includes(task.state);
  return (
    <aside className="w-[400px] border-l border-hairline-strong bg-stripe flex flex-col h-full overflow-hidden shrink-0 z-10">
      {/* Top bar */}
      <div className="px-3 py-2.5 border-b border-hairline-strong bg-paper flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <AgentAvatar size="sm" />
          <div className="min-w-0">
            <div
              className="text-[11px] text-muted font-mono truncate"
              title={task.name}>
              
              {task.target_section} · {formatElapsed(task.started_at)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="p-1 hover:bg-soft rounded text-muted"
            title="New chat">
            
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:bg-soft rounded text-muted" title="More">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-hairline-strong bg-paper px-2 shrink-0">
        <TabButton
          active={tab === 'chat'}
          onClick={() => setTab('chat')}
          label="Chat"
          streaming={isStreaming} />
        
        <TabButton
          active={tab === 'alerts'}
          onClick={() => setTab('alerts')}
          label="Alerts"
          count={activeBanners.length} />
        
        {/* Mini stepper */}
        <div className="ml-auto flex items-center gap-1 pr-1">
          {STEPS.map((step, idx) => {
            const target = STEP_TARGETS[idx];
            const status =
            stateIdx > target ?
            'complete' :
            stateIdx >= target - 1 ?
            'current' :
            'pending';
            return (
              <div
                key={step.id}
                title={step.label}
                className={cn(
                  'w-5 h-1.5 rounded-full transition-colors',
                  status === 'complete' ?
                  'bg-coral' :
                  status === 'current' ?
                  'bg-coral/40' :
                  'bg-hairline-strong'
                )} />);


          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'chat' ?
        <ChatThread
          entries={entries}
          taskState={task.state}
          taskId={task.id}
          isStreaming={isStreaming} /> :


        <AlertsList banners={activeBanners} />
        }
      </div>

      {/* Composer */}
      <Composer taskState={task.state} />
    </aside>);

};
/* ========================================================================== */
/* Components                                                                 */
/* ========================================================================== */
const AgentAvatar = ({ size = 'md' }: {size?: 'sm' | 'md';}) => {
  const s =
  size === 'sm' ?
  {
    halo: 'w-4 h-4',
    dot: 'w-1.5 h-1.5',
    text: 'text-[14px]'
  } :
  {
    halo: 'w-4.5 h-4.5',
    dot: 'w-2 h-2',
    text: 'text-[18px]'
  };
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full shrink-0 bg-coral-soft',
          s.halo
        )}>
        
        <span className={cn('rounded-full bg-coral', s.dot)} />
      </span>
      <span className={cn('font-sans font-medium text-ink', s.text)}>Peer</span>
    </span>);

};
const TabButton = ({
  active,
  onClick,
  label,
  count,
  streaming






}: {active: boolean;onClick: () => void;label: string;count?: number;streaming?: boolean;}) =>
<button
  onClick={onClick}
  className={cn(
    'flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px',
    active ?
    'text-ink border-coral' :
    'text-muted border-transparent hover:text-ink'
  )}>
  
    {label}
    {streaming &&
  <span className="inline-flex gap-0.5">
        <span className="w-1 h-1 rounded-full bg-muted animate-pulse" />
        <span
      className="w-1 h-1 rounded-full bg-muted animate-pulse"
      style={{
        animationDelay: '150ms'
      }} />
    
        <span
      className="w-1 h-1 rounded-full bg-muted animate-pulse"
      style={{
        animationDelay: '300ms'
      }} />
    
      </span>
  }
    {count !== undefined && count > 0 &&
  <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold tabular-nums bg-gold text-paper">
        {count}
      </span>
  }
  </button>;

const ChatThread = ({
  entries,
  taskState,
  taskId,
  isStreaming





}: {entries: ReasoningEntry[];taskState: TaskState;taskId: string;isStreaming: boolean;}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const items = useMemo(
    () => buildChat(entries, taskState, taskId),
    [entries, taskState, taskId]
  );
  useEffect(() => {
    if (scrollRef.current)
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [items.length, taskState]);
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-tame">
      
      {items.map((item) => {
        if (item.kind === 'user')
        return <UserMessage key={item.id} text={item.text} meta={item.meta} />;
        if (item.kind === 'agent')
        return (
          <AgentMessage
            key={item.id}
            text={item.text}
            timestamp={item.timestamp} />);


        if (item.kind === 'tool')
        return <ToolCallCard key={item.id} {...item} />;
        if (item.kind === 'review')
        return <ReviewCard key={item.id} {...item} />;
        if (item.kind === 'divider')
        return <Divider key={item.id} label={item.label} />;
        return null;
      })}

      {isStreaming &&
      <div className="flex items-center gap-2 text-xs text-muted italic pl-1">
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-muted animate-pulse" />
            <span
            className="w-1 h-1 rounded-full bg-muted animate-pulse"
            style={{
              animationDelay: '150ms'
            }} />
          
            <span
            className="w-1 h-1 rounded-full bg-muted animate-pulse"
            style={{
              animationDelay: '300ms'
            }} />
          
          </span>
          <span>Generating</span>
          <span className="inline-block w-1.5 h-3 bg-faint animate-pulse" />
        </div>
      }
    </div>);

};
const Divider = ({ label }: {label: string;}) =>
<div className="flex items-center gap-2 py-1">
    <div className="flex-1 h-px bg-hairline" />
    <span className="text-[9px] uppercase tracking-widest font-bold text-faint font-mono">
      {label}
    </span>
    <div className="flex-1 h-px bg-hairline" />
  </div>;

const UserMessage = ({ text, meta }: {text: string;meta?: string;}) =>
<motion.div
  initial={{
    opacity: 0,
    y: 4
  }}
  animate={{
    opacity: 1,
    y: 0
  }}
  className="flex justify-end">
  
    <div className="max-w-[88%] bg-soft rounded-lg rounded-tr-sm px-3 py-2 shadow-card">
      <p className="text-[13px] leading-[19px] text-ink">{text}</p>
      {meta &&
    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted font-mono">
          <span>@</span>
          <span>{meta}</span>
        </div>
    }
    </div>
  </motion.div>;

const renderMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
    return (
      <strong key={i} className="font-semibold text-ink">
          {p.slice(2, -2)}
        </strong>);

    if (p.startsWith('`') && p.endsWith('`'))
    return (
      <code
        key={i}
        className="px-1 py-0.5 rounded-xs bg-stripe text-ink font-mono text-[11px]">
        
          {p.slice(1, -1)}
        </code>);

    return <span key={i}>{p}</span>;
  });
};
const AgentMessage = ({
  text,
  timestamp



}: {text: string;timestamp: string;}) =>
<motion.div
  initial={{
    opacity: 0,
    y: 4
  }}
  animate={{
    opacity: 1,
    y: 0
  }}
  className="px-1">
  
    <p className="text-[13px] leading-[20px] text-ink">
      {renderMarkdown(text)}
    </p>
    <div className="text-[9px] text-faint font-mono mt-1">
      {formatTime(timestamp)}
    </div>
  </motion.div>;

const TOOL_ICONS: Record<string, any> = {
  index_documents: FileSearch,
  scan_passages: Search,
  extract_passage: FileText,
  score_confidence: Cpu,
  detect_conflict: AlertTriangle,
  compose_sentences: PenLine,
  compose_sentence: PenLine,
  analyze_gap: Flag,
  generate_action: Zap
};
const ToolCallCard = ({
  tool,
  target,
  summary,
  detail,
  state,
  result,
  timestamp











}: {tool: string;target: string;summary: string;detail?: string;state: 'running' | 'completed' | 'failed';result?: {label: string;value: string;}[];timestamp: string;}) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = TOOL_ICONS[tool] || FileText;
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 4
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className={cn(
        'flex flex-col gap-1.5 py-2.5 px-3 rounded-lg max-w-[420px]',
        state === 'running' && 'bg-stripe border border-hairline-strong',
        state === 'completed' && 'bg-paper border border-hairline-strong',
        state === 'failed' && 'bg-coral-soft border border-coral'
      )}>
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 text-left">
        
        {state === 'running' &&
        <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-muted animate-pulse" />
            <span
            className="w-1 h-1 rounded-full bg-muted animate-pulse"
            style={{
              animationDelay: '150ms'
            }} />
          
            <span
            className="w-1 h-1 rounded-full bg-muted animate-pulse"
            style={{
              animationDelay: '300ms'
            }} />
          
          </span>
        }
        {state === 'completed' &&
        <Check className="w-[11px] h-[11px] text-green" strokeWidth={2.5} />
        }
        {state === 'failed' &&
        <XIcon className="w-[11px] h-[11px] text-coral" strokeWidth={2.5} />
        }
        <span className="flex-1 font-mono font-bold text-[11px] tracking-[0.04em] text-ink">
          {tool}
        </span>
        {expanded ?
        <ChevronUp className="w-3 h-3 text-muted" /> :

        <ChevronDown className="w-3 h-3 text-muted" />
        }
      </button>
      {expanded &&
      <div className="space-y-1.5">
          {detail &&
        <p className="font-sans text-[12.5px] leading-[18px] text-muted">
              {detail}
            </p>
        }
          {result && result.length > 0 &&
        <div className="flex flex-wrap gap-1.5 pt-1">
              {result.map((r, i) =>
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-2 py-1 bg-stripe border border-hairline rounded-xs font-mono text-[10px] text-muted">
            
                  {r.label}={r.value}
                </span>
          )}
            </div>
        }
          <div className="text-[9px] text-faint font-mono">
            {formatTime(timestamp)}
          </div>
        </div>
      }
    </motion.div>);

};
const ReviewCard = ({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  to,
  urgent,
  completed








}: {title: string;subtitle: string;icon: any;actionLabel: string;to: string;urgent?: boolean;completed?: boolean;}) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.98,
        y: 4
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }}
      className={cn(
        'bg-paper border rounded-lg overflow-hidden shadow-card',
        urgent ?
        'border-gold ring-2 ring-gold/20' :
        completed ?
        'border-green' :
        'border-hairline-strong'
      )}>
      
      <div className="px-3 py-3 flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-md shrink-0',
            urgent ?
            'bg-gold-soft text-gold' :
            completed ?
            'bg-green-soft text-green' :
            'bg-coral-soft text-coral'
          )}>
          
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-[13px] font-semibold text-ink">{title}</h4>
            {urgent &&
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            }
          </div>
          <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="border-t border-hairline px-3 py-2 bg-soft flex items-center justify-end">
        <button
          onClick={() => navigate(to)}
          className={cn(
            'inline-flex items-center justify-center h-7 px-3 gap-1.5 rounded-md font-medium text-[13px] transition-colors',
            urgent ?
            'bg-coral text-white hover:bg-coral/90' :
            'bg-paper text-ink border border-hairline-strong hover:bg-soft'
          )}>
          
          {actionLabel} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>);

};
const AlertsList = ({ banners }: {banners: Banner[];}) => {
  const navigate = useNavigate();
  const { removeBanner } = useTaskStore();
  if (banners.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-10 h-10 rounded-full bg-green-soft border border-green flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5 text-green" />
        </div>
        <h3 className="text-sm font-semibold text-ink">No alerts</h3>
        <p className="text-xs text-muted mt-1 max-w-[220px]">
          The agent is working in the background. You'll be pinged here when
          your input is needed.
        </p>
      </div>);

  }
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scroll-tame">
      {banners.map((banner) => {
        const iconMap = {
          info: {
            Icon: Bell,
            color: 'text-info bg-info/10'
          },
          warning: {
            Icon: AlertTriangle,
            color: 'text-gold bg-gold-soft'
          },
          critical: {
            Icon: ShieldAlert,
            color: 'text-coral bg-coral-soft'
          }
        } as const;
        const { Icon, color } = iconMap[banner.urgency];
        const borderColor =
        banner.urgency === 'critical' ?
        'border-coral' :
        banner.urgency === 'warning' ?
        'border-gold' :
        'border-info';
        return (
          <motion.div
            key={banner.id}
            initial={{
              opacity: 0,
              x: 20
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            className={cn(
              'bg-paper border rounded-lg p-3 shadow-card',
              borderColor
            )}>
            
            <div className="flex items-start gap-2.5 mb-2.5">
              <div className={cn('p-1.5 rounded-md shrink-0', color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-faint font-mono">
                    {banner.urgency === 'critical' ?
                    'Action required' :
                    banner.urgency === 'warning' ?
                    'Review needed' :
                    'Update'}
                  </span>
                  <span className="text-[10px] text-faint font-mono">
                    just now
                  </span>
                </div>
                <p className="text-[13px] text-ink font-medium leading-snug mt-1">
                  {banner.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => removeBanner(banner.id)}
                className="text-[11px] font-medium text-muted hover:text-ink px-2 py-1">
                
                Dismiss
              </button>
              <button
                onClick={() => navigate(banner.linkTarget)}
                className="inline-flex items-center justify-center h-7 px-2.5 rounded-md bg-coral text-white hover:bg-coral/90 text-[13px] font-medium transition-colors">
                
                Open
              </button>
            </div>
          </motion.div>);

      })}
    </div>);

};
const Composer = ({ taskState }: {taskState: TaskState;}) => {
  const [value, setValue] = useState('');
  const suggestions = (() => {
    if (taskState === 'awaiting_evidence_review')
    return [
    'Why is Study 196 §9.4 low confidence?',
    'Show me the conflicting passages'];

    if (taskState === 'draft_ready')
    return ['Why is sentence 4 amber?', 'Show source for sentence 7'];
    if (taskState === 'awaiting_gap_review')
    return ['Cite the FDA guidance', 'What would resolve the critical gap?'];
    if (taskState === 'awaiting_action_approval')
    return ['Reassign all to Marcus', 'Why this owner?'];
    return ['Summarize progress', 'What needs my attention?'];
  })();
  return (
    <div className="border-t border-hairline-strong bg-paper p-2.5 shrink-0">
      <div className="flex flex-col gap-2 p-3 bg-paper rounded-card border border-hairline-strong focus-within:border-coral focus-within:border-[1.5px] transition-colors">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask Peer…"
          rows={2}
          className="w-full resize-none bg-transparent outline-none font-sans text-[13.5px] leading-[20px] text-ink placeholder:text-faint" />
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Attach"
            className="inline-flex items-center justify-center size-6 rounded-sm text-muted hover:text-ink hover:bg-stripe">
            
            <Plus className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-faint">
            / for commands
          </span>
          <span className="flex-1" />
          <button
            type="submit"
            aria-label="Send"
            disabled={!value.trim()}
            className={cn(
              'inline-flex items-center justify-center size-7 rounded-sm transition-colors',
              value.trim() ?
              'bg-coral text-white hover:bg-coral/90' :
              'bg-soft text-faint pointer-events-none'
            )}>
            
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-1.5">
        {suggestions.map((s) =>
        <button
          key={s}
          onClick={() => setValue(s)}
          className="text-[10px] text-muted hover:text-ink bg-soft hover:bg-stripe border border-hairline rounded-sm px-1.5 py-0.5 font-mono">
          
            {s}
          </button>
        )}
      </div>
    </div>);

};