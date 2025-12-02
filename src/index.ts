import cron from 'node-cron';
import dotenv from 'dotenv';
import { processAllNotifications } from './services/notification-service';
import { processAllSankhyaNotifications } from './services/notification-sankhya-service';
dotenv.config();


console.log("[Cogni Notification] Cron job is active and will execute daily at 3:00 PM (America/Sao_Paulo).");
// processAllNotifications()
const task = cron.schedule('0 15 * * 1-5', processAllNotifications, {
  timezone: 'America/Sao_Paulo'
});

task.start();

console.log("[Sankhya Notification] Cron job is active and will execute daily at 3:00 PM (America/Sao_Paulo).");
// processAllSankhyaNotifications()
const sankhyaTask = cron.schedule('0 15 * * 1-5', processAllSankhyaNotifications, {
  timezone: 'America/Sao_Paulo'
});

sankhyaTask.start();
