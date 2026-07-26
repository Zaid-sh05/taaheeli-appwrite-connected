import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AuthenticatedAppShell } from "@/components/layout/AuthenticatedAppShell";
import { RoleRouteGuard } from "@/components/layout/RoleRouteGuard";
import { RoleSelectionPage } from "@/features/roleSwitch/RoleSelectionPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { PendingActivationPage } from "@/features/auth/pages/PendingActivationPage";
import { PatientRegistrationPage } from "@/features/registration/PatientRegistrationPage";
import { useSession } from "@/context/SessionContext";

// Manager
import { ManagerOverviewPage } from "@/features/manager/ManagerOverviewPage";
import { ManagerRequestsPage } from "@/features/manager/ManagerRequestsPage";
import { ManagerRequestDetailPage } from "@/features/manager/ManagerRequestDetailPage";
import { ManagerPatientsPage } from "@/features/manager/ManagerPatientsPage";
import { ManagerPatientDetailPage } from "@/features/manager/ManagerPatientDetailPage";
import { ManagerEmployeesPage } from "@/features/manager/ManagerEmployeesPage";
import { ManagerEmployeeDetailPage } from "@/features/manager/ManagerEmployeeDetailPage";
import { ManagerReportsPage } from "@/features/manager/ManagerReportsPage";
import { ManagerNotificationsPage } from "@/features/manager/ManagerNotificationsPage";
import { ManagerAIOverviewPage } from "@/features/ai/pages/ManagerAIOverviewPage";

// Therapist
import { TherapistOverviewPage } from "@/features/therapist/TherapistOverviewPage";
import { TherapistPatientsPage } from "@/features/therapist/TherapistPatientsPage";
import { TherapistPatientDetailPage } from "@/features/therapist/TherapistPatientDetailPage";
import { TherapistPlansPage } from "@/features/therapist/TherapistPlansPage";
import { TherapistPlanDetailPage } from "@/features/therapist/TherapistPlanDetailPage";
import { TherapistAppointmentsPage } from "@/features/therapist/TherapistAppointmentsPage";
import { TherapistNewSessionPage } from "@/features/therapist/TherapistNewSessionPage";
import { TherapistNotificationsPage } from "@/features/therapist/TherapistNotificationsPage";
import { TherapistAIWorkspacePage } from "@/features/ai/pages/TherapistAIWorkspacePage";

// Admin
import { AdminOverviewPage } from "@/features/admin/AdminOverviewPage";
import { AdminRegistrationsPage } from "@/features/admin/AdminRegistrationsPage";
import { AdminAppointmentsPage } from "@/features/admin/AdminAppointmentsPage";
import { AdminDocumentsPage } from "@/features/admin/AdminDocumentsPage";
import { AdminNotificationsPage } from "@/features/admin/AdminNotificationsPage";

// Patient
import { PatientOverviewPage } from "@/features/patient/PatientOverviewPage";
import { PatientAppointmentsPage } from "@/features/patient/PatientAppointmentsPage";
import { PatientExercisesPage } from "@/features/patient/PatientExercisesPage";
import { PatientCompanionPage } from "@/features/patient/PatientCompanionPage";

// Family
import { FamilyOverviewPage } from "@/features/family/FamilyOverviewPage";
import { FamilyProgressPage } from "@/features/family/FamilyProgressPage";
import { FamilyAppointmentsPage } from "@/features/family/FamilyAppointmentsPage";
import { FamilyMessagesPage } from "@/features/family/FamilyMessagesPage";
import { FamilyReportsPage } from "@/features/family/FamilyReportsPage";
import { FamilyAISummaryPage } from "@/features/ai/pages/FamilyAISummaryPage";

function LoginRoute() {
  const { selectedRole } = useSession();

  if (!selectedRole) {
    return (
      <Navigate
        to="/"
        replace
        state={{ message: "اختر واجهة المستخدم أولًا" }}
      />
    );
  }
  return <LoginPage />;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register/patient" element={<PatientRegistrationPage />} />
        <Route path="/pending-activation" element={<PendingActivationPage />} />
      </Route>

      {/* Manager routes */}
      <Route element={<RoleRouteGuard allowedRole="manager"><AuthenticatedAppShell /></RoleRouteGuard>}>
        <Route path="/manager" element={<ManagerOverviewPage />} />
        <Route path="/manager/requests" element={<ManagerRequestsPage />} />
        <Route path="/manager/requests/:id" element={<ManagerRequestDetailPage />} />
        <Route path="/manager/patients" element={<ManagerPatientsPage />} />
        <Route path="/manager/patients/:id" element={<ManagerPatientDetailPage />} />
        <Route path="/manager/employees" element={<ManagerEmployeesPage />} />
        <Route path="/manager/employees/:id" element={<ManagerEmployeeDetailPage />} />
        <Route path="/manager/reports" element={<ManagerReportsPage />} />
        <Route path="/manager/ai" element={<ManagerAIOverviewPage />} />
        <Route path="/manager/notifications" element={<ManagerNotificationsPage />} />
      </Route>

      {/* Therapist routes */}
      <Route element={<RoleRouteGuard allowedRole="doctor"><AuthenticatedAppShell /></RoleRouteGuard>}>
        <Route path="/therapist" element={<TherapistOverviewPage />} />
        <Route path="/therapist/patients" element={<TherapistPatientsPage />} />
        <Route path="/therapist/patients/:id" element={<TherapistPatientDetailPage />} />
        <Route path="/therapist/plans" element={<TherapistPlansPage />} />
        <Route path="/therapist/plans/:id" element={<TherapistPlanDetailPage />} />
        <Route path="/therapist/appointments" element={<TherapistAppointmentsPage />} />
        <Route path="/therapist/sessions/new" element={<TherapistNewSessionPage />} />
        <Route path="/therapist/ai" element={<TherapistAIWorkspacePage />} />
        <Route path="/therapist/notifications" element={<TherapistNotificationsPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<RoleRouteGuard allowedRole="admin"><AuthenticatedAppShell /></RoleRouteGuard>}>
        <Route path="/admin" element={<AdminOverviewPage />} />
        <Route path="/admin/registrations" element={<AdminRegistrationsPage />} />
        <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
        <Route path="/admin/documents" element={<AdminDocumentsPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
      </Route>

      {/* Patient routes */}
      <Route element={<RoleRouteGuard allowedRole="patient"><AuthenticatedAppShell /></RoleRouteGuard>}>
        <Route path="/patient" element={<PatientOverviewPage />} />
        <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
        <Route path="/patient/exercises" element={<PatientExercisesPage />} />
        <Route path="/patient/companion" element={<PatientCompanionPage />} />
      </Route>

      {/* Family routes */}
      <Route element={<RoleRouteGuard allowedRole="parent"><AuthenticatedAppShell /></RoleRouteGuard>}>
        <Route path="/family" element={<FamilyOverviewPage />} />
        <Route path="/family/progress" element={<FamilyProgressPage />} />
        <Route path="/family/appointments" element={<FamilyAppointmentsPage />} />
        <Route path="/family/messages" element={<FamilyMessagesPage />} />
        <Route path="/family/reports" element={<FamilyReportsPage />} />
        <Route path="/family/ai-summary" element={<FamilyAISummaryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
