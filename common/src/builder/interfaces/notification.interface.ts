/**
 * Basic interface for dispatching notifications to the application.
 */
export interface JsfNotificationInterface {
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  title?: string;
}
