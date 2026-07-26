# Taaheeli — Appwrite-connected frontend

Arabic RTL frontend for a rehabilitation and care management system.

## Appwrite connection

The application uses Appwrite for:

- email/password sessions;
- role and activation checks through the `profiles` table;
- patients, employees, appointments, sessions, treatment plans, and
  registration-request reads according to Appwrite permissions;
- appointment, session, treatment-plan, and registration-review writes for
  roles that have the corresponding table or row permission;
- public patient registration in `registration_requests`.

Copy `.env.example` to `.env.local` only when you need to override the included
public project, database, or table identifiers. Never place an Appwrite API key
in a Vite environment variable.

Approving a registration request from the client updates the request status.
Creating the Auth user, assigning its role label, and creating the matching
`profiles` and `patients` rows must be implemented in an Appwrite Function.
Those privileged operations must not run in this browser application.

## AI skeleton

The AI screens still use the in-browser `MockAIProvider`. They do not contain a
trained medical model, real clinical recommendations, or a connection to an
external AI provider.

Read [docs/AI_SKELETON.md](docs/AI_SKELETON.md) for architecture, boundaries,
demo steps, and the future integration contract.

## Run locally

```bash
npm ci
npm run dev
```

Build the production bundle:

```bash
npm run build
```

## AI demo routes

- `/therapist/ai`: run the three case agents and review outputs.
- `/manager/ai`: create and review a non-clinical center summary.
- `/family/ai-summary`: display approved family-facing results only.
- `/patient/companion`: use the local mock companion and safety routing.

Core operational data comes from Appwrite. The AI audit trail, exercises,
documents, messages, notifications, and companion demo remain browser-only
until matching Appwrite tables and policies are added.
