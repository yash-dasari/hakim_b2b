import { useEffect, useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { performLogout, isLogoutInProgress } from '../lib/logout-utils';
import { useTranslations } from 'next-intl';
import {
  FaArrowLeft,
  FaBars,
  FaBell,
  FaCar,
  FaChartLine,
  FaCreditCard,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
  FaTools
} from 'react-icons/fa';
import NotificationDropdown, { NotificationItem } from './common/NotificationDropdown';
import LanguageSwitcher from './common/LanguageSwitcher';
import { useWebSocket } from '../contexts/WebSocketContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  showWelcomeMessage?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
  breadcrumbs?: React.ReactNode;
  hideDefaultHeaderIcons?: boolean;
}

export default function AdminLayout({ children, title, subtitle, headerActions, showWelcomeMessage = false, showBackButton = false, onBackClick, breadcrumbs, hideDefaultHeaderIcons = false }: AdminLayoutProps) {
  const router = useRouter();
  const t = useTranslations('adminLayout');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ id?: string; email?: string; name?: string; firstName?: string; profilePicture?: string;[key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);
  const redirectingRef = useRef(false);


  // WebSocket Integration (Global)
  const { lastMessage, isConnected } = useWebSocket();
  // We don't need company/accessToken here anymore for WS connection as it's handled in provider
  const { company } = useSelector((state: RootState) => state.auth); // kept for other potential usages if any, or just useAuth

  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Handle incoming WebSocket messages for notifications
  useEffect(() => {
    if (!lastMessage) return;

    let messageText = '';
    let msgType: 'info' | 'success' | 'warning' | 'error' = 'info';
    let referenceId = '';

    // We already have parsed JSON from context
    const rootData = lastMessage;

    console.log('Notification Received (Global):', rootData);

    // Handle initial connection message specially
    if (rootData.type === 'connected') {
      return;
    }

    // Search for message and reference_id in potential locations
    let targetData: any = null;

    if (rootData.data && rootData.data.data && (rootData.data.data.message || rootData.data.data.reference_id)) {
      targetData = rootData.data.data;
    } else if (rootData.data && (rootData.data.message || rootData.data.reference_id)) {
      targetData = rootData.data;
    } else {
      targetData = rootData;
    }

    if (targetData) {
      if (targetData.message) messageText = targetData.message;
      if (targetData.reference_id) referenceId = targetData.reference_id;
      // Also map type if present
      if (targetData.type) msgType = targetData.type;
    }

    // Fallback for type at root if not found in target
    if (msgType === 'info' && rootData.type) {
      msgType = rootData.type;
    }

    // If we have a message, add it to notifications
    if (!messageText && rootData.event_type) {
      messageText = `New ${rootData.event_type.replace('.', ' ')} event`;
    }

    // Final safeguard
    if (messageText && messageText.trim().startsWith('{') && messageText.length > 50) {
      if (referenceId) {
        messageText = "You have a new update";
      } else {
        messageText = "New System Notification";
      }
    } else if (!messageText) {
      // If we really can't find a message logic, skip or generic
      // But for many operational events we might just want to notify
      return;
    }

    const newNotification: NotificationItem = {
      id: Date.now().toString() + Math.random().toString(),
      message: String(messageText),
      type: msgType,
      timestamp: new Date(),
      read: false,
      referenceId: referenceId
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Only increment count if dropdown is closed
    if (!isNotificationsOpen) {
      setNotificationCount(prev => prev + 1);
    }

  }, [lastMessage]); // Removed isNotificationsOpen dependency to avoid stale closure issues if not careful, but setNotificationCount uses func update so it's fine.


  const handleNotificationClick = () => {
    if (!isNotificationsOpen) {
      setNotificationCount(0); // Clear count on open
    }
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    // Prevent multiple checks
    if (hasCheckedRef.current) {
      return;
    }

    // Don't check auth if logout is in progress
    if (isLogoutInProgress()) {
      hasCheckedRef.current = true;
      setLoading(false);
      return;
    }

    // Skip if already on login page - prevent redirect loop
    if (router.pathname === '/login') {
      hasCheckedRef.current = true;
      setLoading(false);
      return;
    }

    // Prevent redirect loops
    if (redirectingRef.current) {
      return;
    }

    const token = Cookies.get('hakim_auth_token');
    const adminData = Cookies.get('admin_user');

    // If no token in cookies, try localStorage as fallback
    let finalToken = token;
    if (!token && typeof window !== 'undefined') {
      const localToken = localStorage.getItem('adminToken') || localStorage.getItem('hakim_auth_token');
      if (localToken) {
        finalToken = localToken;
      }
    }

    if (!finalToken) {
      hasCheckedRef.current = true;
      setLoading(false);
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.push('/login');
      }
      return;
    }

    // If we have admin data in cookies, use it
    if (adminData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(adminData));
        setAdmin(parsed);
        hasCheckedRef.current = true;
        setLoading(false);
      } catch (error) {
        console.error('AdminLayout: Error parsing admin data:', error, adminData);
        // Try localStorage as fallback
        if (typeof window !== 'undefined') {
          const localAdminData = localStorage.getItem('adminUser');
          if (localAdminData) {
            try {
              const adminUser = JSON.parse(localAdminData);
              setAdmin(adminUser);
              Cookies.set('admin_user', localAdminData, { expires: 7 });
              hasCheckedRef.current = true;
              setLoading(false);
              return;
            } catch (e) {
              console.error('AdminLayout: Error parsing local admin data:', e);
            }
          }
        }
        hasCheckedRef.current = true;
        setLoading(false);
        if (!redirectingRef.current) {
          redirectingRef.current = true;
          router.push('/login');
        }
        return;
      }
    } else {
      // If no admin data in cookies, try to get from localStorage (fallback)
      if (typeof window !== 'undefined') {
        const localAdminData = localStorage.getItem('adminUser');
        if (localAdminData) {
          try {
            const adminUser = JSON.parse(localAdminData);
            setAdmin(adminUser);
            // Store in cookies for consistency
            Cookies.set('admin_user', localAdminData, { expires: 7 });
            hasCheckedRef.current = true;
            setLoading(false);
            return;
          } catch (error) {
            console.error('AdminLayout: Error parsing local admin data:', error, localAdminData);
            hasCheckedRef.current = true;
            setLoading(false);
            if (!redirectingRef.current) {
              redirectingRef.current = true;
              router.push('/login');
            }
            return;
          }
        }
      }
      hasCheckedRef.current = true;
      setLoading(false);
      if (!redirectingRef.current) {
        redirectingRef.current = true;
        router.push('/login');
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    // Use comprehensive logout utility that clears all storage and redirects
    performLogout('/login', true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-800">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  // UPDATED MENU ITEMS FOR B2B DASHBOARD
  const menuItems = [
    {
      title: t('menu.dashboard.title'),
      icon: <FaChartLine className="h-5 w-5" />,
      path: '/b2b/dashboard',
      description: t('menu.dashboard.description')
    },
    {
      title: t('menu.services.title'),
      icon: <FaTools className="h-5 w-5" />,
      path: '/b2b/services/requests',
      description: t('menu.services.description')
    },
    {
      title: t('menu.vehicles.title'),
      icon: <FaCar className="h-5 w-5" />,
      path: '/b2b/vehicles',
      description: t('menu.vehicles.description')
    },
    {
      title: t('menu.account.title'),
      icon: <FaUserCircle className="h-5 w-5" />,
      path: '/b2b/account',
      description: t('menu.account.description')
    },
    {
      title: t('menu.finance.title'),
      icon: <FaCreditCard className="h-5 w-5" />,
      path: '/b2b/finance',
      description: t('menu.finance.description')
    }
  ];

  const isActive = (path: string) => {
    // Match exact path or if current path starts with the menu path
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  return (
    <>
      <Head>
        <title>{title} | HAKIM for Business</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex overflow-hidden">
        <Toaster position="top-right" />
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 start-0 z-50 w-64 lg:w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out flex-shrink-0
          ${isSidebarOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full lg:ltr:translate-x-0 lg:rtl:translate-x-0'}
        `} style={{ width: '256px' }}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#FCD34D] flex items-center justify-center rounded-lg">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z" />
                  <path d="M12 10H6v6h6v-6z" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-black tracking-tight text-[#0F172A] leading-none mb-0.5">HAKIM</h1>
                <div className="text-[10px] font-bold tracking-wide uppercase text-[#64748B] leading-none">{t('brand.forBusiness')}</div>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors
                  ${isActive(item.path)
                    ? 'bg-[#FEF3C7] text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={(_e) => {
                  // Only close sidebar on mobile
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                <span className="text-current">
                  {item.icon}
                </span>
                <span className="text-sm">{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {showBackButton && (
                  <button
                    onClick={onBackClick}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaArrowLeft className="h-5 w-5 rtl:rotate-180" />
                  </button>
                )}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaBars className="h-5 w-5" />
                </button>
                {breadcrumbs ? (
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {breadcrumbs}
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-0">{title}</h2>
                    {subtitle && (
                      <div className="text-gray-600 text-sm mt-1">{subtitle}</div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {headerActions}
                <LanguageSwitcher />
                {!hideDefaultHeaderIcons && (
                  <>
                    <button
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors relative"
                      title={t('notifications')}
                      onClick={handleNotificationClick}
                    >
                      <FaBell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <span className="absolute top-1 end-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                      )}

                      <NotificationDropdown
                        notifications={notifications}
                        isOpen={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                        onClearAll={handleClearNotifications}
                      />
                    </button>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity">
                      {admin.profilePicture && typeof admin.profilePicture === 'string' ? (
                        <img
                          src={admin.profilePicture}
                          alt={typeof admin.firstName === 'string' ? admin.firstName : (typeof admin.name === 'string' ? admin.name : t('adminLabel'))}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="h-6 w-6" />
                      )}
                    </div>
                  </>
                )}
                {showWelcomeMessage && (
                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                    <span>{t('welcomeBack')}</span>
                    <span className="font-semibold text-gray-800">
                      {(typeof admin.firstName === 'string' ? admin.firstName : null) || (typeof admin.name === 'string' ? admin.name : null) || (typeof admin.email === 'string' ? admin.email : null) || t('adminLabel')}
                    </span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span className="hidden md:inline">{t('logout')}</span>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 bg-gray-50 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}