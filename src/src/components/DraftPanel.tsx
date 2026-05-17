import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../store';
import { Button, ConfidenceBadge } from './ui';
import {
  FileText,
  AlertTriangle,
  X,
  Check,
  Flag,
  Edit3,
  ArrowRight } from
'lucide-react';
export const DraftReviewPanel = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { drafts, evidence, gaps, completeDraftReview } = useTaskStore();
  const sentences = taskId ? drafts[taskId] || [] : [];
  const taskEvidence = taskId ? evidence[taskId] || [] : [];
  const taskGaps = taskId ? gaps[taskId] || [] : [];
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);
  const handleContinue = () => {
    if (taskId) completeDraftReview(taskId);
    navigate('/');
  };
  return (
    <div className="flex-1 flex flex-col h-full bg-white relative z-20">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Draft Review</h2>
          <p className="text-sm text-zinc-500">
            Review annotated draft. Amber underlines indicate low confidence
            support.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            Close
          </Button>
          <Button onClick={handleContinue}>
            Continue to Gap Analysis <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Draft Editor Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-zinc-50/50">
          <div className="max-w-3xl mx-auto bg-white border border-zinc-200 shadow-sm rounded-xl p-8 lg:p-12 min-h-full">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6 font-serif">
              5.3.5.1 — Safety Summary
            </h1>
            <div className="text-zinc-800 leading-loose text-lg font-serif">
              {sentences.map((sentence) => {
                const isLowConfidence = sentence.confidence === 'low';
                const isSelected = selectedSentence === sentence.id;
                const gap = taskGaps.find((g) => g.sentence_id === sentence.id);
                return (
                  <span
                    key={sentence.id}
                    onClick={() => setSelectedSentence(sentence.id)}
                    className={`cursor-pointer rounded px-1 -mx-1 transition-colors
                      ${isLowConfidence ? 'decoration-amber-500 underline-offset-4 decoration-2 underline' : ''}
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-zinc-50'}
                    `}>
                    
                    {sentence.text}{' '}
                  </span>);

              })}
            </div>
          </div>
        </div>

        {/* Side Rail for Evidence/Annotations */}
        <AnimatePresence>
          {selectedSentence &&
          <motion.div
            initial={{
              width: 0,
              opacity: 0
            }}
            animate={{
              width: 380,
              opacity: 1
            }}
            exit={{
              width: 0,
              opacity: 0
            }}
            className="border-l border-zinc-200 bg-white overflow-y-auto flex flex-col">
            
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Sentence Annotation
                </h3>
                <button
                onClick={() => setSelectedSentence(null)}
                className="p-1 hover:bg-zinc-200 rounded-full text-zinc-500">
                
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs h-8">
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />{' '}
                    Accept
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs h-8">
                    <Flag className="w-3.5 h-3.5 mr-1 text-amber-600" /> Flag
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs h-8">
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                </div>

                {/* Gap Warning if any */}
                {(() => {
                const gap = taskGaps.find(
                  (g) => g.sentence_id === selectedSentence
                );
                if (gap) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                          <AlertTriangle className="w-4 h-4" /> Potential Gap
                          Detected
                        </div>
                        <p className="text-xs text-amber-900/80">
                          {gap.description}
                        </p>
                      </div>);

                }
                return null;
              })()}

                {/* Supporting Evidence */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                    Supporting Evidence
                  </h4>
                  {(() => {
                  const sentence = sentences.find(
                    (s) => s.id === selectedSentence
                  );
                  const evIds = sentence?.evidence_item_ids || [];
                  const evs = taskEvidence.filter((e) => evIds.includes(e.id));
                  if (evs.length === 0)
                  return (
                    <p className="text-sm text-zinc-500 italic">
                          No direct evidence linked.
                        </p>);

                  return evs.map((ev) =>
                  <div
                    key={ev.id}
                    className="p-3 border border-zinc-200 rounded-lg mb-3 bg-white shadow-sm">
                    
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />{' '}
                            {ev.source_document_id}
                          </span>
                          <ConfidenceBadge level={ev.confidence} />
                        </div>
                        <p className="text-sm text-zinc-800">
                          "{ev.passage_text}"
                        </p>
                        <p className="text-xs text-zinc-400 mt-2">
                          Page {ev.page_number} • Section {ev.section_ref}
                        </p>
                      </div>
                  );
                })()}
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

};