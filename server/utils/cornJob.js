import cron from 'node-cron';
import { cleanupOldSlots } from '../controllers/slotsManager-controller.js';
export const startCronJobs = () => {
  // Cleanup expired slots every 12 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('⏰ Running old slot cleanup...');
    await cleanupOldSlots();
  });

  console.log('🚀 Cron jobs initialized');
};
