import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Truck,
  Package,
  Clock,
  Calendar,
  AlertCircle,
  Check,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/formatters';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      // quiet fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for updates every 25 seconds when user is logged in
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.put(`/api/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      }
      setIsOpen(false);
      if (notif.order_id) {
        navigate(`/track/${notif.order_id}`);
      } else {
        navigate('/orders');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        title="Notifications"
        id="notification-bell-btn"
        aria-label="View notifications"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-fade-in-down">
          {/* Header */}
          <div className="p-3.5 px-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Notifications ({unreadCount} new)
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-primary-300 hover:text-white flex items-center gap-1 font-semibold transition-colors"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No notifications yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  You will receive updates when your order payment is verified.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.is_read;
                const isDelivery = notif.type === 'delivery' || notif.title?.includes('Status');
                const isSuccess = notif.title?.includes('Verified') || notif.title?.includes('Confirmed');

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 px-4 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60 flex items-start gap-3 ${
                      isUnread
                        ? 'bg-primary-50/40 dark:bg-primary-950/20'
                        : ''
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSuccess
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : isDelivery
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isDelivery ? (
                        <Truck className="w-4 h-4" />
                      ) : (
                        <Package className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p
                          className={`text-xs font-bold truncate ${
                            isUnread
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Expected Delivery Tag if present */}
                      {notif.metadata?.expected_delivery_date && (
                        <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                          <Calendar className="w-3 h-3" /> Delivery: {notif.metadata.expected_delivery_date}
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                        <span>{formatDateTime(notif.created_at)}</span>
                        {notif.order_id && (
                          <span className="text-primary-600 dark:text-primary-400 font-semibold inline-flex items-center gap-0.5">
                            Track live <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/orders');
              }}
              className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
            >
              View All Orders &amp; Track Status →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
