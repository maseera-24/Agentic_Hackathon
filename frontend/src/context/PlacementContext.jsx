import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import confetti from 'canvas-confetti';

const PlacementContext = createContext();

export function PlacementProvider({ children, initialUser = null }) {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    if (initialUser) return initialUser;
    const stored = localStorage.getItem('placement_user');
    return stored ? JSON.parse(stored) : null;
  });

  const userRole = currentUser?.role === 'placement_officer' || currentUser?.role === 'tpo'
    ? 'placement_officer'
    : currentUser?.role === 'student'
      ? 'student'
      : null;

  // Active Tabs for Student & Officer
  const [studentTab, setStudentTab] = useState('dashboard'); // 'dashboard' | 'profile' | 'drives' | 'applications' | 'notifications'
  const [officerTab, setOfficerTab] = useState('dashboard'); // 'dashboard' | 'drives' | 'candidates' | 'interviews' | 'insights'
  const [driveWorkflowStep, setDriveWorkflowStep] = useState(1); // 1: JD, 2: Eligibility, 3: Matching, 4: Scheduling, 5: Notifications
  const [candidatesSubTab, setCandidatesSubTab] = useState('matching'); // 'matching' | 'roster' | 'eligibility'
  const [selectedStudentId, setSelectedStudentId] = useState('STU001');

  // Student State
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(85);
  const [myApplications, setMyApplications] = useState([]);
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Common Placement Drives
  const [drives, setDrives] = useState([]);
  const [activeDriveId, setActiveDriveId] = useState('DRIVE_GOOGLE_2026');

  // Officer State
  const [officerStats, setOfficerStats] = useState(null);
  const [officerStudents, setOfficerStudents] = useState([]);
  const [officerApplications, setOfficerApplications] = useState([]);
  const [panels, setPanels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [agentStatus, setAgentStatus] = useState(null);

  const [loading, setLoading] = useState(false);

  // Modals & Drawers
  const [whyModal, setWhyModal] = useState({
    isOpen: false,
    title: '',
    entity: null,
    factors: [],
    confidence: 0.95,
    reasons: [],
    recommendedAction: '',
    category: 'Eligibility'
  });

  const [voiceCallModal, setVoiceCallModal] = useState({
    isOpen: false,
    student: null,
    status: 'Connecting...',
    transcript: [],
    activeSpeechIndex: 0,
    isSpeaking: false,
    duration: 0
  });

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: 'agent',
      text: '👋 Hello! I am your AI Placement Operations Agent. I coordinate the entire placement lifecycle: analyzing job descriptions, verifying student eligibility, ranking candidates with explainable match scores, generating conflict-free interview schedules, and preparing notifications.\n\nClick any suggested action below or tell me what to do!',
      tools: [],
      actionCards: [
        { title: "Analyze Job Description", action: "analyze_jd", button_text: "Analyze Active JD", type: "primary" },
        { title: "Find Eligible Candidates", action: "check_eligibility", button_text: "Check Eligibility", type: "secondary" },
        { title: "Check Operations Status", action: "get_pending_actions", button_text: "Show Pending Actions", type: "info" }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Demo Scenario State (20 Steps)
  const [demoSteps, setDemoSteps] = useState([]);
  const [currentDemoStep, setCurrentDemoStep] = useState(1);
  const [isAutoPlayingDemo, setIsAutoPlayingDemo] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Fetch Student Data
  const refreshStudentData = useCallback(async () => {
    if (userRole !== 'student') return;
    try {
      const [profileRes, appsRes, notifsRes, drivesRes] = await Promise.all([
        api.getStudentProfileMe().catch(() => null),
        api.getMyApplications().catch(() => []),
        api.getStudentNotifications().catch(() => ({ notifications: [], unread_count: 0 })),
        api.getDrives().catch(() => [])
      ]);

      if (profileRes?.student) {
        setStudentProfile(profileRes.student);
        setProfileCompletion(profileRes.profile_completion || 85);
      }
      if (appsRes) setMyApplications(appsRes);
      if (notifsRes) {
        setStudentNotifications(notifsRes.notifications || []);
        setUnreadNotifCount(notifsRes.unread_count || 0);
      }
      if (drivesRes) setDrives(drivesRes);
    } catch (err) {
      console.error('Error refreshing student data:', err);
    }
  }, [userRole]);

  // Fetch Officer Data
  const refreshOfficerData = useCallback(async () => {
    if (userRole !== 'placement_officer') return;
    try {
      const [
        statsRes,
        studentsRes,
        drivesRes,
        appsRes,
        panelsRes,
        roomsRes,
        exceptionsRes,
        auditRes,
        commsRes,
        conflictsRes,
        policiesRes,
        brainStatus,
        stepsData
      ] = await Promise.all([
        api.getOfficerDashboardStats().catch(() => null),
        api.getOfficerStudents().catch(() => []),
        api.getOfficerDrives().catch(() => []),
        api.getOfficerApplications().catch(() => []),
        api.getPanels().catch(() => []),
        api.getRooms().catch(() => []),
        api.getExceptions().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getCommunicationLogs().catch(() => []),
        api.getConflicts().catch(() => []),
        api.getPolicies().catch(() => []),
        api.getAgentBrainStatus().catch(() => null),
        api.getDemoSteps().catch(() => [])
      ]);

      if (statsRes) setOfficerStats(statsRes);
      if (studentsRes) setOfficerStudents(studentsRes);
      if (drivesRes) setDrives(drivesRes);
      if (appsRes) setOfficerApplications(appsRes);
      if (panelsRes) setPanels(panelsRes);
      if (roomsRes) setRooms(roomsRes);
      if (exceptionsRes) setExceptions(exceptionsRes);
      if (auditRes) setAuditLogs(auditRes);
      if (commsRes) setCommunications(commsRes);
      if (conflictsRes) setConflicts(conflictsRes);
      if (policiesRes) setPolicies(policiesRes);
      if (brainStatus) setAgentStatus(brainStatus);
      if (stepsData) setDemoSteps(stepsData);
    } catch (err) {
      console.error('Error refreshing officer data:', err);
    }
  }, [userRole]);

  const refreshAllData = useCallback(async () => {
    setLoading(true);
    if (userRole === 'student') {
      await refreshStudentData();
    } else if (userRole === 'placement_officer') {
      await refreshOfficerData();
    }
    setLoading(false);
  }, [userRole, refreshStudentData, refreshOfficerData]);

  useEffect(() => {
    if (currentUser) {
      refreshAllData();
      const interval = setInterval(refreshAllData, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser, refreshAllData]);

  // Auth Operations
  const handleInitiateLogin = async (email, password, channel = 'email') => {
    setLoading(true);
    try {
      const res = await api.loginInit(email, password, channel);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (sessionId, otp) => {
    setLoading(true);
    try {
      const res = await api.verifyOtp(sessionId, otp);
      setCurrentUser(res.user);
      addToast('Welcome Back!', `Logged in as ${res.user.name} (${res.user.role})`, 'success');
      return res;
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (sessionId, channel = 'email') => {
    return api.resendOtp(sessionId, channel);
  };

  const handleLogin = async (email, password) => {
    return handleInitiateLogin(email, password);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    // Complete wipe of all user and role cached state
    setCurrentUser(null);
    setStudentProfile(null);
    setMyApplications([]);
    setStudentNotifications([]);
    setUnreadNotifCount(0);
    setOfficerStats(null);
    setOfficerStudents([]);
    setOfficerApplications([]);
    setPanels([]);
    setRooms([]);
    setExceptions([]);
    setAuditLogs([]);
    setCommunications([]);
    setConflicts([]);
    setPolicies([]);
    setAgentStatus(null);
    setStudentTab('dashboard');
    setOfficerTab('dashboard');
    setDriveWorkflowStep(1);
    setCandidatesSubTab('matching');
    setCopilotOpen(false);
    addToast('Logged Out', 'You have been successfully logged out.', 'info');
  };

  // Why Modal
  const openWhyModal = (config) => {
    setWhyModal({
      isOpen: true,
      title: config.title || 'AI Reasoning & Explainability',
      entity: config.entity || null,
      factors: config.factors || ['Academic Cutoff', 'Backlog Policy', 'Branch Mapping', 'Skill Alignment'],
      confidence: config.confidence || 0.95,
      reasons: config.reasons || ['Evaluated all criteria.'],
      recommendedAction: config.recommendedAction || 'Review candidate fitment.',
      category: config.category || 'Eligibility'
    });
  };

  const closeWhyModal = () => {
    setWhyModal(prev => ({ ...prev, isOpen: false }));
  };

  // Voice Call Simulation
  const triggerVoiceCall = async (studentId = 'STU003') => {
    const student = (officerStudents.length > 0 ? officerStudents : [studentProfile]).find(s => s?.id === studentId) || {
      id: 'STU003',
      name: 'Amit Patel',
      branch: 'Electronics & Communication Engineering'
    };

    setVoiceCallModal({
      isOpen: true,
      student,
      status: 'Dialing...',
      transcript: [],
      activeSpeechIndex: 0,
      isSpeaking: false,
      duration: 0
    });

    try {
      const res = await api.simulateVoiceCall(studentId);
      const transcript = res.transcript || [
        { speaker: "AI Voice Agent", text: `Hello ${student?.name || 'Amit'}, this is the Placement Operations Assistant from Apex Institute. We noticed you have not confirmed attendance for the upcoming TCS Digital assessment.` },
        { speaker: "Student", text: "Hello ma'am! Yes, I was having trouble with my portal login yesterday." },
        { speaker: "AI Voice Agent", text: "No problem. Would you like me to confirm your attendance for the test on 5th September right now?" },
        { speaker: "Student", text: "Yes please! I confirm my attendance." },
        { speaker: "AI Voice Agent", text: "Wonderful! Your attendance has been confirmed and locked. Best of luck with your preparation!" }
      ];

      setVoiceCallModal(prev => ({
        ...prev,
        status: 'Connected (HD Audio)',
        transcript
      }));

      // Play synthesis if available
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let idx = 0;
        const speakNext = () => {
          if (idx >= transcript.length) {
            setVoiceCallModal(p => ({ ...p, status: 'Call Completed & Attendance Confirmed' }));
            addToast('Voice Call Confirmed', `Attendance successfully confirmed for ${student?.name}`, 'success');
            refreshAllData();
            return;
          }
          const item = transcript[idx];
          setVoiceCallModal(p => ({ ...p, activeSpeechIndex: idx, isSpeaking: true }));
          
          const utter = new SpeechSynthesisUtterance(item.text);
          utter.rate = item.speaker.includes('AI') ? 1.05 : 0.95;
          utter.onend = () => {
            idx++;
            setTimeout(speakNext, 500);
          };
          window.speechSynthesis.speak(utter);
        };
        speakNext();
      } else {
        let idx = 0;
        const t = setInterval(() => {
          idx++;
          if (idx < transcript.length) {
            setVoiceCallModal(p => ({ ...p, activeSpeechIndex: idx }));
          } else {
            clearInterval(t);
            setVoiceCallModal(p => ({ ...p, status: 'Call Completed & Confirmed' }));
            refreshAllData();
          }
        }, 2000);
      }
    } catch (e) {
      console.error(e);
      setVoiceCallModal(p => ({ ...p, status: 'Call Completed (Simulated)' }));
    }
  };

  // Demo step runner
  const runDemoStep = async (stepNum) => {
    try {
      setCurrentDemoStep(stepNum);
      await api.executeDemoStep(stepNum);
      await refreshAllData();

      if (stepNum === 1 || stepNum === 2) setOfficerTab('drives');
      else if (stepNum === 3 || stepNum === 4 || stepNum === 5 || stepNum === 6) setOfficerTab('applications');
      else if (stepNum === 7 || stepNum === 8) setOfficerTab('schedules');
      else if (stepNum === 9 || stepNum === 16 || stepNum === 17 || stepNum === 18) {
        setOfficerTab('notifications');
        if (stepNum === 18) triggerVoiceCall('STU003');
      }
      else if (stepNum >= 10 && stepNum <= 14) setOfficerTab('agent_ops');
      else if (stepNum === 19) setOfficerTab('dashboard');

      if (stepNum === 6 || stepNum === 14) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }

      addToast(`Step ${stepNum} Executed`, `Demo progression updated successfully.`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Copilot Message Handler
  const sendCopilotMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotLoading(true);

    try {
      const res = await api.chatWithAgent(text, { 
        active_drive: activeDriveId,
        selected_student_id: selectedStudentId,
        current_tab: userRole === 'student' ? studentTab : officerTab,
        user_role: userRole,
        user_id: currentUser?.id
      });
      
      const agentMsg = {
        sender: 'agent',
        text: res.reply || 'Request processed successfully.',
        intent: res.intent,
        tools: res.executed_tools || [],
        actionCards: res.action_cards || [],
        structuredData: res.structured_data || null,
        downloadUrl: res.download_url || null,
        filename: res.filename || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCopilotMessages(prev => [...prev, agentMsg]);

      // If the agent returned a direct download action
      if (res.action?.type === 'download' && res.action.url) {
        try {
          await api.downloadFile(res.action.url, res.action.filename || 'report.xlsx');
          addToast('Report Downloaded', `Successfully downloaded ${res.action.filename || 'Excel workbook'}.`, 'success');
          confetti({ particleCount: 50, spread: 45, origin: { y: 0.6 } });
        } catch (dlErr) {
          console.error('Auto download error:', dlErr);
        }
      }

      // If the agent requested navigation
      if (res.navigate_to) {
        if (res.navigate_to.tab) {
          if (userRole === 'student') setStudentTab(res.navigate_to.tab);
          else setOfficerTab(res.navigate_to.tab);
        }
        if (res.navigate_to.step) {
          setDriveWorkflowStep(res.navigate_to.step);
        }
        if (res.navigate_to.subTab) {
          setCandidatesSubTab(res.navigate_to.subTab);
        }
      }

      await refreshAllData();
    } catch (err) {
      setCopilotMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: 'Encountered an error while connecting to the Placement Agent. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Dispatch Action Card click directly from AI Agent
  const handleAgentAction = async (action, payload = {}) => {
    try {
      if (action === 'download_file' || action === 'export_results' || action === 'download_selected_excel' || action === 'download_results_excel') {
        const url = payload.download_url || payload.url || `/api/drives/${activeDriveId}/results/export/all`;
        const filename = payload.filename || 'placement_results.xlsx';
        addToast('Generating Excel', 'Downloading verified spreadsheet...', 'info');
        await api.downloadFile(url, filename);
        addToast('Download Complete', `Saved ${filename}`, 'success');
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
      } else if (action === 'confirm_notify_selected' || action === 'send_notifications') {
        await api.executeAgentTool('prepare_notifications', { drive_id: activeDriveId });
        addToast('Notifications Released', 'Dual-Channel (SMS + Email) dispatched to candidates.', 'success');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        await refreshAllData();
        await sendCopilotMessage('Show communication logs');
      } else if (action === 'analyze_jd') {
        setOfficerTab('drives');
        setDriveWorkflowStep(1);
        await sendCopilotMessage('Analyze this job description');
      } else if (action === 'check_eligibility') {
        setOfficerTab('candidates');
        setCandidatesSubTab('eligibility');
        await sendCopilotMessage('Check eligible students');
      } else if (action === 'match_candidates' || action === 'shortlist_top_candidates') {
        setOfficerTab('candidates');
        setCandidatesSubTab('matching');
        await sendCopilotMessage('Show the top candidates');
      } else if (action === 'schedule_interviews' || action === 'generate_schedule') {
        setOfficerTab('interviews');
        await sendCopilotMessage('Schedule interviews');
      } else if (action === 'approve_schedule') {
        addToast('Schedule Approved', 'Interview timetable finalized and confirmed by Placement Officer.', 'success');
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
        await sendCopilotMessage('Prepare candidate notifications for the approved schedule');
      } else if (action === 'approve_shortlist') {
        addToast('Shortlist Finalized', 'Shortlist approved. Ready for interview scheduling.', 'success');
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        setOfficerTab('drives');
        setDriveWorkflowStep(4);
      } else if (action === 'resolve_conflicts' || action === 'resolve_conflicts_auto' || action === 'execute_recovery_plan') {
        await api.resolveConflict();
        addToast('Conflict Resolved', 'Applied AI Buffer Shift: 0 opportunity collisions.', 'success');
        await refreshAllData();
        await sendCopilotMessage('Check for scheduling conflicts');
      } else if (action === 'navigate_candidates') {
        setOfficerTab('candidates');
      } else if (action === 'navigate_insights') {
        setOfficerTab('insights');
      } else if (action === 'get_pending_actions') {
        await sendCopilotMessage('What needs my attention?');
      } else if (action === 'trigger_voice_escalation') {
        triggerVoiceCall('STU003');
      } else {
        await sendCopilotMessage(`Execute action: ${action}`);
      }
    } catch (err) {
      console.error('Agent action error:', err);
      addToast('Action Failed', err.message || 'Could not execute action', 'error');
    }
  };

  const value = {
    // Auth & Roles
    currentUser,
    userRole,
    handleLogin,
    handleInitiateLogin,
    handleVerifyOtp,
    handleResendOtp,
    handleLogout,

    // Navigation Tabs
    studentTab,
    setStudentTab,
    officerTab,
    setOfficerTab,
    driveWorkflowStep,
    setDriveWorkflowStep,
    candidatesSubTab,
    setCandidatesSubTab,
    selectedStudentId,
    setSelectedStudentId,

    // Student Data
    studentProfile,
    profileCompletion,
    myApplications,
    studentNotifications,
    unreadNotifCount,
    refreshStudentData,

    // Drives
    drives,
    setDrives,
    activeDriveId,
    setActiveDriveId,

    // Officer Data
    officerStats,
    officerStudents,
    officerApplications,
    panels,
    rooms,
    exceptions,
    auditLogs,
    communications,
    conflicts,
    policies,
    agentStatus,
    refreshOfficerData,

    // Universal
    loading,
    refreshAllData,
    whyModal,
    openWhyModal,
    closeWhyModal,
    voiceCallModal,
    setVoiceCallModal,
    triggerVoiceCall,
    copilotOpen,
    setCopilotOpen,
    copilotLoading,
    copilotMessages,
    sendCopilotMessage,
    handleAgentAction,
    demoSteps,
    currentDemoStep,
    setCurrentDemoStep,
    runDemoStep,
    isAutoPlayingDemo,
    setIsAutoPlayingDemo,
    toasts,
    addToast
  };

  return (
    <PlacementContext.Provider value={value}>
      {children}
    </PlacementContext.Provider>
  );
}

export function usePlacement() {
  const context = useContext(PlacementContext);
  if (!context) {
    throw new Error('usePlacement must be used within PlacementProvider');
  }
  return context;
}
