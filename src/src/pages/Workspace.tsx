import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '../store';
import { TaskMonitorSidebar } from '../components/Sidebar';
import { Button } from '../components/ui';
import {
  FileText,
  Plus,
  ChevronRight,
  Bell,
  Sparkles,
  Clock } from
'lucide-react';
const TopBar = () => {
  const navigate = useNavigate();
  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0 z-30 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-bold text-zinc-900 text-lg tracking-tight">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-sm" />
          </div>
          Peer AI
        </div>
        <nav className="flex items-center gap-1 text-sm font-medium text-zinc-600">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 rounded-md hover:bg-zinc-100 text-zinc-900">
            
            Workspace
          </button>
          <button
            onClick={() => navigate('/archive')}
            className="px-3 py-1.5 rounded-md hover:bg-zinc-100">
            
            Archive
          </button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
          <FileText className="w-4 h-4" />
          <span>NDA 214-555</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-zinc-900">Module 5</span>
        </div>
        <Button
          variant="primary"
          className="h-8 text-xs gap-1.5"
          onClick={() => navigate('/tasks/new')}>
          
          <Plus className="w-3.5 h-3.5" /> New Task
        </Button>
        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
          PM
        </div>
      </div>
    </header>);

};
const BannerStack = () => {
  const { banners } = useTaskStore();
  const navigate = useNavigate();
  return (
    <div className="absolute top-14 left-0 right-96 z-20 flex flex-col items-center pt-4 pointer-events-none">
      <AnimatePresence>
        {banners.map((banner) => {
          const colors = {
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-amber-50 border-amber-200 text-amber-800',
            critical: 'bg-red-50 border-red-200 text-red-800'
          };
          return (
            <motion.div
              key={banner.id}
              initial={{
                opacity: 0,
                y: -20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95
              }}
              className={`pointer-events-auto mb-2 flex items-center justify-between w-full max-w-2xl px-4 py-3 rounded-lg border shadow-sm ${colors[banner.urgency]}`}>
              
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 opacity-70" />
                <span className="text-sm font-medium">{banner.message}</span>
              </div>
              <Button
                variant="secondary"
                className="h-7 px-3 text-xs bg-white/80 hover:bg-white"
                onClick={() => navigate(banner.linkTarget)}>
                
                Open
              </Button>
            </motion.div>);

        })}
      </AnimatePresence>
    </div>);

};
const DocumentPane = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-zinc-100">
      {/* Doc toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-6 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span className="font-mono">Module 5</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-mono">5.3 Clinical Study Reports</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-mono">5.3.5 Reports of Efficacy & Safety</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-mono font-semibold text-zinc-900">5.3.5.1</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Saved ·
            2 min ago
          </span>
          <span className="text-zinc-300">|</span>
          <span>v 4 of 4 · Draft</span>
        </div>
      </div>

      <div className="p-8 lg:p-12 flex justify-center">
        <article className="w-full max-w-3xl bg-white border border-zinc-200 shadow-sm rounded-lg p-12 lg:p-16 font-serif text-zinc-800 leading-relaxed">
          {/* Submission header */}
          <header className="not-prose pb-6 mb-8 border-b border-zinc-200 font-sans">
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">
              NDA 214-555 · Module 5 · Clinical Study Reports
            </div>
            <h1 className="text-xl font-bold text-zinc-900 leading-tight">
              5.3.5.1 Reports of Controlled Clinical Studies Pertinent to the
              Claimed Indication
            </h1>
            <div className="text-xs text-zinc-500 mt-2">
              Sponsor: Theraplex Biopharma · Investigational Product: TPX-204 ·
              Indication: Moderate-to-severe atopic dermatitis
            </div>
          </header>

          <h2 className="text-lg font-bold text-zinc-900 mt-0 mb-3 font-sans">
            1. Overview of Pivotal Studies
          </h2>
          <p className="mb-4 text-[15px]">
            The clinical development program for TPX-204 in adult patients with
            moderate-to-severe atopic dermatitis comprises two pivotal
            randomized, double-blind, placebo-controlled Phase 3 studies:{' '}
            <strong>Study 204</strong> (N=684) and <strong>Study 196</strong>{' '}
            (N=563). Both studies employed identical primary endpoints
            (proportion of patients achieving IGA 0/1 at Week 16) and shared a
            common dosing schedule of 10 mg subcutaneously every two weeks.
          </p>
          <p className="mb-6 text-[15px]">
            The combined safety database (N=1,247) provides the basis for the
            integrated safety summary presented in §5.3.5.1.4 below, with
            cross-references to the Integrated Safety Report (ISR) where pooled
            analyses are reported.
          </p>

          <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3 font-sans">
            2. Patient Demographics
          </h2>
          <p className="mb-4 text-[15px]">
            Across the pooled population, the median age was 38.4 years (range
            18–74), with 54.2% female participants. Baseline disease severity
            was distributed as follows: IGA 3 (moderate) in 71.6% and IGA 4
            (severe) in 28.4% of patients. Demographics were balanced between
            treatment arms in both studies (Table 1.1, ISR §3.2).
          </p>

          <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3 font-sans">
            3. Efficacy Findings
          </h2>
          <p className="mb-4 text-[15px]">
            Both studies met their primary endpoint with statistically
            significant separation from placebo. In the pooled analysis, 47.8%
            of TPX-204 patients achieved IGA 0/1 at Week 16 versus 9.3% of
            placebo (difference 38.5%, 95% CI: 33.1–43.9, p&lt;0.0001). Key
            secondary endpoints (EASI-75, pruritus NRS) showed concordant
            separation.
          </p>

          {/* Agent draft insert zone */}
          <div className="my-10 not-prose">
            <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/40 p-5 font-sans">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                  Agent-drafted section · pending insertion
                </span>
                <span className="ml-auto text-[10px] text-blue-700 font-mono">
                  §5.3.5.1.4 Integrated Safety Summary
                </span>
              </div>
              <p className="text-sm text-blue-900/80 leading-relaxed mb-3">
                Peer is currently extracting evidence and drafting the
                integrated safety summary for this section. Once you accept the
                draft in the copilot panel, it will be inserted here with full
                inline citation links.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-blue-700">
                <span className="inline-flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-blue-200">
                  <Clock className="w-3 h-3" /> Estimated draft time: ~3 min
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-blue-200">
                  <FileText className="w-3 h-3" /> 3 source docs · 1,847 pages
                  indexed
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-zinc-900 mt-8 mb-3 font-sans">
            5. Conclusions
          </h2>
          <p className="mb-4 text-[15px]">
            The integrated efficacy and safety data from Studies 204 and 196
            support the favorable benefit-risk profile of TPX-204 for the
            proposed indication. Detailed safety characterization is provided in
            the agent-drafted §5.3.5.1.4 above, with supporting evidence
            cross-referenced to the underlying Clinical Study Reports.
          </p>
          <p className="text-xs text-zinc-500 italic mt-8 pt-6 border-t border-zinc-100 font-sans">
            This section is being prepared for submission to FDA. All claims
            must be sourced and verified before final commit. Last modified by
            Dr. Priya Menon · {new Date().toLocaleDateString()}.
          </p>
        </article>
      </div>
    </div>);

};
export const WorkspaceLayout = () => {
  const location = useLocation();
  const isDraftRoute = location.pathname.includes('/draft');
  return (
    <div className="flex flex-col h-screen w-full bg-zinc-100 overflow-hidden font-sans">
      <TopBar />
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        {isDraftRoute ?
        <Outlet /> :

        <>
            <DocumentPane />
            <Outlet /> {/* Modals render here over the DocumentPane */}
          </>
        }

        {/* Sidebar */}
        <TaskMonitorSidebar />
      </div>
    </div>);

};