const API_BASE = "https://agentic-hackathon-backend.onrender.com/api";

function getAuthHeader() {
  const token = localStorage.getItem('placement_auth_token');
  const userId = localStorage.getItem('placement_user_id');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  return headers;
}

export const api = {
  // ==================== AUTHENTICATION ====================
  async loginInit(emailOrId, channel = 'email', role = 'student') {
    const roleNormalized = (role === 'officer' || role === 'placement_officer') ? 'placement_officer' : 'student';
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrId, channel, role: roleNormalized })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Authentication failed');
    }
    return res.json();
  },

  async verifyOtp(sessionId, otp) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, otp })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'OTP verification failed' }));
      throw new Error(err.detail || 'Invalid OTP');
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('placement_auth_token', data.token);
      localStorage.setItem('placement_user', JSON.stringify(data.user));
      localStorage.setItem('placement_user_id', data.user.id);
    }
    return data;
  },

  async resendOtp(sessionId, channel = 'email') {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, channel })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Could not resend OTP' }));
      throw new Error(err.detail || 'Failed to resend OTP');
    }
    return res.json();
  },

  async login(emailOrId, password) {
    return this.loginInit(emailOrId, password);
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) {
      throw new Error('Session expired or unauthorized');
    }
    return res.json();
  },

  async logout() {
    const headers = getAuthHeader();
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('placement_auth_token');
      localStorage.removeItem('placement_user');
      localStorage.removeItem('placement_user_id');
      sessionStorage.clear();
    }
    return true;
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return res.json();
  },

  // ==================== STUDENT APIs ====================
  async getStudentProfileMe() {
    const res = await fetch(`${API_BASE}/students/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to load student profile');
    return res.json();
  },

  async updateStudentProfileMe(profileData) {
    const res = await fetch(`${API_BASE}/students/me`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update profile' }));
      throw new Error(err.detail || 'Failed to update profile');
    }
    return res.json();
  },

  async uploadStudentResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('placement_auth_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/students/me/resume`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Resume upload failed' }));
      throw new Error(err.detail || 'Resume upload failed');
    }
    return res.json();
  },

  async deleteStudentResume() {
    const res = await fetch(`${API_BASE}/students/me/resume`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete resume');
    return res.json();
  },

  async uploadStudentsExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('placement_auth_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/students/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Excel upload failed' }));
      throw new Error(err.detail || 'Failed to process Excel spreadsheet');
    }
    return res.json();
  },

  getSampleTemplateUrl() {
    return `${API_BASE}/students/sample-template`;
  },

  async getMyApplications(status = null) {
    let url = `${API_BASE}/applications/me`;
    if (status && status !== 'ALL') url += `?status=${encodeURIComponent(status)}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load applications');
    return res.json();
  },

  async getApplicationDetails(appId) {
    const res = await fetch(`${API_BASE}/applications/${appId}`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load application details');
    return res.json();
  },

  async getStudentNotifications(unreadOnly = false) {
    const res = await fetch(`${API_BASE}/notifications?unread_only=${unreadOnly}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  },

  async markNotificationRead(notifId) {
    const res = await fetch(`${API_BASE}/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    return res.json();
  },

  // ==================== COMPANY MANAGEMENT APIs ====================
  async getCompanies() {
    const res = await fetch(`${API_BASE}/companies`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load companies');
    return res.json();
  },

  async getCompany(companyId) {
    const res = await fetch(`${API_BASE}/companies/${companyId}`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load company details');
    return res.json();
  },

  async createCompany(payload) {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create company' }));
      throw new Error(err.detail || 'Failed to create company');
    }
    return res.json();
  },

  async updateCompany(companyId, payload) {
    const res = await fetch(`${API_BASE}/companies/${companyId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update company');
    return res.json();
  },

  async deleteCompany(companyId) {
    const res = await fetch(`${API_BASE}/companies/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete company');
    return res.json();
  },

  async addCompanyJD(companyId, payload) {
    const res = await fetch(`${API_BASE}/companies/${companyId}/jds`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to attach JD to company');
    return res.json();
  },

  // ==================== PLACEMENT DRIVES & AI SHORTLIST ====================
  async getDrives(status = null) {
    let url = `${API_BASE}/drives`;
    if (status && status !== 'ALL') url += `?status=${encodeURIComponent(status)}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    return res.json();
  },

  async getDriveDetails(driveId) {
    const res = await fetch(`${API_BASE}/drives/${driveId}`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Drive not found');
    return res.json();
  },

  async applyToDrive(driveId, payload = {}) {
    const res = await fetch(`${API_BASE}/drives/${driveId}/apply`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Application failed' }));
      throw new Error(err.detail || 'Could not submit application');
    }
    return res.json();
  },

  async parseJD(jdText) {
    const res = await fetch(`${API_BASE}/drives/parse_jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd_text: jdText })
    });
    return res.json();
  },

  async runAiShortlist(driveId, payload = {}) {
    const res = await fetch(`${API_BASE}/drives/${driveId}/shortlist`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Shortlist generation failed' }));
      throw new Error(err.detail || 'Could not generate shortlist');
    }
    return res.json();
  },

  getShortlistExportUrl(driveId) {
    const token = localStorage.getItem('placement_auth_token') || '';
    return `${API_BASE}/drives/${driveId}/shortlist/export?auth=${encodeURIComponent(token)}`;
  },

  async downloadShortlistExcel(driveId, companyName = 'Drive') {
    const safeCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const fallbackFilename = `shortlist_${safeCompany}.xlsx`;
    return this._downloadBinaryFile(`${API_BASE}/drives/${driveId}/shortlist/export`, fallbackFilename);
  },

  async downloadSelectedStudentsExcel(driveId, companyName = 'Drive') {
    const safeCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const fallbackFilename = `selected_students_${safeCompany}.xlsx`;
    return this._downloadBinaryFile(`${API_BASE}/drives/${driveId}/results/export/selected`, fallbackFilename);
  },

  async downloadNotSelectedStudentsExcel(driveId, companyName = 'Drive') {
    const safeCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const fallbackFilename = `not_selected_students_${safeCompany}.xlsx`;
    return this._downloadBinaryFile(`${API_BASE}/drives/${driveId}/results/export/not-selected`, fallbackFilename);
  },

  async downloadCompleteResultsExcel(driveId, companyName = 'Drive') {
    const safeCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const fallbackFilename = `complete_results_${safeCompany}.xlsx`;
    return this._downloadBinaryFile(`${API_BASE}/drives/${driveId}/results/export/all`, fallbackFilename);
  },

  async _downloadBinaryFile(url, fallbackFilename) {
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let errorMsg = 'Unable to generate Excel file. Please try again.';
      try {
        const parsed = JSON.parse(errText);
        if (parsed.detail) errorMsg = parsed.detail;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const blob = await res.blob();
    if (!blob || blob.size < 100) {
      throw new Error('No students available for export.');
    }

    let finalFilename = fallbackFilename;
    const disposition = res.headers.get('Content-Disposition') || res.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        finalFilename = match[1].trim();
      }
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    return finalFilename;
  },

  async finalizeDriveResults(driveId, payload) {
    const res = await fetch(`${API_BASE}/drives/${driveId}/finalize-results`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Finalizing results failed' }));
      throw new Error(err.detail || 'Could not finalize results');
    }
    return res.json();
  },

  getSelectedStudentsExportUrl(driveId) {
    const token = localStorage.getItem('placement_auth_token') || '';
    return `${API_BASE}/drives/${driveId}/results/export/selected?auth=${encodeURIComponent(token)}`;
  },

  getNotSelectedStudentsExportUrl(driveId) {
    const token = localStorage.getItem('placement_auth_token') || '';
    return `${API_BASE}/drives/${driveId}/results/export/not-selected?auth=${encodeURIComponent(token)}`;
  },

  getCompleteResultsExportUrl(driveId) {
    const token = localStorage.getItem('placement_auth_token') || '';
    return `${API_BASE}/drives/${driveId}/results/export/all?auth=${encodeURIComponent(token)}`;
  },

  async getDriveEligibility(driveId) {
    const res = await fetch(`${API_BASE}/drives/${driveId}/eligibility`, { headers: getAuthHeader() });
    return res.json();
  },

  async generateSchedule(driveId, durationMins = 45) {
    const res = await fetch(`${API_BASE}/drives/${driveId}/generate_schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration_mins: durationMins })
    });
    return res.json();
  },

  // ==================== COMMUNICATION APPROVAL & DISPATCH ====================
  async getStagedNotifications(driveId = null) {
    let url = `${API_BASE}/communication/staged-notifications`;
    if (driveId && driveId !== 'ALL') url += `?drive_id=${encodeURIComponent(driveId)}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load staged notifications');
    return res.json();
  },

  async approveAndSendNotifications(payload = {}) {
    const res = await fetch(`${API_BASE}/communication/approve_and_send`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send notifications' }));
      throw new Error(err.detail || 'Notification dispatch failed');
    }
    return res.json();
  },

  async sendScheduleNotifications(driveId) {
    const res = await fetch(`${API_BASE}/communication/send-schedule-notifications`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ drive_id: driveId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send schedule emails' }));
      throw new Error(err.detail || 'Schedule email dispatch failed');
    }
    return res.json();
  },
  // ==================== OFFICER APIs ====================
  async getOfficerDashboardStats() {
    const res = await fetch(`${API_BASE}/officer/dashboard-stats`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load officer dashboard statistics');
    return res.json();
  },

  async getOfficerStudents(search = null, branch = null, minCgpa = null) {
    let url = `${API_BASE}/officer/students`;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (branch && branch !== 'All') params.append('branch', branch);
    if (minCgpa !== null && minCgpa !== undefined && minCgpa !== '') params.append('min_cgpa', minCgpa);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load students roster');
    return res.json();
  },

  async getOfficerStudentDetails(studentId) {
    const res = await fetch(`${API_BASE}/officer/students/${studentId}`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load candidate details');
    return res.json();
  },

  async createStudentByOfficer(studentData) {
    const res = await fetch(`${API_BASE}/officer/students`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(studentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add student' }));
      throw new Error(err.detail || 'Failed to add student');
    }
    return res.json();
  },

  async updateStudentByOfficer(studentId, updates) {
    const res = await fetch(`${API_BASE}/officer/students/${studentId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async getOfficerDrives(status = null) {
    let url = `${API_BASE}/officer/drives`;
    if (status && status !== 'ALL') url += `?status=${encodeURIComponent(status)}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    return res.json();
  },

  async createPlacementDrive(driveData) {
    const res = await fetch(`${API_BASE}/officer/drives`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(driveData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create drive' }));
      throw new Error(err.detail || 'Failed to create drive');
    }
    return res.json();
  },

  async updatePlacementDrive(driveId, driveData) {
    const res = await fetch(`${API_BASE}/officer/drives/${driveId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(driveData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update drive' }));
      throw new Error(err.detail || 'Failed to update drive');
    }
    return res.json();
  },

  async deletePlacementDrive(driveId) {
    const res = await fetch(`${API_BASE}/officer/drives/${driveId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete placement drive');
    return res.json();
  },

  async getOfficerApplications(driveId = null, status = null, studentId = null) {
    let url = `${API_BASE}/officer/applications`;
    const params = new URLSearchParams();
    if (driveId && driveId !== 'ALL') params.append('drive_id', driveId);
    if (status && status !== 'ALL') params.append('status', status);
    if (studentId) params.append('student_id', studentId);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load applications');
    return res.json();
  },

  async updateApplicationStatus(appId, status, currentRound = null) {
    const res = await fetch(`${API_BASE}/officer/applications/${appId}/status`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ status, current_round: currentRound })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update application status' }));
      throw new Error(err.detail || 'Failed to update status');
    }
    return res.json();
  },

  async updateApplicationResult(appId, payload) {
    const res = await fetch(`${API_BASE}/officer/applications/${appId}/result`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update result' }));
      throw new Error(err.detail || 'Failed to update result');
    }
    return res.json();
  },

  async assignApplicationPanel(appId, payload) {
    const res = await fetch(`${API_BASE}/officer/applications/${appId}/panel`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to assign interview panel' }));
      throw new Error(err.detail || 'Failed to assign panel');
    }
    return res.json();
  },

  async sendBroadcastNotification(payload) {
    const res = await fetch(`${API_BASE}/officer/notifications`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to send notification');
    return res.json();
  },

  // ==================== FACILITIES & AGENTS ====================
  async getStudents(branch = null, minCgpa = null) {
    let url = `${API_BASE}/students`;
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (minCgpa !== null) params.append('min_cgpa', minCgpa);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url, { headers: getAuthHeader() });
    return res.json();
  },

  async getStudentProfile(studentId) {
    const res = await fetch(`${API_BASE}/students/${studentId}`, { headers: getAuthHeader() });
    return res.json();
  },

  async getPanels() {
    const res = await fetch(`${API_BASE}/facilities/panels`, { headers: getAuthHeader() });
    return res.json();
  },

  async getRooms() {
    const res = await fetch(`${API_BASE}/facilities/rooms`, { headers: getAuthHeader() });
    return res.json();
  },

  async getExceptions() {
    const res = await fetch(`${API_BASE}/exceptions`, { headers: getAuthHeader() });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit`, { headers: getAuthHeader() });
    return res.json();
  },

  async getCommunicationLogs() {
    const res = await fetch(`${API_BASE}/communication/logs`, { headers: getAuthHeader() });
    return res.json();
  },

  async getConflicts() {
    const res = await fetch(`${API_BASE}/conflicts`, { headers: getAuthHeader() });
    return res.json();
  },

  async getPolicies() {
    const res = await fetch(`${API_BASE}/policies`, { headers: getAuthHeader() });
    return res.json();
  },

  async getAgentBrainStatus() {
    const res = await fetch(`${API_BASE}/agent/status`, { headers: getAuthHeader() });
    return res.json();
  },

  async getAgentEvaluationReport() {
    const res = await fetch(`${API_BASE}/agent/evaluation/report`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error('Failed to load agent evaluation report');
    return res.json();
  },

  async triggerAgentEvaluation() {
    const res = await fetch(`${API_BASE}/agent/evaluation/run`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to run agent evaluation suite');
    return res.json();
  },

  async chatWithAgent(message, context = {}) {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ message, context })
    });
    return res.json();
  },

  async executeAgentTool(toolName, payload = {}) {
    const res = await fetch(`${API_BASE}/agent/tools/${toolName}`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async resolveConflict(conflictId = null, action = 'auto_buffer_shift') {
    const res = await fetch(`${API_BASE}/conflicts/resolve`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ conflict_id: conflictId, action })
    });
    return res.json();
  },

  async simulateVoiceCall(studentId) {
    const res = await fetch(`${API_BASE}/communication/simulate_voice_call`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ student_id: studentId })
    });
    return res.json();
  },

  async getDemoSteps() {
    const res = await fetch(`${API_BASE}/demo/steps`);
    return res.json();
  },

  async executeDemoStep(stepNum) {
    const res = await fetch(`${API_BASE}/demo/execute_step/${stepNum}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return res.json();
  },

  async downloadFile(url, fallbackFilename = 'report.xlsx') {
    const token = localStorage.getItem('placement_auth_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`Failed to download file: ${res.statusText}`);
    }
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    let filename = fallbackFilename;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return { success: true, filename };
  }
};
