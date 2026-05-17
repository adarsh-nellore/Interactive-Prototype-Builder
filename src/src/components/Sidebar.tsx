import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Activity as ActivityIcon,
  CheckCircle2,
  FileText,
  Flag,
  Sparkles,
  ChevronRight,
  Download,
  Pause,
  Loader2,
  Bell,
  Send,
  MoreHorizontal,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  AtSign,
  Wrench,
  Plus,
  Cpu,
  Search,
  FileSearch,
  PenLine,
  ListChecks,
  Zap } from
'lucide-react';
import { useTaskStore } from '../store';
import { StatusPill, Button } from './ui';
import { useNavigate } from 'react-router-dom';
import { TaskState, Banner, ReasoningEntry } from '../types';
/* ========================================================================== */
/* Constants                                                                  */
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
const stateMeta = (state: TaskState) => {
  if (state.startsWith('awaiting_')) {
    return {
      tone: 'amber' as const,
      label: state.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    };
  }
  if (state === 'complete')
  return {
    tone: 'emerald' as const,
    label: 'Complete'
  };
  if (state === 'stalled')
  return {
    tone: 'red' as const,
    label: 'Stalled'
  };
  if (state === 'cancelled')
  return {
    tone: 'zinc' as const,
    label: 'Cancelled'
  };
  return {
    tone: 'blue' as const,
    label: state.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  };
};
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
/* Chat message synthesis — turn ReasoningEntry[] + state into a Cursor-style */
/* mixed thread (user / agent text / tool call / review card / divider).      */
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
  status: 'running' | 'complete' | 'warning' | 'error';
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
  // Heuristic mapping of reasoning entries into tool call cards
  if (/^Indexed/.test(text)) {
    return {
      kind: 'tool',
      id,
      timestamp: ts,
      tool: 'index_documents',
      target: '3 source documents',
      summary: 'Indexed 1,847 pages',
      detail: text,
      status: 'complete',
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
      status: 'complete'
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
      status: 'complete'
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
      status: isLow ? 'warning' : 'complete'
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
      status: 'warning',
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
      status: 'complete'
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
      status: 'warning'
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
      status: 'warning'
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
      status: 'complete'
    };
  }
  return null;
};
const agentNarration = (entry: ReasoningEntry): ChatItem | null => {
  const text = entry.text;
  const id = `a-${entry.id}`;
  // Pick out narrative entries (the ones that summarize / talk to the user)
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
  // Initial user prompt
  items.push({
    kind: 'user',
    id: 'u-init',
    text: 'Draft the §5.3.5.1.4 Integrated Safety Summary from the three CSRs. Surface any weak support before drafting.',
    meta: '3 docs attached'
  });
  // Walk the reasoning entries; emit agent narration where mapped, tool calls otherwise
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
  // Inject review cards at the right states (after the narrative for that step)
  const insertReviewAfter = (afterStep: string, card: ChatItem) => {
    // find last item in that step
    const lastDividerIdx = items.findIndex(
      (i) =>
      i.kind === 'divider' &&
      (i as any).label.toLowerCase().includes(afterStep)
    );
    if (lastDividerIdx === -1) {
      items.push(card);
      return;
    }
    // find next divider after that
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
      // user-side echo of review
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
      <aside className="w-[400px] border-l border-zinc-200 bg-zinc-50/50 p-6 flex flex-col items-center justify-center text-center shrink-0">
        <ActivityIcon className="w-8 h-8 text-zinc-300 mb-4" />
        <h3 className="text-sm font-medium text-zinc-900">No active task</h3>
        <p className="text-xs text-zinc-500 mt-1">
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
  const meta = stateMeta(task.state);
  return (
    <aside className="w-[400px] border-l border-zinc-200 bg-zinc-50/40 flex flex-col h-full overflow-hidden shrink-0 z-10">
      {/* Top bar */}
      <div className="px-3 py-2.5 border-b border-zinc-200 bg-white flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-zinc-900 leading-none">
              Peer Copilot
            </div>
            <div
              className="text-[10px] text-zinc-500 mt-0.5 truncate"
              title={task.name}>
              
              {task.target_section} · {formatElapsed(task.started_at)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <StatusPill label={meta.label} tone={meta.tone} />
          <button
            className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
            title="New chat">
            
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
            title="More">
            
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-zinc-200 bg-white px-2 shrink-0">
        <TabButton
          active={tab === 'chat'}
          onClick={() => setTab('chat')}
          icon={<ActivityIcon className="w-3.5 h-3.5" />}
          label="Chat"
          streaming={isStreaming} />
        
        <TabButton
          active={tab === 'alerts'}
          onClick={() => setTab('alerts')}
          icon={<Bell className="w-3.5 h-3.5" />}
          label="Alerts"
          count={activeBanners.length}
          tone={activeBanners.length > 0 ? 'amber' : 'zinc'} />
        
        {/* Mini stepper inline on the right */}
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
                className={`w-5 h-1.5 rounded-full transition-colors ${status === 'complete' ? 'bg-blue-600' : status === 'current' ? 'bg-blue-300' : 'bg-zinc-200'}`} />);


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
/* TabButton                                                                  */
/* ========================================================================== */
const TabButton = ({
  active,
  onClick,
  icon,
  label,
  count,
  streaming,
  tone = 'zinc'








}: {active: boolean;onClick: () => void;icon: React.ReactNode;label: string;count?: number;streaming?: boolean;tone?: 'zinc' | 'amber';}) =>
<button
  onClick={onClick}
  className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px ${active ? 'text-zinc-900 border-zinc-900' : 'text-zinc-500 border-transparent hover:text-zinc-700'}`}>
  
    {icon}
    {label}
    {streaming &&
  <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
      </span>
  }
    {count !== undefined && count > 0 &&
  <span
    className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold tabular-nums ${tone === 'amber' ? 'bg-amber-500 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
    
        {count}
      </span>
  }
  </button>;

/* ========================================================================== */
/* Chat thread                                                                */
/* ========================================================================== */
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
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
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
      <div className="flex items-center gap-2 text-xs text-zinc-500 italic pl-1">
          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          <span>Generating</span>
          <span className="inline-block w-1.5 h-3 bg-zinc-400 animate-pulse" />
        </div>
      }
    </div>);

};
/* ========================================================================== */
/* Chat message components                                                    */
/* ========================================================================== */
const Divider = ({ label }: {label: string;}) =>
<div className="flex items-center gap-2 py-1">
    <div className="flex-1 h-px bg-zinc-200" />
    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">
      {label}
    </span>
    <div className="flex-1 h-px bg-zinc-200" />
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
  
    <div className="max-w-[88%] bg-zinc-900 text-white rounded-lg rounded-tr-sm px-3 py-2 shadow-sm">
      <p className="text-xs leading-relaxed">{text}</p>
      {meta &&
    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-300">
          <AtSign className="w-2.5 h-2.5" />
          <span>{meta}</span>
        </div>
    }
    </div>
  </motion.div>;

const renderMarkdown = (text: string) => {
  // Tiny markdown: **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
    return (
      <strong key={i} className="font-semibold text-zinc-900">
          {p.slice(2, -2)}
        </strong>);

    if (p.startsWith('`') && p.endsWith('`'))
    return (
      <code
        key={i}
        className="px-1 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[11px]">
        
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
  
    <p className="text-xs text-zinc-700 leading-relaxed">
      {renderMarkdown(text)}
    </p>
    <div className="text-[9px] text-zinc-400 font-mono mt-1">
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
  status,
  result,
  timestamp











}: {tool: string;target: string;summary: string;detail?: string;status: 'running' | 'complete' | 'warning' | 'error';result?: {label: string;value: string;}[];timestamp: string;}) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = TOOL_ICONS[tool] || Wrench;
  const statusConfig = {
    running: {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500 animate-pulse',
      label: 'Running'
    },
    complete: {
      color: 'bg-zinc-50 text-zinc-600 border-zinc-200',
      dot: 'bg-emerald-500',
      label: 'Done'
    },
    warning: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Flagged'
    },
    error: {
      color: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
      label: 'Error'
    }
  }[status];
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
      className="bg-white border border-zinc-200 rounded-md overflow-hidden hover:border-zinc-300 transition-colors">
      
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left group">
        
        <Icon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        <code className="text-[11px] font-mono text-zinc-900 font-semibold">
          {tool}
        </code>
        <span className="text-[11px] text-zinc-400 font-mono truncate flex-1 min-w-0">
          {target}
        </span>
        <div
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${statusConfig.color}`}>
          
          <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
          {statusConfig.label}
        </div>
        {expanded ?
        <ChevronUp className="w-3 h-3 text-zinc-400" /> :

        <ChevronDown className="w-3 h-3 text-zinc-400" />
        }
      </button>
      {expanded &&
      <div className="border-t border-zinc-100 px-2.5 py-2 bg-zinc-50/50 space-y-1.5">
          {detail &&
        <p className="text-[11px] text-zinc-700 leading-relaxed">
              {detail}
            </p>
        }
          {result &&
        <div className="flex flex-wrap gap-1.5 mt-1">
              {result.map((r) =>
          <span
            key={r.label}
            className="inline-flex items-center gap-1 text-[10px] font-mono bg-white border border-zinc-200 rounded px-1.5 py-0.5">
            
                  <span className="text-zinc-400">{r.label}=</span>
                  <span className="text-zinc-900 font-semibold">{r.value}</span>
                </span>
          )}
            </div>
        }
          <div className="text-[9px] text-zinc-400 font-mono">
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
      className={`bg-white border rounded-lg overflow-hidden shadow-sm ${urgent ? 'border-amber-300 ring-2 ring-amber-100' : completed ? 'border-emerald-200' : 'border-zinc-200'}`}>
      
      <div className="px-3 py-3 flex items-start gap-3">
        <div
          className={`p-2 rounded-md shrink-0 ${urgent ? 'bg-amber-50 text-amber-600' : completed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-zinc-900">{title}</h4>
            {urgent &&
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            }
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="border-t border-zinc-100 px-3 py-2 bg-zinc-50/40 flex items-center justify-end">
        <Button
          variant={urgent ? 'primary' : 'outline'}
          className="h-7 px-2.5 text-xs"
          onClick={() => navigate(to)}>
          
          {actionLabel} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </div>
    </motion.div>);

};
/* ========================================================================== */
/* Alerts list                                                                */
/* ========================================================================== */
const AlertsList = ({ banners }: {banners: Banner[];}) => {
  const navigate = useNavigate();
  const { removeBanner } = useTaskStore();
  if (banners.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900">No alerts</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-[220px]">
          The agent is working in the background. You'll be pinged here when
          your input is needed.
        </p>
      </div>);

  }
  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
      {banners.map((banner) => {
        const iconMap = {
          info: {
            Icon: Bell,
            color: 'text-blue-600 bg-blue-50'
          },
          warning: {
            Icon: AlertTriangle,
            color: 'text-amber-600 bg-amber-50'
          },
          critical: {
            Icon: ShieldAlert,
            color: 'text-red-600 bg-red-50'
          }
        } as const;
        const { Icon, color } = iconMap[banner.urgency];
        const borderColor =
        banner.urgency === 'critical' ?
        'border-red-200' :
        banner.urgency === 'warning' ?
        'border-amber-200' :
        'border-blue-200';
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
            className={`bg-white border ${borderColor} rounded-lg p-3 shadow-sm`}>
            
            <div className="flex items-start gap-2.5 mb-2.5">
              <div className={`p-1.5 rounded-md shrink-0 ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {banner.urgency === 'critical' ?
                    'Action required' :
                    banner.urgency === 'warning' ?
                    'Review needed' :
                    'Update'}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    just now
                  </span>
                </div>
                <p className="text-xs text-zinc-900 font-medium leading-snug mt-1">
                  {banner.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => removeBanner(banner.id)}
                className="text-[11px] font-medium text-zinc-500 hover:text-zinc-700 px-2 py-1">
                
                Dismiss
              </button>
              <Button
                variant="primary"
                className="h-7 px-2.5 text-xs"
                onClick={() => navigate(banner.linkTarget)}>
                
                Open
              </Button>
            </div>
          </motion.div>);

      })}
    </div>);

};
/* ========================================================================== */
/* Composer (Cursor-like)                                                     */
/* ========================================================================== */
const Composer = ({ taskState }: {taskState: TaskState;}) => {
  const [value, setValue] = useState('');
  const suggestions = (() => {
    if (taskState === 'awaiting_evidence_review')
    return [
    'Why is Study 196 §9.4 low confidence?',
    'Show me the conflicting passages',
    'Re-run with stricter threshold'];

    if (taskState === 'draft_ready')
    return [
    'Why is sentence 4 amber?',
    'Show source for sentence 7',
    'Rewrite in passive voice'];

    if (taskState === 'awaiting_gap_review')
    return [
    'Cite the FDA guidance',
    'Downgrade gap 3 to dismissed',
    'What would resolve the critical gap?'];

    if (taskState === 'awaiting_action_approval')
    return [
    'Reassign all to Marcus',
    'Set urgency by submission date',
    'Why this owner?'];

    return ['Summarize progress', 'What needs my attention?'];
  })();
  return (
    <div className="border-t border-zinc-200 bg-white p-2.5 shrink-0">
      {/* Context chips */}
      <div className="flex items-center gap-1 mb-1.5 overflow-x-auto">
        <button className="inline-flex items-center gap-1 text-[10px] font-mono bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded shrink-0">
          <AtSign className="w-2.5 h-2.5" /> §5.3.5.1
        </button>
        <button className="inline-flex items-center gap-1 text-[10px] font-mono bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded shrink-0">
          <AtSign className="w-2.5 h-2.5" /> Study 204 CSR
        </button>
        <button className="inline-flex items-center gap-1 text-[10px] font-mono bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded shrink-0">
          <Plus className="w-2.5 h-2.5" /> Add context
        </button>
      </div>

      <div className="flex items-end gap-2 bg-zinc-50 rounded-lg border border-zinc-200 focus-within:border-blue-400 focus-within:bg-white transition-colors p-1.5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask the agent or refine scope…"
          rows={1}
          className="flex-1 bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 outline-none resize-none px-1.5 py-1.5 max-h-24" />
        
        <button
          className={`p-1.5 rounded-md transition-colors shrink-0 ${value.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
          disabled={!value.trim()}
          aria-label="Send message">
          
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested prompts */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        {suggestions.map((s) =>
        <button
          key={s}
          onClick={() => setValue(s)}
          className="text-[10px] text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5">
          
            {s}
          </button>
        )}
      </div>
    </div>);

};