import cron from 'node-cron';
import { processAllNotifications } from '../services/notification-service';

// processAllNotifications()
const task = cron.schedule('0 15 * * 1-5', processAllNotifications, {
  timezone: 'America/Sao_Paulo'
});

task.start();
