export type TaskState =
'configuring' |
'scope_confirmed' |
'extracting_evidence' |
'awaiting_evidence_review' |
'awaiting_conflict_resolution' |
'drafting_section' |
'draft_ready' |
'running_gap_analysis' |
'awaiting_gap_review' |
'generating_actions' |
'awaiting_action_approval' |
'stalled' |
'complete' |
'cancelled';

export type ConfidenceLevel =
'high' |
'medium' |
'low' |
'unverified' |
'conflicted';
export type SeverityLevel = 'critical' | 'notable' | 'minor';

export interface Task {
  id: string;
  name: string;
  target_section: string;
  source_document_ids: string[];
  state: TaskState;
  started_at: string;
  completed_at: string | null;
}

export interface EvidenceItem {
  id: string;
  task_id: string;
  source_document_id: string;
  passage_text: string;
  page_number: number;
  section_ref: string;
  confidence: ConfidenceLevel;
  acceptance_status: 'pending' | 'accepted' | 'rejected';
}

export interface DraftSentence {
  id: string;
  text: string;
  confidence: ConfidenceLevel;
  evidence_item_ids: string[];
  status: 'pending' | 'accepted' | 'flagged';
}

export interface GapItem {
  id: string;
  task_id: string;
  sentence_id: string;
  description: string;
  severity: SeverityLevel;
  regulatory_basis: string;
  acknowledged: boolean;
}

export interface ActionItem {
  id: string;
  task_id: string;
  gap_item_id: string;
  description: string;
  resolution_path: string;
  recommended_owner: string;
  urgency: 'high' | 'medium' | 'low';
  status: 'pending' | 'committed';
}

export interface ReasoningEntry {
  id: string;
  task_id: string;
  timestamp: string;
  text: string;
  step: 'evidence' | 'draft' | 'gaps' | 'actions';
}

export interface Banner {
  id: string;
  taskId: string;
  message: string;
  urgency: 'info' | 'warning' | 'critical';
  linkTarget: string;
}