import { supabase } from './supabase';

export const reportIncident = async (params: {
  source: string;
  errorMessage: string;
  errorStack?: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: any;
}) => {
  try {
    const { source, errorMessage, errorStack, severity, metadata } = params;

    // Log the incident in database
    const { error: logErr } = await supabase
      .from('incident_logs')
      .insert({
        source,
        error_message: errorMessage,
        error_stack: errorStack || null,
        severity,
        metadata: metadata || {}
      });

    if (logErr) {
      console.error("Failed to write to incident_logs:", logErr);
    }

    // Trigger auto-maintenance mode if critical
    const isAdmin = typeof window !== 'undefined' && localStorage.getItem('is_admin_mode') === 'true';
    if (severity === 'critical' && !isAdmin && !logErr) {
      console.warn("⚠️ CRITICAL INCIDENT REPORTED! Triggering auto-maintenance mode.");
      
      const { error: maintErr } = await supabase
        .from('maintenance_config')
        .upsert({
          id: 1,
          is_active: true,
          reason: `Système suspendu automatiquement suite à un incident critique (${source}) : ${errorMessage}`
        });

      if (maintErr) {
        console.error("Failed to automatically lock database for maintenance:", maintErr);
      } else {
        // Dispatch event locally so the UI updates in real-time if open
        window.dispatchEvent(new Event('portfolio_config_updated'));
      }
    }
  } catch (err) {
    console.error("Error in incident logger helper:", err);
  }
};
