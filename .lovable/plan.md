## HireNowX — Functional & UX Refactor Plan

Big scope across 3 builders + 1 new lightweight config. Keeping current premium visual language intact — only structural/logic changes.

---

### 1. Job Template Builder (`src/pages/TemplateBuilder.tsx`)

- Remove **Plan Health** section entirely (readiness %, warnings, checklist).
- Remove **Recommendations** section entirely.
- Remove **Screening** from `ADDABLE_ROUND_TYPES`.
- Keep only **Role Context** + **Competency Coverage** in right panel, with new explanatory copy: "Competencies are mapped from the JD, role level, skills, domain, and experience range. AI will use these competencies to generate role-relevant assessments and interview questions."
- Per-round **Skills to be Assessed** dropdown — different skill suggestions per round type (MCQ → frontend/debug; Coding → DSA/API/code quality; AI Interview → communication/architecture; HR → culture/motivation). Persist in store via `round.notes` or new field.
- Round card stays minimal (already mostly done): order, type icon, editable name, skills dropdown, status badge, delete/reorder.
- Rebalance spacing: widen left column now that right panel is lighter.

---

### 2. MCQ Assessment Builder (`src/pages/MCQBuilder.tsx`)

**Step 1 — Confirm Context**
- Keep "AI has prepared this assessment" card with AI Parsed badges.
- Show predefined **Competency Coverage** panel with explanatory copy.
- Blueprint shows: Questions to Generate, Questions to Send, Difficulty Mix (editable, must total 100), Question Types, Skills.
- **Remove Duration from Step 1** (move to Step 3).
- Validation: generate ≥ send; difficulty totals 100.

**Step 2 — Question Pool** (renamed from "Generate Questions")
- Tabs: AI Generated | Bulk Upload | Manual | Total Pool | Selected
- "Generate with AI" CTA inside AI Generated tab when empty.
- "Upload Questions (CSV)" + "Add Question Manually" buttons.
- CSV columns: question, opt1-4, correct, difficulty, competency, explanation. Upload summary (total/valid/invalid/duplicates).
- Source badge per question (AI / Bulk / Manual).
- Card: checkbox, text, source badge, difficulty, skill tag, collapsed options + explanation. Remove lock/swap/delete/edit/double-check/search.
- "Approve All" / "Select Required Count" + counter `Selected X / Y`.
- Continue disabled until selected = questions to send.
- Right panel: source counts, total, selected, difficulty distribution, competency coverage, target. Remove Engine Status, remove Blueprint Health & Role Context duplicates, fix alignment.

**Step 3 — Review & Finalize**
- Suggested Duration computed from selection (count × difficulty effort), editable input + helper copy.
- Summary: name, count, source breakdown, difficulty mix, competency coverage, pass threshold.
- **Restore Candidate View / Preview** card (assessment title, count, duration, instructions, sample MCQ layout, options, submit, proctoring note).
- "View Final Questions" full-page overlay (already exists — keep).
- Save confirmation warning unchanged.

---

### 3. Coding Assessment Builder (`src/pages/CodingBuilder.tsx`)

Same structural changes as MCQ, adapted for coding:

**Step 1**
- Keep AI-prepared card + predefined Competency Coverage panel.
- Blueprint: Problems to Generate, Problems to Send, Difficulty Mix (editable), languages, problem types, test cases, proctoring, integrity. **Remove Duration.**

**Step 2 — Problem Pool**
- Tabs: AI Generated | Manual | Total Pool | Selected.
- "Add Problem Manually" with full coding fields (statement, type, languages, I/O, constraints, sample tests, hidden count, complexity, scoring, skill).
- Card: checkbox, title, summary, type, difficulty, skill, languages, test counts, collapsed details. Remove all extra actions.
- Approve All + Selected X/Y counter, Continue gated.
- Right panel cleaned: source counts, totals, difficulty, skill coverage, target, test case coverage. Remove Engine Status, Blueprint Health, Role Context duplicates.

**Step 3**
- Suggested Duration (count × per-problem effort by difficulty), editable.
- Summary identical scope to MCQ.
- **Restore Candidate View** (coding env preview: title, count, duration, problem area, language selector, run/submit, test case area, proctoring).
- "View Final Problems" overlay kept.
- Confirmation warning unchanged.

---

### 4. AI Interview / AI Coding Lightweight Config (NEW)

New file: `src/pages/AIRoundConfig.tsx` (route `/jobs/:jobId/round/:roundId/ai-config`).

- Drawer-style or compact page using existing AppLayout + ContextTopBar.
- **AI Interview**: name, skills, experience level, duration, question style (technical/behavioral/scenario/mixed), difficulty, language, proctoring, threshold, candidate instructions.
- **AI Coding / Live Coding**: skills, language preference, problem style (debug/implement/live reasoning/explain), duration, difficulty, proctoring, AI rubric.
- Save → set round `assessmentStatus = 'ready'`.
- Wire from JobDetails round actions.

---

### 5. Final Polish

- Rebalance spacing after section removals.
- Verify JD page Assessment Readiness reflects all new ready states.
- Ensure all builders return to `/jobs/:jobId` after save (already done).
- TypeScript clean; preserve all existing tokens (`hnxgreen`, `teal`, `navy`).

### Technical notes

- Add per-round `assessedSkills: string[]` to `Round` type for persistence; store via `useStore.updateJobRounds`.
- Helper `suggestedDurationMinutes(items, kind)` colocated in each builder.
- Skill suggestion map keyed by `RoundType` colocated in TemplateBuilder.
- CSV parser stays inline; minimal lib-free.
- No backend changes; all state in Zustand store.
