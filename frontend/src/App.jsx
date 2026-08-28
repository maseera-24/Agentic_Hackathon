import React from "react";
import Login from "./components/Login";
import { PlacementProvider, usePlacement } from "./context/PlacementContext";

// Student Components
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboardView from "./components/student/StudentDashboardView";
import StudentProfileView from "./components/student/StudentProfileView";
import StudentDrivesView from "./components/student/StudentDrivesView";
import StudentApplicationsView from "./components/student/StudentApplicationsView";
import StudentNotificationsView from "./components/student/StudentNotificationsView";

// Officer Components - 5 Primary Operations Views
import OfficerLayout from "./components/officer/OfficerLayout";
import OfficerDashboardView from "./components/officer/OfficerDashboardView";
import OfficerDrivesView from "./components/officer/OfficerDrivesView";
import OfficerCandidatesView from "./components/officer/OfficerCandidatesView";
import OfficerInterviewsView from "./components/officer/OfficerInterviewsView";
import OfficerInsightsView from "./components/officer/OfficerInsightsView";

// Universal Components
import ToastContainer from "./components/common/ToastContainer";

function StudentPortalContent() {
  const { studentTab } = usePlacement();

  const renderStudentView = () => {
    switch (studentTab) {
      case 'dashboard': return <StudentDashboardView />;
      case 'profile': return <StudentProfileView />;
      case 'drives': return <StudentDrivesView />;
      case 'applications': return <StudentApplicationsView />;
      case 'results': return <StudentApplicationsView />;
      case 'schedules': return <StudentDashboardView />;
      case 'notifications': return <StudentNotificationsView />;
      case 'resume': return <StudentProfileView />;
      case 'settings': return <StudentProfileView />;
      default: return <StudentDashboardView />;
    }
  };

  return (
    <StudentLayout>
      {renderStudentView()}
      <ToastContainer />
    </StudentLayout>
  );
}

function OfficerPortalContent() {
  const { officerTab } = usePlacement();

  const renderOfficerView = () => {
    switch (officerTab) {
      case 'dashboard':
        return <OfficerDashboardView />;
      case 'drives':
        return <OfficerDrivesView />;
      case 'candidates':
      case 'students':
      case 'eligibility':
      case 'skill_matching':
        return <OfficerCandidatesView />;
      case 'interviews':
      case 'schedules':
      case 'panels_rooms':
      case 'conflicts':
        return <OfficerInterviewsView />;
      case 'insights':
      case 'readiness':
      case 'evaluation':
      case 'agent_ops':
      case 'audit':
        return <OfficerInsightsView />;
      default:
        return <OfficerDashboardView />;
    }
  };

  return (
    <OfficerLayout>
      {renderOfficerView()}
    </OfficerLayout>
  );
}

function PortalRouter() {
  const { currentUser, userRole, handleLogin } = usePlacement();

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (userRole === 'student') {
    return <StudentPortalContent />;
  }

  return <OfficerPortalContent />;
}

export default function App() {
  return (
    <PlacementProvider>
      <PortalRouter />
    </PlacementProvider>
  );
}
