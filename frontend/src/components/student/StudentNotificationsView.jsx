import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import { Check, ArrowRight, Bell } from 'lucide-react';

export default function StudentNotificationsView() {
  const { 
    studentNotifications, 
    unreadNotifCount, 
    refreshStudentData, 
    setStudentTab,
    addToast 
  } = usePlacement();

  const handleMarkRead = async (notifId) => {
    try {
      await api.markNotificationRead(notifId);
      await refreshStudentData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await refreshStudentData();
      addToast('Marked Read', 'All notifications marked as read.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 max-w-4xl text-[#F8FAFC]">
      {/* Header */}
      <div className="bg-[#151C32] p-5 sm:p-6 rounded-2xl border border-[#27324A] shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">Notifications</h2>
            {unreadNotifCount > 0 && (
              <span className="text-xs font-semibold text-[#A78BFA] bg-[#7C3AED]/20 px-2.5 py-0.5 rounded-full border border-[#7C3AED]/40">
                {unreadNotifCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Placement announcements, shortlist alerts, and schedule notifications.
          </p>
        </div>

        {unreadNotifCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 border border-[#27324A] hover:border-[#7C3AED] hover:bg-[#1B2340] text-[#CBD5E1] hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {studentNotifications.length === 0 ? (
        <div className="p-12 text-center bg-[#151C32] rounded-2xl border border-[#27324A] shadow-soft text-xs text-[#94A3B8]">
          No notifications at this time.
        </div>
      ) : (
        <div className="bg-[#151C32] rounded-2xl border border-[#27324A] divide-y divide-[#27324A] overflow-hidden text-xs shadow-soft">
          {studentNotifications.map(notif => {
            const isUnread = !notif.is_read;

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  isUnread ? 'bg-[#1B2340]/60 font-medium' : 'bg-[#151C32] text-[#94A3B8]'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {isUnread && <span className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0 animate-pulse" />}
                    <span className={`text-xs ${isUnread ? 'font-semibold text-[#F8FAFC]' : 'text-[#CBD5E1]'}`}>
                      {notif.title}
                    </span>
                  </div>

                  <p className="text-[#CBD5E1] text-xs leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="text-[10px] text-[#64748B]">
                    {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Recent'}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-center">
                  {notif.link && (
                    <button
                      onClick={() => {
                        handleMarkRead(notif.id);
                        if (notif.link.includes('drive')) setStudentTab('drives');
                        else setStudentTab('applications');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#27324A] hover:border-[#7C3AED] hover:bg-[#1B2340] text-[#A78BFA] font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1.5 text-[#94A3B8] hover:text-[#A78BFA] cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
