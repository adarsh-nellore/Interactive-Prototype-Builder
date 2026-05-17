# Peer AI — Regulatory Task Delegation PRD

| Field | Value |
|---|---|
| **Product** | Peer AI — Multi-Step Agent Task Delegation |
| **Feature area** | Task Monitor · Evidence Review · Draft Review · Action Approval |
| **Version** | 1.0 — MVP |
| **Status** | Ready for implementation |
| **Primary persona** | Dr. Priya Menon, Regulatory Affairs Lead (NDA/BLA submissions) |
| **Document purpose** | Full Claude Code-ready spec for the launch, monitor, and supervise experience for long-running AI tasks |
| **Output use** | Direct Claude Code / Cursor implementation input |

---

## Section 1: Background and context

Peer AI is a regulatory intelligence platform used in biopharma NDA and BLA submission workflows. It allows regulatory affairs teams to work with large volumes of CTD source documents (clinical study reports, preclinical summaries, safety narratives, etc.).

This PRD adds the multi-step agent task delegation experience: a regulatory lead can configure and launch a complex AI task — evidence extraction, section drafting, gap analysis, and follow-up action generation — delegate it to the Peer AI agent, monitor its progress without interruption, and review its outputs with the confidence to act on them.

**Explicitly OUT of scope for v1:**
- Direct DMS (document management system) write integration
- Sonia's VP-level oversight dashboard
- Cross-task submission readiness view
- External push notifications (email, mobile)
- Regulatory strategy profiling (personalizing gap severity thresholds per user)
- Historical reasoning trail audit log for compliance reporting

---

## Section 2: Problem statement

Regulatory leads at biopharma companies need to delegate complex, multi-step evidence and drafting tasks to AI — but the current experience is opaque: once a task is launched, users cannot tell whether the agent is still running, has stalled, is waiting for their input, or has produced partial output that already requires review. They have no visibility into the agent's reasoning, no unambiguous signal for when their judgment is needed versus when they should stay hands-off, and no way to scan output confidence before investing review time. As a result, expert users refuse to delegate tasks they cannot supervise, defeating the productivity promise of AI-assisted regulatory work.

---

## Section 3: Product goal

After using Peer AI's task delegation experience, a regulatory lead should be able to answer:

1. What is the agent doing right now, and how far along is it?
2. Does the agent need something from me, or should I leave it running?
3. How did the agent reach these evidence selections and draft conclusions?
4. Which parts of the output need my close attention, and which are well-supported?
5. What follow-up actions has the agent recommended, and do I agree?

---

## Section 4: Success criteria

**User outcomes:**
- Priya can delegate a multi-step regulatory task and return to other work without anxiety about missing a blocking input
- Priya can review agent outputs in under 20 minutes for a task that would have taken 2+ hours manually
- Priya never has to manually verify a claim the agent has already sourced and confidence-annotated
- Priya never misses an agent input window because she didn't see the notification

**Product outcomes:**
- Task delegation completion rate: ≥80% of launched tasks reach "Complete" state (not cancelled or abandoned)
- Median Priya-attention time per task: <25 minutes (excluding configuration)
- Agent escalation rate: ≤1 non-upfront escalation per task on average
- Evidence verification override rate: <15% (proxy for agent evidence quality)

---

## Section 5: Non-goals

- The agent does not write directly to any DMS or submission system without explicit user commit
- The agent does not assign action items to team members without Priya's approval
- The agent does not suppress identified gaps, even low-severity ones
- The agent does not present any output as "final" or "approved"
- The experience does not require Priya to monitor a dedicated screen — it must work from the workspace periphery
- The system does not send push notifications outside the Peer AI app in v1
- The system does not support concurrent multi-user editing of agent outputs in v1

---

## Section 6: Personas

### Primary — Dr. Priya Menon, Regulatory Affairs Lead

| Field | Value |
|---|---|
| **Role** | Regulatory Affairs Lead, NDA/BLA Submissions, mid-size biopharma |
| **Core accountability** | Scientific integrity and regulatory defensibility of every claim in a submission |
| **Not responsible for** | Running statistical analyses, managing the DMS, coordinating medical writing headcount |
| **AI relationship** | Pragmatist tilting toward power user — trusts AI exactly as far as she can verify it. Will spot a hallucinated citation. |
| **Success** | Delegates a complex task, reviews agent output in 18 focused minutes, approves actions, moves to next workstream |
| **Failure** | A gap the agent didn't flag reaches an FDA reviewer. Or she stops delegating because the experience feels less trustworthy than doing it herself. |

### Secondary 1 — Marcus, Senior Medical Writer

Role: Executes sections Priya delegates. Primary need: understand which agent outputs are settled vs. flagged so he knows where to invest editing time and where to wait for direction.

### Secondary 2 — Sonia, VP Regulatory Affairs

Role: Priya's manager. Primary need: submission readiness visibility at the workstream level. Concern: is AI usage introducing regulatory risk she doesn't know about?

---

## Section 7: Design principles

1. **Legibility without interruption.** The agent always communicates its state and reasoning — but never demands attention unless human input is truly necessary. Informing and demanding are different UX modes.

2. **Transparent reasoning, not just outputs.** Every claim, evidence selection, and gap flag is traceable to a specific passage in a specific document. The reasoning trail is a first-class feature, not a debug log.

3. **Confidence gradients drive review efficiency.** Output is never undifferentiated. Well-supported content and low-confidence content look different. Priya reads selectively, not exhaustively.

4. **The agent escalates sparingly and precisely.** Escalations carry context: what specifically is needed, why the agent cannot proceed without it, and what the cost of delay is. Trivial questions are never surfaced.

5. **Human approval gates all consequential writes.** No output is committed to a document, tracker, or assigned to a person without Priya's explicit approval. The agent proposes; the expert decides.

6. **Peripheral presence, not a new workflow.** The task monitor lives in the sidebar. Banner notifications appear at the top of the app and link directly to the relevant input modal. Priya is never required to navigate away from her current work to supervise the agent.

---

## Section 8: Information architecture

### Top-level navigation

| Section | Purpose |
|---|---|
| Workspace | Primary document and drafting area — Priya's main working context |
| Task Monitor (sidebar) | Persistent side panel showing active task state, step progress, and reasoning trail |
| Task Launcher (modal) | Configuration modal for new delegated tasks |
| Review Modals | Context-specific input modals triggered by agent escalations |
| Task Archive | Historical view of completed and cancelled tasks with full reasoning trails |

### Key system objects

| Object | Description |
|---|---|
| Task | The delegated work unit — scope, state, steps, sub-outputs, escalation log |
| Source document | An ingested CTD module or study report with structural metadata |
| Evidence item | A passage-level extraction with source coordinates, confidence score, and acceptance status |
| Draft section | A versioned text object annotated at sentence level with evidence IDs and confidence scores |
| Gap item | An identified weakness in evidence support, with severity and regulatory basis |
| Action item | A gap-derived follow-up task with severity, recommended owner, and resolution path |
| Reasoning entry | A single step in the agent's real-time reasoning trail, timestamped and linked to agent action |

---

## Section 9: Core screens

### 1. Workspace (primary)

**Purpose:** Priya's main document and drafting environment. The agent monitor lives here in the sidebar — she never leaves this context to supervise a task.

**Key modules:**
- Document editor / viewer panel (full width when sidebar is collapsed)
- Task Monitor sidebar (collapsible, docked to right)
- Banner notification bar (top of screen, above editor, dismissible)
- Sidebar toggle button

### 2. Task Launcher (modal, triggered from workspace)

**Purpose:** Configure a new delegated task before launch. Priya specifies scope and confirms the agent's interpretation in one view.

**Key modules:**
- Task name input
- Target CTD section selector
- Source document multi-select (from document store)
- Optional: style guide selector
- Scope confirmation card (agent's plain-English restatement of the task for Priya to approve)
- Launch / Cancel buttons

### 3. Task Monitor (sidebar panel)

**Purpose:** Persistent at-a-glance view of the running task. Always visible without interrupting Priya's primary work.

**Key modules:**
- Task state badge (color-coded: running / awaiting input / stalled / complete)
- Step progress stepper (4 steps: Evidence · Draft · Gaps · Actions)
- Live streaming reasoning trail (scrollable log, newest entry at bottom)
- Sub-output availability indicators (evidence table, draft section, gap list available for review)
- Task elapsed time

### 4. Evidence Review modal

**Purpose:** Priya reviews and accepts/rejects extracted evidence before drafting begins. Triggered by "Awaiting evidence review" state.

**Key modules:**
- Evidence table (source doc, passage excerpt, page ref, confidence badge, accept/reject toggle per row)
- Filter/sort by confidence level
- Conflict alert banner (if source contradiction detected)
- Confirm and continue button

### 5. Conflict Resolution modal

**Purpose:** Specific escalation modal when agent detects a contradicting source — a true blocking input.

**Key modules:**
- Contradiction display (two passages side by side with source labels)
- Priya's resolution options (prefer source A / prefer source B / flag for manual review)
- Rationale text input (optional)
- Confirm button

### 6. Draft Review panel (inline in sidebar, or full-screen expand)

**Purpose:** Review the drafted section with inline confidence annotations. Available incrementally as soon as draft completes.

**Key modules:**
- Annotated draft text (amber underline for low-confidence sentences)
- Hover tooltip on underlined text: evidence gap explanation + source link
- Accept sentence / Flag sentence / Edit inline actions
- Evidence source sidebar (click sentence → highlights supporting evidence item)

### 7. Gap Review modal

**Purpose:** Priya reviews identified gaps and adjusts severity before action generation.

**Key modules:**
- Gap list (claim, gap description, severity badge: Critical / Notable / Minor, regulatory basis note)
- Severity override control per gap
- Batch acknowledge (for Minor gaps)
- Confirm and generate actions button

### 8. Action Approval modal

**Purpose:** Priya reviews and approves agent-generated action items before they are committed to the tracker.

**Key modules:**
- Action item list (gap description, resolution path, recommended owner, urgency)
- Per-item: edit owner / urgency / dismiss
- Batch approve button (for routine items)
- Commit to tracker button

### 9. Task Archive

**Purpose:** Historical record of completed and cancelled tasks with full reasoning trails.

**Key modules:**
- Task list with status, date, section name
- Per-task: full reasoning trail, all sub-outputs, action items committed
- Export reasoning trail (for compliance review)

---

## Section 10: User stories

### Priya (Regulatory Affairs Lead)

1. As Priya, I want to see a plain-English restatement of my task before launch so that I can catch misalignments in scope without writing a detailed prompt.
2. As Priya, I want the task monitor to show me exactly which step is running and what the agent is reasoning through so that I can trust it's on track without watching it.
3. As Priya, I want a banner notification to appear when the agent needs my input, with a direct link to the relevant modal, so that I can respond without losing my place in my current document.
4. As Priya, I want evidence items to be confidence-tagged so that I can accept well-supported evidence quickly and scrutinize low-confidence items only.
5. As Priya, I want low-confidence sentences in the draft to be visually distinguished with an amber underline so that I can review only the parts that need my attention.
6. As Priya, I want the agent to never ask me a question it could resolve with standard regulatory practice so that I stay in deep work and only surface when my judgment is truly needed.
7. As Priya, I want to batch-approve routine action items and individually review critical ones so that approving follow-up actions doesn't become a bottleneck.
8. As Priya, I want completed sub-outputs to appear in the task monitor as soon as they're ready so that I can begin reviewing evidence while drafting is still in progress.

### Marcus (Senior Medical Writer)

1. As Marcus, I want to see which sentences in the draft have been accepted by Priya and which are still flagged so that I know where to invest my editing time.
2. As Marcus, I want to see the evidence sources behind each draft sentence so that I can understand the agent's intent when I'm editing.
3. As Marcus, I want action items assigned to me to arrive with a link to the specific gap they address so that I can act immediately without re-reading the full gap analysis.

---

## Section 11: Functional requirements

### State model

| State | Description | Requires Priya input | Terminal? |
|---|---|---|---|
| Configuring | Task being set up in launcher modal | Yes | No |
| Scope confirmed | Launch confirmed, task queued | No | No |
| Extracting evidence | Agent scanning and extracting source passages | No | No |
| Awaiting evidence review | Evidence table ready; agent paused | Yes | No |
| Awaiting conflict resolution | Source contradiction detected; agent blocked | Yes | No |
| Drafting section | Agent producing annotated draft | No | No |
| Running gap analysis | Agent evaluating claim support quality | No | No |
| Awaiting gap review | Gap list ready; agent paused | Yes | No |
| Generating actions | Agent producing action item candidates | No | No |
| Awaiting action approval | Action list ready; agent paused | Yes | No |
| Stalled | Agent heartbeat lost; no agent activity | No | No |
| Complete | All outputs produced and approved | No | Yes |
| Cancelled | Task terminated by user; outputs preserved | No | Yes |

### Confidence model

| Level | Label | UI treatment |
|---|---|---|
| High | Supported | No annotation. Normal text. |
| Medium | Partial | Light gray dot indicator. |
| Low | Weak | Amber underline on draft sentences. Amber badge on evidence items. |
| Unverified | Outside scope | Orange badge. Shown if agent searched outside designated docs. |
| Conflicted | Contradicted | Red badge. Triggers escalation to Conflict Resolution modal. |

### Notification rules

| Trigger | Recipient | Channel | Message |
|---|---|---|---|
| Task enters "Awaiting evidence review" | Priya | In-app banner | "Evidence table is ready — review before drafting begins." + link to modal |
| Task enters "Awaiting conflict resolution" | Priya | In-app banner (urgent) | "Source conflict detected — your input is required to continue." + link |
| Task enters "Awaiting gap review" | Priya | In-app banner | "Gap analysis complete — review before actions are generated." + link |
| Task enters "Awaiting action approval" | Priya | In-app banner | "Action items ready for your approval." + link |
| Task enters "Stalled" | Priya | In-app banner (warning) | "Task has stalled — retry or cancel." + link |
| "Awaiting" state persists >30 min | Priya | In-app banner (re-ping) | "[Task name] is still waiting for your input." + link |

Banner is dismissible. Dismissed banners leave a persistent indicator dot on the sidebar task monitor icon.

### Permission model

| Action | Priya | Marcus | Sonia |
|---|---|---|---|
| Configure and launch tasks | ✓ | — | — |
| View task monitor and reasoning trail | ✓ | Read-only (if granted) | — |
| Accept/reject evidence items | ✓ | — | — |
| Resolve source conflicts | ✓ | — | — |
| Review and annotate draft | ✓ | ✓ (editing) | — |
| Adjust gap severity | ✓ | — | — |
| Approve action items | ✓ | — | — |
| Assign action items | ✓ | — | — |
| View task archive | ✓ | Read-only (own tasks) | Read-only (all) |
| Set reasoning trail visibility | ✓ | — | — |

---

## Section 12: Feature specs

### Feature 1: Task configuration and scope confirmation

**Description:** Priya configures the task (target section, source documents, optional style guide) and sees a plain-English scope confirmation card before launch. The agent generates the confirmation; Priya approves or edits.

**User actions:** Select target CTD section → select source documents → (optionally) select style guide → review scope card → approve or edit → launch

**Agent actions:** On form completion, generate scope confirmation card (task restated in plain language: "I will extract evidence for Section 5.3.5.1 from the three selected CSRs, draft the summary, identify weak support, and generate follow-up actions.") → await launch confirmation

**Tech scope:** Task record created on launch. Scope card generated via LLM call with task parameters. No document scanning at this stage.

**Failure states:**
- No source documents selected → Launch button disabled with inline message
- Scope card generation fails → Show fallback confirmation with raw parameters listed; allow launch
- User edits scope card → Edited version saved as task description; not re-sent to agent

**Risk mitigation:** Scope card is confirmatory, not locked — Priya can cancel and reconfigure at any point before launch.

---

### Feature 2: Real-time reasoning trail

**Description:** From task launch through completion, the agent streams a plain-language reasoning log in the sidebar task monitor. Every reasoning entry is timestamped and linked to the agent action it explains.

**User actions:** Read reasoning trail passively. Can expand/collapse individual entries. Can export full trail.

**Agent actions:** Emit reasoning entries as streaming text at each decision point: document selected, passage extracted, evidence scored, draft sentence composed, gap identified, action generated.

**Tech scope:** Streaming text via SSE (server-sent events) or WebSocket. Each reasoning entry stored as a `ReasoningEntry` record. Trail rendered in reverse-chronological order with auto-scroll to newest entry. Sidebar renders incrementally as entries arrive.

**Failure states:**
- Stream connection drops → "Reasoning trail paused — reconnecting" indicator. On reconnect, fetch missed entries.
- Agent produces no reasoning entries for >90s → Stalled state triggered.

---

### Feature 3: Evidence extraction and review

**Description:** Agent scans designated source documents, extracts relevant passages, scores them by confidence, and presents them in a structured review table. Priya accepts/rejects before drafting begins.

**User actions:** Open evidence review modal (from banner or sidebar) → scan table → filter by confidence → accept/reject individual items → optionally reclassify confidence level → confirm table

**Agent actions:** For each designated source document: retrieve document from store → scan for passages relevant to target section → extract passage with coordinates (doc ID, section, page, paragraph) → score confidence (High/Medium/Low) → detect contradictions across sources → surface evidence table

**Tech scope:** Document scan via LLM with source document context. Evidence items stored as `EvidenceItem` records. Confidence scoring via prompt-based rubric. Contradiction detection: semantic comparison of passages making the same claim with conflicting values.

**Failure states:**
- Passage extraction returns no relevant results for a claim → EvidenceItem with `confidence: null`, `no_support: true` created. Surfaced in review table with "No support found" label.
- Agent searches outside designated docs → EvidenceItem marked `source_type: unverified`. Disclosed in table with amber "Unverified" badge.
- Source contradiction detected (severity: blocking) → Task transitions to "Awaiting conflict resolution." Non-blocking contradictions are shown in the evidence table with a "Conflicted" badge without halting the task.

---

### Feature 4: Section drafting with confidence annotation

**Description:** Agent drafts the target section using only accepted evidence items. Every sentence is annotated with the evidence item ID that supports it and a per-sentence confidence score.

**User actions:** Read draft in sidebar draft review panel. Hover amber-underlined sentences for gap tooltip. Accept sentence (removes amber) / Flag sentence / Edit inline. Expand to full-screen review if needed.

**Agent actions:** For each claim in the target section: retrieve matching accepted evidence items → compose sentence grounded in evidence → assign confidence score based on evidence quality → annotate sentence with evidence_item_id and confidence → emit sentence to streaming draft

**Tech scope:** Draft generated sentence-by-sentence via LLM. Each sentence stored with `sentence_id`, `evidence_item_id[]`, `confidence` in `DraftSection.sentences[]`. Amber underline applied client-side to sentences with `confidence: low`. Hover tooltip fetches gap explanation from sentence metadata.

**Failure states:**
- Agent cannot compose a sentence without evidence → Placeholder node inserted: `[CLAIM NOT SUPPORTED: brief description]`. Never generates unsourced content.
- Draft generation interrupted mid-section → Partial draft available in sidebar immediately. Task resumes or user can cancel.

---

### Feature 5: Gap analysis

**Description:** Agent runs a gap pass on the completed draft: identifies claims with weak single-source support, indirect sources, or evidence below typical FDA expectations for this section type. Each gap receives a severity label with regulatory basis disclosed.

**User actions:** Open gap review modal → read gap list → adjust severity per gap (upgrade/downgrade) → batch-acknowledge Minor gaps → confirm gap list

**Agent actions:** For each draft sentence: evaluate evidence quality → assess against regulatory expectation baseline for section type → generate gap item if support is weak → assign severity (Critical / Notable / Minor) → disclose knowledge basis ("Based on FDA draft guidance for [section type], as of [date]")

**Tech scope:** Gap analysis via LLM call with draft + evidence table context. GapItem records created. Severity override stored on GapItem. Knowledge basis note required on every severity assignment.

**Failure states:**
- Agent uncertain about regulatory expectations for a niche claim → GapItem created with `severity: notable`, `uncertainty_flag: true`. Note: "Regulatory expectation uncertain — verify against current guidance."
- Gap analysis returns zero gaps → Show empty state: "No gaps identified. Verify this reflects the scope of your review before proceeding."

---

### Feature 6: Action item generation and approval

**Description:** Agent converts each confirmed gap into a structured action item. Priya reviews and approves before items are committed to the tracker.

**User actions:** Open action approval modal → review action list → per item: edit owner / urgency / dismiss → batch-approve routine items → commit to tracker

**Agent actions:** For each confirmed GapItem: generate ActionItem with gap description, resolution path suggestion, recommended owner, urgency relative to submission timeline → present as pending approval

**Tech scope:** ActionItem records created with `status: pending_approval`. On Priya's commit, status transitions to `committed` and action items written to tracker integration (mocked in v1). Owner field editable before commit.

**Failure states:**
- Agent cannot determine appropriate owner or urgency → Field left blank, flagged for Priya's input before item can be approved.
- Tracker write fails (v1: mock) → Action items saved locally with `committed: false`, shown in retry queue.

---

### Feature 7: Stall detection and recovery

**Description:** System monitors agent heartbeat. If no activity for 90 seconds in an active state, task enters "Stalled" state. Priya is notified. Completed sub-outputs are preserved. Retry resumes from last completed checkpoint.

**User actions:** See stall notification banner → open task monitor → choose retry or cancel

**Agent actions (system):** Heartbeat monitor fires every 30s. On timeout, emit stall event → transition task state → preserve all sub-outputs → notify Priya

**Tech scope:** Server-side heartbeat monitor. Retry re-queues task from last committed checkpoint. All sub-outputs stored incrementally; no partial data loss on stall.

---

## Section 13: Component inventory

| Component | Type | Props / Inputs | Actions emitted | Screen(s) |
|---|---|---|---|---|
| TaskMonitorSidebar | sidebar | taskId: uuid, isCollapsed: boolean | onToggle, onSubOutputClick | Workspace |
| TaskStateBadge | badge | state: enum(task_state), elapsedMs: integer | — | TaskMonitorSidebar |
| StepProgressStepper | stepper | steps: Step[], currentStep: integer, statePerStep: enum | — | TaskMonitorSidebar |
| ReasoningTrail | timeline | entries: ReasoningEntry[], isStreaming: boolean | onEntryExpand | TaskMonitorSidebar |
| ReasoningEntry | card | id: uuid, timestamp: timestamp, text: string, linkedAction: string, isExpanded: boolean | onExpand | ReasoningTrail |
| SubOutputAvailability | card | subOutputs: SubOutputStatus[], onReviewClick | onReviewClick | TaskMonitorSidebar |
| BannerNotification | toast | message: string, urgency: enum(info, warning, critical), taskId: uuid, modalTarget: string | onDismiss, onNavigate | Workspace (top) |
| TaskLauncherModal | modal | — | onLaunch, onCancel | Workspace |
| SectionSelector | input | sections: CTDSection[], selected: CTDSection | onSelect | TaskLauncherModal |
| DocumentMultiSelect | input | documents: SourceDocument[], selected: SourceDocument[] | onSelect | TaskLauncherModal |
| ScopeConfirmationCard | card | agentRestatement: string, isEditable: boolean | onConfirm, onEdit, onCancel | TaskLauncherModal |
| EvidenceReviewModal | modal | taskId: uuid, evidenceItems: EvidenceItem[] | onConfirm, onCancel | Workspace (triggered) |
| EvidenceTable | table | items: EvidenceItem[], filters: ConfidenceLevel[] | onAccept, onReject, onReclassify | EvidenceReviewModal |
| EvidenceItemRow | table row | item: EvidenceItem | onAccept, onReject, onReclassify | EvidenceTable |
| ConfidenceBadge | badge | level: enum(high, medium, low, unverified, conflicted) | — | EvidenceItemRow, DraftSentence |
| ConflictResolutionModal | modal | conflictId: uuid, passageA: EvidenceItem, passageB: EvidenceItem | onResolve, onFlagManual | Workspace (triggered) |
| DraftReviewPanel | panel | taskId: uuid, draft: DraftSection, isFullScreen: boolean | onAcceptSentence, onFlagSentence, onEditSentence, onToggleFullScreen | TaskMonitorSidebar / Workspace |
| DraftSentence | card | sentence: Sentence, evidenceItem: EvidenceItem, confidence: ConfidenceLevel | onAccept, onFlag, onEdit, onHover | DraftReviewPanel |
| GapTooltip | tooltip | gapExplanation: string, evidenceItemId: uuid | — | DraftSentence (on hover) |
| GapReviewModal | modal | taskId: uuid, gaps: GapItem[] | onConfirm, onAdjustSeverity, onBatchAcknowledge | Workspace (triggered) |
| GapItemRow | table row | item: GapItem, severityOptions: GapSeverity[] | onAdjustSeverity, onAcknowledge | GapReviewModal |
| ActionApprovalModal | modal | taskId: uuid, actions: ActionItem[] | onApprove, onEdit, onDismiss, onBatchApprove, onCommit | Workspace (triggered) |
| ActionItemRow | card | item: ActionItem | onEditOwner, onEditUrgency, onApprove, onDismiss | ActionApprovalModal |
| TaskArchivePage | page | — | onSelectTask | Top-level nav |
| TaskArchiveList | table | tasks: Task[], filters | onSelectTask | TaskArchivePage |
| TaskArchiveDetail | panel | task: Task, reasoningTrail: ReasoningEntry[], subOutputs | onExportTrail | TaskArchivePage |

---

## Section 14: Data schema

### Task

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| name | string | yes | — | User-defined task label |
| created_by | uuid (FK → User) | yes | — | Priya's user ID |
| target_section | string | yes | — | CTD section identifier (e.g. "5.3.5.1") |
| source_document_ids | uuid[] (FK → SourceDocument) | yes | [] | Designated source docs |
| style_guide_id | uuid (FK → SourceDocument) | no | null | Optional style guide |
| state | enum(configuring, scope_confirmed, extracting_evidence, awaiting_evidence_review, awaiting_conflict_resolution, drafting_section, running_gap_analysis, awaiting_gap_review, generating_actions, awaiting_action_approval, stalled, complete, cancelled) | yes | configuring | Current task state |
| scope_confirmation_text | text | no | null | Agent-generated restatement of task scope |
| reasoning_visibility | enum(priya_only, team) | yes | priya_only | Who can see the reasoning trail |
| started_at | timestamp | no | null | When task left scope_confirmed state |
| completed_at | timestamp | no | null | When task reached complete state |
| stall_count | integer | yes | 0 | Number of stall events |
| created_at | timestamp | yes | now | Record creation time |

### SourceDocument

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| name | string | yes | — | Display name (e.g. "Study 101 CSR") |
| document_type | enum(ctd_module, clinical_study_report, preclinical_summary, safety_narrative, style_guide, other) | yes | — | Document category |
| ctd_section | string | no | null | CTD section reference if applicable |
| ingested_at | timestamp | yes | — | When document entered the store |
| page_count | integer | no | null | Total pages |
| is_active | boolean | yes | true | Whether doc is available for task selection |

### EvidenceItem

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| task_id | uuid (FK → Task) | yes | — | Parent task |
| source_document_id | uuid (FK → SourceDocument) | yes | — | Source of extraction |
| passage_text | text | yes | — | Extracted passage content |
| page_number | integer | no | null | Page in source document |
| section_ref | string | no | null | Section identifier within source doc |
| paragraph_index | integer | no | null | Paragraph position within section |
| confidence | enum(high, medium, low, unverified, conflicted) | yes | — | Agent confidence in relevance |
| no_support | boolean | yes | false | True if no relevant passage found |
| source_type | enum(designated, outside_scope) | yes | designated | Whether source was in designated docs |
| acceptance_status | enum(pending, accepted, rejected) | yes | pending | Priya's review decision |
| conflict_id | uuid (FK → ConflictRecord) | no | null | Link to conflict if conflicted |
| created_at | timestamp | yes | now | — |

### ConflictRecord

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| task_id | uuid (FK → Task) | yes | — | — |
| evidence_item_a_id | uuid (FK → EvidenceItem) | yes | — | First conflicting passage |
| evidence_item_b_id | uuid (FK → EvidenceItem) | yes | — | Second conflicting passage |
| severity | enum(blocking, non_blocking) | yes | — | Whether this halts the task |
| resolution | enum(prefer_a, prefer_b, flag_manual, unresolved) | yes | unresolved | Priya's decision |
| resolution_rationale | text | no | null | Optional Priya note |
| resolved_at | timestamp | no | null | — |

### DraftSection

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| task_id | uuid (FK → Task) | yes | — | — |
| version | integer | yes | 1 | Increments on re-draft |
| status | enum(in_progress, ready_for_review, reviewed, committed) | yes | in_progress | — |
| committed_at | timestamp | no | null | When Priya committed draft |
| created_at | timestamp | yes | now | — |

### Sentence

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| draft_section_id | uuid (FK → DraftSection) | yes | — | — |
| order_index | integer | yes | — | Position in draft |
| text | text | yes | — | Sentence content |
| evidence_item_ids | uuid[] (FK → EvidenceItem) | yes | [] | Supporting evidence |
| confidence | enum(high, medium, low) | yes | — | Per-sentence confidence |
| review_status | enum(pending, accepted, flagged, edited) | yes | pending | Priya's annotation |
| edited_text | text | no | null | Priya's edit if status = edited |
| unsupported | boolean | yes | false | True if agent couldn't source this sentence |

### GapItem

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| task_id | uuid (FK → Task) | yes | — | — |
| sentence_id | uuid (FK → Sentence) | no | null | Linked draft sentence if applicable |
| description | text | yes | — | Gap description |
| severity | enum(critical, notable, minor) | yes | — | Agent-assigned severity |
| severity_override | enum(critical, notable, minor) | no | null | Priya's override if applied |
| regulatory_basis | text | yes | — | Agent's justification (e.g. "FDA expects X for this section type") |
| knowledge_basis_date | string | yes | — | Date of guidance the agent used (e.g. "2024-06") |
| uncertainty_flag | boolean | yes | false | True if agent uncertain about expectation |
| acknowledged | boolean | yes | false | Whether Priya has reviewed |
| created_at | timestamp | yes | now | — |

### ActionItem

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| task_id | uuid (FK → Task) | yes | — | — |
| gap_item_id | uuid (FK → GapItem) | yes | — | Source gap |
| description | text | yes | — | Action description |
| resolution_path | text | yes | — | Agent-suggested approach |
| recommended_owner | string | no | null | Agent's owner suggestion (display name) |
| urgency | enum(high, medium, low) | no | null | Relative to submission timeline |
| approval_status | enum(pending, approved, dismissed) | yes | pending | Priya's decision |
| committed | boolean | yes | false | Whether written to tracker |
| committed_at | timestamp | no | null | — |
| created_at | timestamp | yes | now | — |

### ReasoningEntry

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| id | uuid | yes | auto | Primary key |
| task_id | uuid (FK → Task) | yes | — | — |
| timestamp | timestamp | yes | now | When entry was emitted |
| text | text | yes | — | Plain-language reasoning statement |
| linked_action | string | no | null | Which agent action this explains |
| step | enum(evidence_extraction, drafting, gap_analysis, action_generation) | yes | — | Task step this entry belongs to |

---

## Section 15: State transition table

| From state | To state | Trigger | Guard | Side effects | Initiated by |
|---|---|---|---|---|---|
| Configuring | Scope confirmed | Priya confirms scope card | Min 1 source doc selected; target section defined | Task record created; scope_confirmation_text saved | User |
| Scope confirmed | Extracting evidence | Task launched | None | Reasoning trail begins streaming; sidebar shows active step | Agent |
| Extracting evidence | Awaiting evidence review | Evidence extraction complete | None | Banner notification fires; evidence table surfaced in sidebar | Agent |
| Extracting evidence | Awaiting conflict resolution | Blocking source contradiction detected | Conflict severity = blocking | Conflict modal triggered; urgent banner fires | Agent |
| Awaiting conflict resolution | Awaiting evidence review | Priya resolves conflict | Resolution field not null | ConflictRecord updated; affected EvidenceItems updated; task continues | User |
| Awaiting evidence review | Drafting section | Priya confirms evidence table | Min 1 EvidenceItem accepted | Accepted items locked; reasoning trail resumes | User |
| Drafting section | Running gap analysis | Draft complete | None | DraftSection available in sidebar immediately; reasoning trail continues | Agent |
| Running gap analysis | Awaiting gap review | Gap analysis complete | None | Banner fires if Critical gaps found; gap list surfaced in sidebar | Agent |
| Awaiting gap review | Generating actions | Priya confirms gap severity ratings | All Critical gaps acknowledged | Gap list locked; GapItems with overrides saved | User |
| Generating actions | Awaiting action approval | Action list ready | None | Banner fires; action list surfaced in modal | Agent |
| Awaiting action approval | Complete | Priya approves all action items | All ActionItems approved or dismissed | Approved ActionItems committed to tracker; task archived with full reasoning trail | User |
| Any active state | Stalled | Agent heartbeat timeout | No heartbeat for 90s | Banner changes to stalled; all sub-outputs preserved; retry option shown | System |
| Stalled | Last active state | Priya retries | None | Task resumes from last committed checkpoint | User |
| Any awaiting state | Awaiting (re-ping) | 30 min elapsed with no user input | Task still in awaiting state | Re-ping banner fires | System |
| Any state | Cancelled | Priya cancels | None | All partial sub-outputs preserved in archive; no writes committed to tracker | User |

---

## Section 16: Agent capability spec

### Capability: EvidenceExtraction

| Field | Value |
|---|---|
| Input | Task.target_section, Task.source_document_ids, optional style guide |
| Output | EvidenceItem[] with passage_text, source coordinates, confidence score, conflict detection |
| Confidence model | High = passage directly addresses claim; Medium = topically adjacent; Low = tangential. Unverified = outside designated docs (disclosed). Conflicted = contradicts another passage on same claim. |
| Fallback — low confidence | Low-confidence items included in review table with amber badge. Priya decides to accept or reject. |
| Fallback — hard failure | no_support: true EvidenceItem created with "No support found" label. Never fabricates a passage. |
| Human touchpoint | Yes — Priya reviews and accepts/rejects evidence table before drafting begins |
| Trigger | Task enters Extracting evidence state |
| Side effects | ReasoningEntries streamed per document scanned. EvidenceItems created. ConflictRecords created if contradictions detected. Task state transitions to Awaiting evidence review on completion or Awaiting conflict resolution on blocking conflict. |

### Capability: SectionDrafting

| Field | Value |
|---|---|
| Input | Accepted EvidenceItem[] for this task, target section identifier, optional style guide |
| Output | DraftSection with annotated Sentence[] — each sentence linked to EvidenceItem IDs and a confidence score |
| Confidence model | Per-sentence: High = well-sourced, multiple consistent items; Medium = single source or indirect; Low = tangential or inferred. |
| Fallback — low confidence | Low-confidence sentences annotated with amber underline and gap tooltip. Priya reviews these specifically. |
| Fallback — hard failure | Unsupported claims left as placeholder nodes: [CLAIM NOT SUPPORTED: description]. Never generates content without evidence. |
| Human touchpoint | Yes — draft is output only. Priya accepts, flags, or edits sentences before draft is committed. |
| Trigger | Task enters Drafting section state |
| Side effects | ReasoningEntries streamed per sentence composed. DraftSection and Sentence records created incrementally. Draft available in sidebar as it streams — Priya can begin review before drafting completes. Task state transitions to Running gap analysis when complete. |

### Capability: GapAnalysis

| Field | Value |
|---|---|
| Input | Completed DraftSection with Sentence[], accepted EvidenceItem[], target section type |
| Output | GapItem[] with description, severity (Critical/Notable/Minor), regulatory basis, knowledge basis date, uncertainty flag |
| Confidence model | Severity based on agent's regulatory expectation model for the section type. Knowledge basis date disclosed on every item. Uncertainty flag set if agent cannot determine typical FDA expectation. |
| Fallback — low confidence | GapItem created with uncertainty_flag: true and advisory note: "Regulatory expectation uncertain — verify against current guidance." |
| Fallback — hard failure | If gap analysis cannot complete (e.g., draft is a placeholder-only document), surfaced as a task warning. Priya can proceed to action generation with zero gaps or cancel. |
| Human touchpoint | Yes — Priya reviews gap list, adjusts severity, and acknowledges all Critical gaps before action generation begins. |
| Trigger | Task enters Running gap analysis state |
| Side effects | GapItem records created. ReasoningEntries streamed per gap identified. Task state transitions to Awaiting gap review on completion. |

### Capability: ActionItemGeneration

| Field | Value |
|---|---|
| Input | Confirmed GapItem[] (with any severity overrides applied) |
| Output | ActionItem[] with description, resolution path, recommended owner, urgency |
| Confidence model | All fields labeled "agent recommendation." Owner and urgency fields left blank if agent cannot determine with confidence — flagged for Priya's explicit input. |
| Fallback — low confidence | Blank owner / urgency fields. ActionItem created but cannot be approved until Priya completes the missing fields. |
| Fallback — hard failure | If action generation fails for a GapItem, GapItem retained in archive with note: "Action item generation failed — review manually." |
| Human touchpoint | Yes — ActionItems are pending_approval until Priya approves or dismisses. Committed: false until Priya commits batch. |
| Trigger | Task enters Generating actions state |
| Side effects | ActionItem records created. Task state transitions to Awaiting action approval. On commit, ActionItems written to tracker (mocked in v1). |

---

## Section 17: Mock data examples

### Task — active, mid-run

```json
{
  "id": "f3c8a2d1-7e44-4b9a-9f01-0d38c1a4b55e",
  "name": "Section 5.3.5.1 — Safety Summary (Study 204)",
  "created_by": "user-priya-menon-001",
  "target_section": "5.3.5.1",
  "source_document_ids": [
    "doc-study-204-csr",
    "doc-study-196-csr",
    "doc-isr-integrated-safety"
  ],
  "style_guide_id": null,
  "state": "drafting_section",
  "scope_confirmation_text": "I will extract evidence for CTD Section 5.3.5.1 (Individual Study Reports — Clinical Pharmacology) from Study 204 CSR, Study 196 CSR, and the Integrated Safety Report. I will draft the section summary, identify weak or missing support, and generate recommended follow-up actions.",
  "reasoning_visibility": "priya_only",
  "started_at": "2026-05-17T09:17:00Z",
  "completed_at": null,
  "stall_count": 0,
  "created_at": "2026-05-17T09:15:32Z"
}
```

### Task — stalled

```json
{
  "id": "a91d5c20-2f38-4c11-bd42-7f03a2e1d840",
  "name": "Module 2.7.4 — Summary of Clinical Safety",
  "created_by": "user-priya-menon-001",
  "target_section": "2.7.4",
  "source_document_ids": [
    "doc-isr-integrated-safety",
    "doc-isummary-2023"
  ],
  "state": "stalled",
  "started_at": "2026-05-16T14:02:00Z",
  "completed_at": null,
  "stall_count": 1,
  "created_at": "2026-05-16T14:00:15Z"
}
```

### Task — complete

```json
{
  "id": "b7e12f94-3a59-4d88-a015-2c90d8b47f11",
  "name": "Section 5.3.3.2 — Controlled Trial Efficacy Summary",
  "state": "complete",
  "started_at": "2026-05-14T10:08:00Z",
  "completed_at": "2026-05-14T10:41:22Z",
  "stall_count": 0,
  "created_at": "2026-05-14T10:06:00Z"
}
```

### EvidenceItem — high confidence, accepted

```json
{
  "id": "ev-001-f3c8a2d1",
  "task_id": "f3c8a2d1-7e44-4b9a-9f01-0d38c1a4b55e",
  "source_document_id": "doc-study-204-csr",
  "passage_text": "Treatment-emergent adverse events (TEAEs) were reported in 82.4% of patients in the 10mg cohort versus 61.7% in placebo (p<0.001). Grade 3 or higher events occurred in 14.2% versus 8.9% respectively.",
  "page_number": 47,
  "section_ref": "8.2.1",
  "paragraph_index": 3,
  "confidence": "high",
  "no_support": false,
  "source_type": "designated",
  "acceptance_status": "accepted",
  "conflict_id": null
}
```

### EvidenceItem — low confidence, pending review

```json
{
  "id": "ev-008-f3c8a2d1",
  "task_id": "f3c8a2d1-7e44-4b9a-9f01-0d38c1a4b55e",
  "source_document_id": "doc-study-196-csr",
  "passage_text": "Hepatic function laboratory parameters remained within normal reference ranges throughout the study period for the majority of patients.",
  "page_number": 112,
  "section_ref": "9.4",
  "paragraph_index": 1,
  "confidence": "low",
  "no_support": false,
  "source_type": "designated",
  "acceptance_status": "pending",
  "conflict_id": null
}
```

### GapItem — critical, unacknowledged

```json
{
  "id": "gap-003-f3c8a2d1",
  "task_id": "f3c8a2d1-7e44-4b9a-9f01-0d38c1a4b55e",
  "sentence_id": "sent-014-draft-001",
  "description": "The hepatotoxicity claim in sentence 14 is supported by a single indirect source (Study 196, Section 9.4). FDA typically requires at least two independent data sources for safety claims in this section type.",
  "severity": "critical",
  "severity_override": null,
  "regulatory_basis": "FDA expects multiple independent sources for safety signal characterization in Section 5.3.5.1 submissions.",
  "knowledge_basis_date": "2024-09",
  "uncertainty_flag": false,
  "acknowledged": false,
  "created_at": "2026-05-17T09:38:44Z"
}
```

### ActionItem — pending approval

```json
{
  "id": "action-001-f3c8a2d1",
  "task_id": "f3c8a2d1-7e44-4b9a-9f01-0d38c1a4b55e",
  "gap_item_id": "gap-003-f3c8a2d1",
  "description": "Identify a second independent source for the hepatotoxicity signal in Section 5.3.5.1 Sentence 14.",
  "resolution_path": "Search the Integrated Safety Report (Section 4.3) and Study 188 CSR for hepatic laboratory parameter data corroborating the Study 196 finding.",
  "recommended_owner": "Marcus Chen",
  "urgency": "high",
  "approval_status": "pending",
  "committed": false,
  "committed_at": null,
  "created_at": "2026-05-17T09:41:02Z"
}
```

### ReasoningEntry — mid-task

```json
{
  "id": "re-022-f3c8a2d1",
  "task_id": "f3c8a2d1-7e44-4b9a-9f01-0d38c1a4b55e",
  "timestamp": "2026-05-17T09:23:17Z",
  "text": "Scanning Study 196 CSR Section 9.4 for hepatic safety data. Found one relevant passage (page 112, paragraph 1). Confidence scored Low — the passage uses broad population language ('majority of patients') without specific frequency data. Flagging for Priya's review.",
  "linked_action": "EvidenceExtraction",
  "step": "evidence_extraction"
}
```

---

## Section 18: Navigation and routing

| Route | Screen | Auth required | Notes |
|---|---|---|---|
| / | Workspace | Yes | Default landing. Task monitor sidebar mounted but collapsed if no active task. |
| /tasks/new | Task Launcher modal (overlay) | Yes | Opens launcher over workspace. |
| /tasks/:taskId | Workspace with task monitor expanded to that task | Yes | Deep-link to active or archived task. |
| /tasks/:taskId/evidence | Evidence Review modal (overlay on workspace) | Yes | Direct link from banner notification. |
| /tasks/:taskId/conflict/:conflictId | Conflict Resolution modal (overlay) | Yes | Direct link from urgent banner. |
| /tasks/:taskId/draft | Workspace with draft review panel open | Yes | Direct link from sub-output availability card. |
| /tasks/:taskId/gaps | Gap Review modal (overlay) | Yes | Direct link from banner. |
| /tasks/:taskId/actions | Action Approval modal (overlay) | Yes | Direct link from banner. |
| /archive | Task Archive page | Yes | Historical task list. |
| /archive/:taskId | Task Archive detail (full reasoning trail, all sub-outputs) | Yes | — |
| /login | Login | No | Redirects to / if already authenticated. |

---

## Section 19: Tech stack declaration

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | React (Vite) | SPA. No SSR required for v1. |
| Styling | Tailwind CSS | Utility-first. Amber underline, badge colors, sidebar layout all via Tailwind. |
| State management | Zustand | Global task state. React Query for server data fetching and cache. |
| Routing | React Router v6 | Modal routes handled via outlet pattern. |
| Backend/API | Node.js + Express (REST) | Separate from frontend. Handles task orchestration, agent calls, state transitions. |
| Database | PostgreSQL | Primary store for all entities in data schema. |
| Auth | Clerk | JWT-based session. Per-task permission model enforced server-side. |
| AI/LLM calls | Anthropic Claude API (claude-sonnet-4-20250514) | Evidence extraction, section drafting, gap analysis, action generation, scope confirmation card. |
| Streaming | Server-sent events (SSE) | Reasoning trail streamed from backend to sidebar in real time. |
| Real-time state sync | SSE (same channel as reasoning trail) | Task state changes pushed to client without polling. |
| Notifications | In-app banner only (v1) | Banner component subscribes to SSE task event stream. No email or push in v1. |
| Heartbeat / stall detection | Server-side cron (30s interval) | Fires stall event if no agent activity for 90s on active task. |
| Tracker integration | Mocked (v1) | ActionItem commit writes to local DB with committed: true. Real tracker integration post-launch. |
| Deployment target | Vercel (frontend) + Railway (backend + DB) | Or equivalent. Docker-ready backend. |
