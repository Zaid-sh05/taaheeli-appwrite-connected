# Taaheeli AI Skeleton

## 1. Phase objective

This phase prepares Taaheeli for a future private AI service without collecting
data, training a model, or providing medical decisions. The prototype proves the
workflow and permissions using synthetic demo data and deterministic mock logic.

## 2. Implemented roles

### AI Orchestrator

The Orchestrator checks the signed-in role, requested agent, scope, audience,
and feature flag. It then sends the request to the configured provider. The UI
does not call an AI provider directly.

### Case Summary Agent

Creates a draft summary from the patient profile, sessions, treatment plan,
appointments, exercises, and document status. It can produce:

- a detailed draft for the specialist;
- a simplified draft intended for the family;
- an aggregated non-clinical center summary for management.

### Recommendation Draft Agent

Creates reviewable follow-up points using demo rules. It never changes a
treatment plan and explicitly labels the output as non-medical.

### Progress Analysis Agent

Describes the current progress, plan goal indicators, and attendance. It does
not claim to predict improvement because the prototype has no validated
longitudinal medical dataset.

## 3. Human review workflow

1. The specialist selects a patient, agent, and output audience.
2. The Orchestrator validates permissions.
3. `MockAIProvider` returns a structured draft.
4. The UI displays the draft, evidence, limitations, provider version, and
   unavailable confidence state.
5. The specialist can edit, approve, or reject the draft.
6. Family-facing drafts remain hidden until they are approved.
7. Every generation and review is added to the audit log.

Management can create and review only an aggregated center summary. It cannot
generate individual clinical recommendations.

## 4. Current privacy boundary

- No request is sent outside the browser.
- No API key is included in source code or the production bundle.
- The provider is `mock-v1`.
- All records are synthetic and stored in `localStorage`.
- The patient companion routes medical questions to the center and urgent
  statements to emergency help.
- AI results never write to patient files, plans, sessions, or appointments.

This is a front-end prototype. Its UI guards demonstrate the intended policy,
but production authorization must be enforced again on the server.

## 5. Main code structure

```text
src/
  config/
    ai.ts
  context/
    AIContext.tsx
  features/
    ai/
      components/
      pages/
      policies/
      providers/
      services/
  types/
    ai.ts
```

The provider boundary is defined by the `AIProvider` interface. The current
Orchestrator uses `MockAIProvider`. `PrivateProviderPlaceholder` marks the future
replacement point.

## 6. Proposed private API contract

When a private back end is approved, `aiClient.ts` can be changed to call these
endpoints without redesigning the pages:

```text
POST /api/ai/cases/{patientId}/summary
POST /api/ai/cases/{patientId}/recommendations
POST /api/ai/cases/{patientId}/progress-analysis
POST /api/ai/results/{resultId}/approve
POST /api/ai/results/{resultId}/reject
GET  /api/ai/cases/{patientId}/history
POST /api/ai/management/summary
```

Example result:

```json
{
  "id": "ai-123",
  "patientId": "p6",
  "agent": "case-summary",
  "scope": "case",
  "audience": "parent",
  "status": "draft",
  "content": "Draft content",
  "evidence": [],
  "confidence": null,
  "limitations": [
    "Demo output; not a medical assessment."
  ],
  "requiresHumanReview": true,
  "modelVersion": "private-provider-version",
  "generatedAt": "2026-07-24T12:00:00Z"
}
```

## 7. Demo acceptance scenario

1. Sign in through **طبيب أو أخصائي علاج**.
2. Open **المساعد الذكي**.
3. Select a patient and choose **صياغة مبسطة للأسرة**.
4. Generate a case summary, edit it if needed, and approve it.
5. Return to role selection and sign in through **ولي أمر أو فرد من الأسرة**.
6. Open **الملخص الذكي**.
7. Confirm that only the approved result appears.
8. Sign in as manager and verify that **الملخص الذكي** contains aggregate
   indicators only.
9. Open the patient companion and try a general message, a medication question,
   and an urgent statement to verify safety routing.

## 8. Out of scope

- Real patient records or medical images.
- Dataset purchase or collection.
- Model training, fine-tuning, RAG, or automatic self-learning.
- Diagnosis, treatment change, medication advice, or automated decisions.
- External AI providers.
- Production database, authentication, encryption, and server-side
  authorization.
- Automatic publishing of AI results to families.

## 9. Next decision after approval of this prototype

The next phase should start with the data model, consent and privacy controls,
server-side identity and authorization, deployment boundary, and evaluation
protocol. The choice between RAG, rules, a private hosted model, or fine-tuning
should follow those decisions rather than precede them.
