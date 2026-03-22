import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from '../../types';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleReminder(reminder: Reminder): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    // Cancel existing notifications for this reminder
    await this.cancelReminder(reminder.id);

    // Schedule for each enabled day
    const notifIds: string[] = [];

    for (const day of reminder.days) {
      const [hour, minute] = reminder.time.split(':').map(Number);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.label,
          body: this.getNotificationBody(reminder.type),
          data: { reminderId: reminder.id, type: reminder.type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day === 0 ? 1 : day + 1, // Expo uses 1=Sun, 2=Mon...
          hour,
          minute,
        },
      });

      notifIds.push(id);
    }

    return notifIds[0] ?? null;
  }

  async cancelReminder(reminderId: string) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.reminderId === reminderId) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  }

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async scheduleDefaultReminders(userId: string) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const defaults: Omit<Reminder, 'id' | 'user_id' | 'created_at'>[] = [
      {
        type: 'meal',
        label: 'Breakfast time 🌅',
        time: '08:00',
        days: [1, 2, 3, 4, 5],
        enabled: true,
      },
      {
        type: 'meal',
        label: 'Lunch time ☀️',
        time: '13:00',
        days: [1, 2, 3, 4, 5],
        enabled: true,
      },
      {
        type: 'meal',
        label: 'Dinner time 🌙',
        time: '19:00',
        days: [1, 2, 3, 4, 5, 6, 7],
        enabled: true,
      },
      {
        type: 'weigh_in',
        label: 'Time to weigh in ⚖️',
        time: '07:30',
        days: [2, 5], // Mon, Thu
        enabled: true,
      },
    ];

    for (const reminder of defaults) {
      await this.scheduleReminder({
        id: `default_${reminder.type}_${reminder.time}`,
        user_id: userId,
        created_at: new Date().toISOString(),
        ...reminder,
      });
    }
  }

  private getNotificationBody(type: Reminder['type']): string {
    switch (type) {
      case 'meal': return 'Don\'t forget to log your meal 📝';
      case 'water': return 'Stay hydrated! Log your water intake 💧';
      case 'weigh_in': return 'Morning weigh-in reminder. Step on the scale! ⚖️';
    }
  }
}

export const notificationService = new NotificationService();
