import cron from 'node-cron';
import dotenv from 'dotenv';
import { processAllNotifications } from './services/notification-service';
dotenv.config();


console.log("[Blip Notification] Cron job is active and will execute daily at 3:00 PM (America/Sao_Paulo).");
// processAllNotifications()
const task = cron.schedule('0 15 * * 1-5', processAllNotifications, {
  timezone: 'America/Sao_Paulo'
});

task.start();
