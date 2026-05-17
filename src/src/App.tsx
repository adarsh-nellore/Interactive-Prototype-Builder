import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WorkspaceLayout } from './pages/Workspace';
import { TaskArchive, TaskArchiveDetail } from './pages/Archive';
import {
  EvidenceReviewModal,
  GapReviewModal,
  ActionApprovalModal,
  TaskLauncherModal } from
'./components/Modals';
import { DraftReviewPanel } from './components/DraftPanel';
export function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<WorkspaceLayout />}>
          <Route path="tasks/new" element={<TaskLauncherModal />} />
          <Route
            path="tasks/:taskId/evidence"
            element={<EvidenceReviewModal />} />
          
          <Route path="tasks/:taskId/draft" element={<DraftReviewPanel />} />
          <Route path="tasks/:taskId/gaps" element={<GapReviewModal />} />
          <Route
            path="tasks/:taskId/actions"
            element={<ActionApprovalModal />} />
          
        </Route>
        <Route path="/archive" element={<TaskArchive />} />
        <Route path="/archive/:taskId" element={<TaskArchiveDetail />} />
      </Routes>
    </BrowserRouter>);

}