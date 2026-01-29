import cron from 'node-cron';
import { GoogleSheetsService } from './sheets.service';
import { prisma } from '../lib/prisma';

/**
 * Auto-sync scheduler for Google Sheets
 * Runs every 15 minutes to sync unsynced leads
 */
export class SyncScheduler {
  private static task: cron.ScheduledTask | null = null;

  /**
   * Start the auto-sync scheduler
   */
  static start() {
    if (this.task) {
      console.log('⚠️ [Sync Scheduler] Already running');
      return;
    }

    // Run every 15 minutes
    this.task = cron.schedule('*/15 * * * *', async () => {
      await this.syncAllUsers();
    });

    console.log('✅ [Sync Scheduler] Started - will run every 15 minutes');

    // Also run immediately on startup (after 30 seconds)
    setTimeout(() => {
      this.syncAllUsers();
    }, 30000);
  }

  /**
   * Stop the auto-sync scheduler
   */
  static stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
      console.log('🛑 [Sync Scheduler] Stopped');
    }
  }

  /**
   * Sync unsynced leads for all users with Google Sheets connected
   */
  static async syncAllUsers() {
    try {
      console.log('🔄 [Sync Scheduler] Starting sync for all users...');

      // Get all users with Google Sheets connected and sync enabled
      const connections = await prisma.googleSheetsConnection.findMany({
        where: {
          syncEnabled: true,
          spreadsheetId: { not: null },
        },
        select: {
          userId: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      if (connections.length === 0) {
        console.log('ℹ️ [Sync Scheduler] No users with sync enabled');
        return;
      }

      console.log(`📊 [Sync Scheduler] Found ${connections.length} users with sync enabled`);

      let totalSynced = 0;
      let successCount = 0;
      let errorCount = 0;

      // Sync each user's leads
      for (const connection of connections) {
        try {
          const syncedCount = await GoogleSheetsService.syncUnsyncedLeads(connection.userId);
          
          if (syncedCount > 0) {
            console.log(`✅ [Sync Scheduler] Synced ${syncedCount} leads for ${connection.user.email}`);
            totalSynced += syncedCount;
            successCount++;
          }
        } catch (error: any) {
          console.error(`❌ [Sync Scheduler] Error syncing for ${connection.user.email}:`, error.message);
          errorCount++;

          // Check if token expired
          if (error.message?.includes('expired') || error.message?.includes('invalid')) {
            console.log(`⚠️ [Sync Scheduler] Token expired for ${connection.user.email} - user needs to reconnect`);
            
            // Optionally disable sync until user reconnects
            await prisma.googleSheetsConnection.update({
              where: { userId: connection.userId },
              data: { syncEnabled: false },
            });
          }
        }
      }

      console.log(`✅ [Sync Scheduler] Completed - ${totalSynced} total leads synced across ${successCount} users (${errorCount} errors)`);
    } catch (error: any) {
      console.error('❌ [Sync Scheduler] Fatal error:', error);
    }
  }

  /**
   * Manually trigger sync for all users (for testing)
   */
  static async triggerManualSync() {
    console.log('🔄 [Sync Scheduler] Manual sync triggered');
    await this.syncAllUsers();
  }
}
