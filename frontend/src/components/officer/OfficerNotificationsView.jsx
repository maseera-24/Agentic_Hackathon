import React, { useState } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import { Send, Bell } from 'lucide-react';

export default function OfficerNotificationsView() {
  const { addToast } = usePlacement();
  const [recipient, setRecipient] = useState('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notifType, setNotifType] = useState('ANNOUNCEMENT');
  const [sending, setSending] = useState(false);
  const [sentHistory, setSentHistory] = useState([
    {
      id: 'DISP_01',
      recipient: 'All Students',
      title: 'TCS Digital Pre-Placement Talk & Registration Deadline',
      message: 'All registered 2026 batch students must confirm attendance by 02 Sept.',
      sent_at: '2026-08-22T09:00:00'
    },
    {
      id: 'DISP_02',
      recipient: 'Google India Shortlisted',
      title: 'Google Technical Interview Venue & ID Guidelines',
      message: 'Please arrive 15 minutes prior with 2 hard copies of your resume.',
      sent_at: '2026-08-21T16:30:00'
    }
  ]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      addToast('Error', 'Title and message required.', 'error');
      return;
    }

    setSending(true);
    try {
      await api.sendBroadcastNotification({
        recipient,
        title,
        message,
        type: notifType,
        link: '/applications'
      });

      setSentHistory(prev => [
        {
          id: `DISP_${Date.now()}`,
          recipient: recipient === 'ALL' ? 'All Students' : recipient,
          title,
          message,
          sent_at: new Date().toISOString()
        },
        ...prev
      ]);

      addToast('Broadcast Dispatched', 'Notification sent to candidates.', 'success');
      setTitle('');
      setMessage('');
    } catch (err) {
      addToast('Error', err.message || 'Failed to send notification.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 text-[#F8FAFC]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">Broadcast Notifications</h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Dispatch announcements, drive updates, and deadline reminders to students.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composer Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSendNotification} className="bg-[#151C32] border border-[#27324A] rounded-2xl p-6 sm:p-7 shadow-soft space-y-4 text-xs">
            <h3 className="font-semibold text-xs text-[#F8FAFC]">Compose Broadcast</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Audience</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all cursor-pointer"
                >
                  <option value="ALL">All Students (Batch 2026)</option>
                  <option value="STU001">Rahul Sharma (STU001)</option>
                  <option value="STU002">Priya Nair (STU002)</option>
                  <option value="STU003">Amit Patel (STU003)</option>
                  <option value="STU004">Sneha Roy (STU004)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Category</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all cursor-pointer"
                >
                  <option value="ANNOUNCEMENT">General Announcement</option>
                  <option value="NEW_DRIVE">New Drive Alert</option>
                  <option value="ACTION_REQUIRED">Action Required</option>
                  <option value="INTERVIEW_SCHEDULED">Schedule Update</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Subject</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mandatory Attendance for TCS Digital Drive"
                className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[#CBD5E1] font-medium mb-1">Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write message details for candidate notification..."
                className="w-full bg-[#111827] border border-[#334155] rounded-xl p-3 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all h-28"
                required
              />
            </div>

            <div className="pt-3 border-t border-[#27324A] flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-purple cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Dispatching...' : 'Send Broadcast'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Sent History */}
        <div className="bg-[#151C32] border border-[#27324A] rounded-2xl p-5 shadow-soft space-y-3">
          <h3 className="font-semibold text-xs text-[#F8FAFC]">Dispatched History</h3>

          <div className="space-y-2.5">
            {sentHistory.map(item => (
              <div key={item.id} className="p-3.5 rounded-xl bg-[#0F172A] border border-[#27324A] text-xs space-y-1">
                <div className="font-semibold text-[#F8FAFC] truncate">{item.title}</div>
                <p className="text-[11px] text-[#CBD5E1] line-clamp-2">
                  {item.message}
                </p>
                <div className="text-[10px] text-[#94A3B8] flex items-center justify-between pt-1 border-t border-[#27324A]">
                  <span className="font-medium text-[#A78BFA]">To: {item.recipient}</span>
                  <span>{new Date(item.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
