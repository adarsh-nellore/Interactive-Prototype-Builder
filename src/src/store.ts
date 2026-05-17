import { create } from 'zustand';
import {
  Task,
  EvidenceItem,
  DraftSentence,
  GapItem,
  ActionItem,
  ReasoningEntry,
  Banner,
  TaskState } from
'./types';

const MOCK_TASK_ID = 'f3c8a2d1-7e44-4b9a-9f01-0d38c1a4b55e';

const initialEvidence: EvidenceItem[] = [
{
  id: 'ev-1',
  task_id: MOCK_TASK_ID,
  source_document_id: 'Study 204 CSR',
  passage_text:
  'Treatment-emergent adverse events (TEAEs) were reported in 82.4% of patients in the 10mg cohort versus 61.7% in placebo (p<0.001).',
  page_number: 47,
  section_ref: '8.2.1',
  confidence: 'high',
  acceptance_status: 'pending'
},
{
  id: 'ev-2',
  task_id: MOCK_TASK_ID,
  source_document_id: 'Study 204 CSR',
  passage_text:
  'Grade 3 or higher events occurred in 14.2% versus 8.9% respectively. The most common Grade 3+ events were nausea (3.1%), fatigue (2.4%), and elevated ALT (1.8%).',
  page_number: 47,
  section_ref: '8.2.1',
  confidence: 'high',
  acceptance_status: 'pending'
},
{
  id: 'ev-3',
  task_id: MOCK_TASK_ID,
  source_document_id: 'Study 196 CSR',
  passage_text:
  'Hepatic function laboratory parameters remained within normal reference ranges throughout the study period for the majority of patients.',
  page_number: 112,
  section_ref: '9.4',
  confidence: 'low',
  acceptance_status: 'pending'
},
{
  id: 'ev-4',
  task_id: MOCK_TASK_ID,
  source_document_id: 'Integrated Safety Report',
  passage_text:
  "No cases meeting the criteria for Hy's Law (ALT >3× ULN with total bilirubin >2× ULN) were identified across the pooled safety population (N=1,247).",
  page_number: 24,
  section_ref: '4.1',
  confidence: 'medium',
  acceptance_status: 'pending'
},
{
  id: 'ev-5',
  task_id: MOCK_TASK_ID,
  source_document_id: 'Study 204 CSR',
  passage_text:
  'Two patients (0.6%) discontinued treatment due to serious adverse events: one Grade 4 thrombocytopenia and one Grade 3 pneumonitis. Both events resolved with standard supportive care.',
  page_number: 52,
  section_ref: '8.4',
  confidence: 'high',
  acceptance_status: 'pending'
},
{
  id: 'ev-6',
  task_id: MOCK_TASK_ID,
  source_document_id: 'Study 196 CSR',
  passage_text:
  "One patient in the 10mg arm exhibited a transient ALT elevation to 4.2× ULN with concurrent total bilirubin elevation to 2.3× ULN, meeting Hy's Law criteria. Event resolved upon discontinuation.",
  page_number: 134,
  section_ref: '9.4.2',
  confidence: 'conflicted',
  acceptance_status: 'pending'
}];


const initialDraft: DraftSentence[] = [
{
  id: 's1',
  text: 'The overall safety profile of the investigational product was evaluated across the pooled safety population (N=1,247) comprising patients from Studies 204 and 196.',
  confidence: 'high',
  evidence_item_ids: [],
  status: 'pending'
},
{
  id: 's2',
  text: 'Treatment-emergent adverse events (TEAEs) were reported in 82.4% of patients in the 10mg cohort, compared to 61.7% in the placebo group (p<0.001).',
  confidence: 'high',
  evidence_item_ids: ['ev-1'],
  status: 'pending'
},
{
  id: 's3',
  text: 'Severe (Grade 3 or higher) events occurred in 14.2% of treated patients versus 8.9% of placebo patients, with nausea, fatigue, and elevated ALT as the most frequently observed severe events.',
  confidence: 'high',
  evidence_item_ids: ['ev-2'],
  status: 'pending'
},
{
  id: 's4',
  text: 'Hepatic function laboratory parameters generally remained within normal reference ranges throughout the study period.',
  confidence: 'low',
  evidence_item_ids: ['ev-3'],
  status: 'pending'
},
{
  id: 's5',
  text: "No cases meeting Hy's Law criteria were identified in the pooled analysis of N=1,247 patients.",
  confidence: 'medium',
  evidence_item_ids: ['ev-4'],
  status: 'pending'
},
{
  id: 's6',
  text: 'Serious adverse events leading to treatment discontinuation occurred in 0.6% of patients (n=2), with one case of Grade 4 thrombocytopenia and one of Grade 3 pneumonitis. Both events resolved with standard supportive care.',
  confidence: 'high',
  evidence_item_ids: ['ev-5'],
  status: 'pending'
},
{
  id: 's7',
  text: 'There were no treatment-related deaths reported across either study.',
  confidence: 'low',
  evidence_item_ids: [],
  status: 'pending'
},
{
  id: 's8',
  text: 'The overall benefit-risk profile of the investigational product is considered favorable based on the safety findings characterized herein.',
  confidence: 'high',
  evidence_item_ids: [],
  status: 'pending'
}];


const initialGaps: GapItem[] = [
{
  id: 'gap-1',
  task_id: MOCK_TASK_ID,
  sentence_id: 's4',
  description:
  'The hepatotoxicity claim in sentence 4 is supported by a single indirect source using broad population language ("majority of patients"). FDA typically requires at least two independent data sources for safety claims in this section type.',
  severity: 'critical',
  regulatory_basis:
  'FDA expects multiple independent sources for safety signal characterization in Section 5.3.5.1. See FDA Guidance for Industry: Drug-Induced Liver Injury (2009).',
  acknowledged: false
},
{
  id: 'gap-2',
  task_id: MOCK_TASK_ID,
  sentence_id: 's5',
  description:
  'The Hy\'s Law assessment is contradicted by a Study 196 finding (ev-6) of one patient meeting Hy\'s Law criteria. The claim of "no cases" requires reconciliation.',
  severity: 'notable',
  regulatory_basis:
  'Conflicting safety findings must be disclosed and reconciled per ICH E3 §12.3.2.',
  acknowledged: false
},
{
  id: 'gap-3',
  task_id: MOCK_TASK_ID,
  sentence_id: 's7',
  description:
  'The claim of no treatment-related deaths is presented without supporting citation. Confirm against the death narrative summary (Module 5.3.5.3).',
  severity: 'minor',
  regulatory_basis:
  'All summary safety claims require sourced support per CTD guidance.',
  acknowledged: false
}];


const initialActions: ActionItem[] = [
{
  id: 'act-1',
  task_id: MOCK_TASK_ID,
  gap_item_id: 'gap-1',
  description:
  'Identify a second independent source for the hepatotoxicity signal in Section 5.3.5.1 Sentence 4.',
  resolution_path:
  'Search the Integrated Safety Report (Section 4.3) and Study 188 CSR for hepatic laboratory parameter data corroborating the Study 196 finding.',
  recommended_owner: 'Marcus Chen',
  urgency: 'high',
  status: 'pending'
},
{
  id: 'act-2',
  task_id: MOCK_TASK_ID,
  gap_item_id: 'gap-2',
  description: "Reconcile Hy's Law contradiction between ISR and Study 196.",
  resolution_path:
  "Confirm whether the Study 196 case (patient 196-104-003) was included in the ISR pooled denominator. If yes, update sentence to disclose one Hy's Law case. If no, document exclusion rationale.",
  recommended_owner: 'Priya Menon',
  urgency: 'high',
  status: 'pending'
},
{
  id: 'act-3',
  task_id: MOCK_TASK_ID,
  gap_item_id: 'gap-3',
  description: 'Source the no-treatment-related-deaths claim.',
  resolution_path:
  'Cross-reference Module 5.3.5.3 death narratives. Add citation to sentence 7.',
  recommended_owner: 'Marcus Chen',
  urgency: 'low',
  status: 'pending'
}];


const initialReasoning: ReasoningEntry[] = [
{
  id: 'r1',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 1800000).toISOString(),
  text: 'Task launched. Scope confirmed: extract evidence for Section 5.3.5.1 from Study 204 CSR, Study 196 CSR, and the Integrated Safety Report.',
  step: 'evidence'
},
{
  id: 'r2',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 1700000).toISOString(),
  text: 'Indexed 3 designated source documents (1,847 pages total). Built passage-level retrieval index.',
  step: 'evidence'
},
{
  id: 'r3',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 1500000).toISOString(),
  text: 'Scanning Study 204 CSR §8.2 for TEAE frequencies and Grade 3+ summaries.',
  step: 'evidence'
},
{
  id: 'r4',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 1400000).toISOString(),
  text: 'Extracted TEAE rates (82.4% vs 61.7%, p<0.001) from page 47. Confidence: High (direct quantitative source with statistical reporting).',
  step: 'evidence'
},
{
  id: 'r5',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 1200000).toISOString(),
  text: 'Extracted Grade 3+ breakdown (nausea 3.1%, fatigue 2.4%, ALT 1.8%) from page 47. Confidence: High.',
  step: 'evidence'
},
{
  id: 'r6',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 900000).toISOString(),
  text: 'Scanning Study 196 CSR §9.4 for hepatic safety data.',
  step: 'evidence'
},
{
  id: 'r7',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 700000).toISOString(),
  text: 'Found hepatic passage. Confidence scored Low — uses broad population language ("majority of patients") without specific frequency data. Flagging for review.',
  step: 'evidence'
},
{
  id: 'r8',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 500000).toISOString(),
  text: "Detected potential source contradiction: ISR §4.1 states no Hy's Law cases (N=1,247), while Study 196 §9.4.2 documents one Hy's Law case. Marking as Conflicted — non-blocking; will surface in evidence review.",
  step: 'evidence'
},
{
  id: 'r9',
  task_id: MOCK_TASK_ID,
  timestamp: new Date(Date.now() - 300000).toISOString(),
  text: 'Extracted 6 evidence items. 4 High, 1 Medium, 1 Low, 1 Conflicted. Awaiting your review before drafting.',
  step: 'evidence'
}];


interface TaskStore {
  activeTaskId: string | null;
  tasks: Record<string, Task>;
  evidence: Record<string, EvidenceItem[]>;
  drafts: Record<string, DraftSentence[]>;
  gaps: Record<string, GapItem[]>;
  actions: Record<string, ActionItem[]>;
  reasoning: Record<string, ReasoningEntry[]>;
  banners: Banner[];

  updateTaskState: (taskId: string, state: TaskState) => void;
  addBanner: (banner: Banner) => void;
  removeBanner: (bannerId: string) => void;
  acceptEvidence: (taskId: string) => void;
  completeDraftReview: (taskId: string) => void;
  acknowledgeGaps: (taskId: string) => void;
  commitActions: (taskId: string) => void;
  addReasoning: (
  taskId: string,
  text: string,
  step: ReasoningEntry['step'])
  => void;
}

const day = 86400000;

export const useTaskStore = create<TaskStore>((set, get) => ({
  activeTaskId: MOCK_TASK_ID,
  tasks: {
    [MOCK_TASK_ID]: {
      id: MOCK_TASK_ID,
      name: 'Section 5.3.5.1 — Safety Summary (Study 204)',
      target_section: '5.3.5.1',
      source_document_ids: [
      'Study 204 CSR',
      'Study 196 CSR',
      'Integrated Safety Report'],

      state: 'awaiting_evidence_review',
      started_at: new Date(Date.now() - 1800000).toISOString(),
      completed_at: null
    },
    'archived-1': {
      id: 'archived-1',
      name: 'Module 2.7.4 — Summary of Clinical Safety',
      target_section: '2.7.4',
      source_document_ids: [
      'Integrated Safety Report',
      'Study 204 CSR',
      'Study 196 CSR'],

      state: 'stalled',
      started_at: new Date(Date.now() - day * 1.2).toISOString(),
      completed_at: null
    },
    'archived-2': {
      id: 'archived-2',
      name: 'Section 5.3.3.2 — Controlled Trial Efficacy Summary',
      target_section: '5.3.3.2',
      source_document_ids: ['Study 204 CSR', 'Study 196 CSR'],
      state: 'complete',
      started_at: new Date(Date.now() - day * 3).toISOString(),
      completed_at: new Date(Date.now() - day * 3 + 2100000).toISOString()
    },
    'archived-3': {
      id: 'archived-3',
      name: 'Section 2.7.3 — Summary of Clinical Efficacy',
      target_section: '2.7.3',
      source_document_ids: ['Study 204 CSR', 'Study 196 CSR', 'Study 188 CSR'],
      state: 'complete',
      started_at: new Date(Date.now() - day * 7).toISOString(),
      completed_at: new Date(Date.now() - day * 7 + 1800000).toISOString()
    },
    'archived-4': {
      id: 'archived-4',
      name: 'Section 4.2.3.2 — Preclinical Toxicology Summary',
      target_section: '4.2.3.2',
      source_document_ids: ['Preclinical Summary', '13-Week Tox Study'],
      state: 'complete',
      started_at: new Date(Date.now() - day * 12).toISOString(),
      completed_at: new Date(Date.now() - day * 12 + 1400000).toISOString()
    },
    'archived-5': {
      id: 'archived-5',
      name: 'Section 5.3.5.3 — Death Narrative Summary',
      target_section: '5.3.5.3',
      source_document_ids: ['Integrated Safety Report'],
      state: 'cancelled',
      started_at: new Date(Date.now() - day * 14).toISOString(),
      completed_at: null
    }
  },
  evidence: { [MOCK_TASK_ID]: initialEvidence },
  drafts: { [MOCK_TASK_ID]: initialDraft },
  gaps: { [MOCK_TASK_ID]: initialGaps },
  actions: { [MOCK_TASK_ID]: initialActions },
  reasoning: { [MOCK_TASK_ID]: initialReasoning },
  banners: [
  {
    id: 'b1',
    taskId: MOCK_TASK_ID,
    message: 'Evidence table is ready — review before drafting begins.',
    urgency: 'info',
    linkTarget: `/tasks/${MOCK_TASK_ID}/evidence`
  },
  {
    id: 'b-conflict',
    taskId: MOCK_TASK_ID,
    message:
    'Source conflict detected between ISR §4.1 and Study 196 §9.4.2 — resolve when reviewing evidence.',
    urgency: 'warning',
    linkTarget: `/tasks/${MOCK_TASK_ID}/evidence`
  }],


  updateTaskState: (taskId, state) =>
  set((store) => ({
    tasks: { ...store.tasks, [taskId]: { ...store.tasks[taskId], state } }
  })),

  addBanner: (banner) =>
  set((store) => ({ banners: [...store.banners, banner] })),
  removeBanner: (bannerId) =>
  set((store) => ({
    banners: store.banners.filter((b) => b.id !== bannerId)
  })),

  addReasoning: (taskId, text, step) =>
  set((store) => {
    const newEntry: ReasoningEntry = {
      id: Math.random().toString(),
      task_id: taskId,
      timestamp: new Date().toISOString(),
      text,
      step
    };
    return {
      reasoning: {
        ...store.reasoning,
        [taskId]: [...(store.reasoning[taskId] || []), newEntry]
      }
    };
  }),

  acceptEvidence: (taskId) => {
    const { updateTaskState, removeBanner, addReasoning, addBanner } = get();
    updateTaskState(taskId, 'drafting_section');
    removeBanner('b1');
    removeBanner('b-conflict');
    addReasoning(
      taskId,
      'Evidence review complete (5 accepted, 1 conflict flagged for disclosure). Beginning section drafting.',
      'draft'
    );

    setTimeout(() => {
      addReasoning(
        taskId,
        'Composing sentences 1–3: pooled safety population framing and TEAE frequencies. All sentences sourced to High-confidence evidence.',
        'draft'
      );
    }, 1500);
    setTimeout(() => {
      addReasoning(
        taskId,
        'Composing sentence 4 (hepatic function). Applying Low-confidence annotation due to broad source language. User attention recommended.',
        'draft'
      );
    }, 3000);
    setTimeout(() => {
      updateTaskState(taskId, 'draft_ready');
      addReasoning(
        taskId,
        'Draft complete (8 sentences, 1 amber-flagged, 1 unsourced). Awaiting your review.',
        'draft'
      );
      addBanner({
        id: 'b2',
        taskId,
        message: 'Draft section ready — review when convenient.',
        urgency: 'info',
        linkTarget: `/tasks/${taskId}/draft`
      });
    }, 4500);
  },

  completeDraftReview: (taskId) => {
    const { updateTaskState, removeBanner, addReasoning, addBanner } = get();
    updateTaskState(taskId, 'running_gap_analysis');
    removeBanner('b2');
    addReasoning(
      taskId,
      'Draft review complete. Running gap analysis against FDA Guidance for Industry: Drug-Induced Liver Injury (2009) and ICH E3.',
      'gaps'
    );

    setTimeout(() => {
      addReasoning(
        taskId,
        'Identified critical gap: Hepatotoxicity claim (sentence 4) supported by a single indirect source. FDA typically requires multiple independent sources for this section type.',
        'gaps'
      );
    }, 2000);
    setTimeout(() => {
      updateTaskState(taskId, 'awaiting_gap_review');
      addReasoning(
        taskId,
        '3 gaps identified (1 critical, 1 notable, 1 minor). Awaiting your acknowledgement.',
        'gaps'
      );
      addBanner({
        id: 'b3',
        taskId,
        message: 'Gap analysis complete — review before actions are generated.',
        urgency: 'warning',
        linkTarget: `/tasks/${taskId}/gaps`
      });
    }, 4000);
  },

  acknowledgeGaps: (taskId) => {
    const { updateTaskState, removeBanner, addReasoning, addBanner } = get();
    updateTaskState(taskId, 'generating_actions');
    removeBanner('b3');
    addReasoning(
      taskId,
      'Gaps acknowledged. Generating resolution action items with owner recommendations based on team roles.',
      'actions'
    );

    setTimeout(() => {
      addReasoning(
        taskId,
        'Action 1: Marcus Chen assigned to locate secondary hepatic source (ISR §4.3, Study 188 CSR). Urgency: High.',
        'actions'
      );
    }, 2000);
    setTimeout(() => {
      updateTaskState(taskId, 'awaiting_action_approval');
      addReasoning(
        taskId,
        '3 action items ready for approval. Owners pre-assigned based on prior task history.',
        'actions'
      );
      addBanner({
        id: 'b4',
        taskId,
        message: 'Action items ready for your approval.',
        urgency: 'info',
        linkTarget: `/tasks/${taskId}/actions`
      });
    }, 3500);
  },

  commitActions: (taskId) => {
    const { updateTaskState, removeBanner, addReasoning } = get();
    updateTaskState(taskId, 'complete');
    removeBanner('b4');
    addReasoning(
      taskId,
      '3 action items committed to internal tracker. Task complete. Total elapsed: 33 min.',
      'actions'
    );
  }
}));