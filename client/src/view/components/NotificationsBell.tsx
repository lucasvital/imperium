import { useState } from 'react';
import { DropdownMenu } from './DropdownMenu';
import { useNotifications } from '../../shared/hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../shared/utils/formatDate';
import { BellIcon, TrashIcon } from '@radix-ui/react-icons';
import { cn } from '../../shared/utils/cn';
import { Spinner } from './Spinner';

export function NotificationsBell() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    isMarkingAllAsRead,
  } = useNotifications({ read: false });

  const unreadNotifications = notifications;

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleRemove = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeNotification(notificationId);
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger>
        <div className="relative cursor-pointer">
          <div className="rounded-full bg-teal-50 dark:bg-gray-700 w-10 h-10 flex items-center justify-center border border-teal-100 dark:border-gray-600 hover:bg-teal-100 dark:hover:bg-gray-600 transition-colors">
            <BellIcon className="w-5 h-5 text-teal-900 dark:text-white" />
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="w-96 max-h-[500px] overflow-y-auto dark:bg-gray-700"
        side="bottom"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {t('notifications.title')}
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 disabled:opacity-50"
            >
              {isMarkingAllAsRead ? (
                <Spinner className="w-4 h-4" />
              ) : (
                t('notifications.markAllAsRead')
              )}
            </button>
          )}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!isLoading && unreadNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BellIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('notifications.empty')}
            </p>
          </div>
        )}

        {!isLoading && unreadNotifications.length > 0 && (
          <div className="py-2">
            {unreadNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'px-4 py-3 border-b border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors',
                  !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                )}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(new Date(notification.createdAt), t)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleRemove(notification.id, e)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors"
                      title={t('notifications.delete')}
                    >
                      <TrashIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

