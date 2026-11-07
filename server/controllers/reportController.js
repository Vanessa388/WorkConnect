// controllers/reportController.js - Customer Complaints & Worker Reports
const supabase = require('../config/supabase');

/**
 * POST /api/reports
 * Customer submits a report / complaint against an artisan
 */
exports.createReport = async (req, res) => {
  try {
    const {
      worker_id,
      reporter_name = 'Anonymous Customer',
      reporter_email = '',
      reporter_phone = '',
      reason,
      details,
    } = req.body;

    if (!worker_id) {
      return res.status(400).json({ success: false, message: 'Worker ID is required.' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please select a reason for the report.' });
    }

    if (!details || !details.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe what happened in detail.' });
    }

    // Verify the worker exists in Supabase
    const { data: worker, error: workerErr } = await supabase
      .from('workers')
      .select('id, name')
      .eq('id', worker_id)
      .maybeSingle();

    if (workerErr || !worker) {
      return res.status(404).json({ success: false, message: 'Artisan not found.' });
    }

    // Insert report into reports table
    const { data: newReport, error: insertError } = await supabase
      .from('reports')
      .insert([
        {
          worker_id: worker_id,
          reporter_name: reporter_name.trim(),
          reporter_email: reporter_email.trim(),
          reporter_phone: reporter_phone.trim(),
          reason: reason.trim(),
          details: details.trim(),
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting report:', insertError.message);
      return res.status(500).json({
        success: false,
        message: `Could not save report: ${insertError.message}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. WorkConnect administrators will review this incident.',
      report: newReport,
    });
  } catch (err) {
    console.error('Server error in createReport:', err.message);
    res.status(500).json({ success: false, message: 'Server error processing report.' });
  }
};

/**
 * GET /api/reports
 * Admin fetches all reports, with associated worker details
 */
exports.getAllReports = async (req, res) => {
  try {
    // 1. Fetch all reports
    let { data: reports, error: reportsErr } = await supabase
      .from('reports')
      .select('*')
      .order('id', { ascending: false });

    if (reportsErr) {
      console.error('Error fetching reports:', reportsErr.message);
      return res.status(500).json({
        success: false,
        message: reportsErr.message,
        reports: [],
      });
    }

    if (!reports || reports.length === 0) {
      return res.json({ success: true, count: 0, reports: [] });
    }

    // 2. Fetch associated workers to join details safely
    const workerIds = [...new Set(reports.map((r) => r.worker_id).filter(Boolean))];
    let workersMap = {};

    if (workerIds.length > 0) {
      const { data: workersList } = await supabase
        .from('workers')
        .select('id, name, skill, location, phone, image, verified, banned')
        .in('id', workerIds);

      if (workersList) {
        workersList.forEach((w) => {
          workersMap[w.id] = w;
        });
      }
    }

    // Combine report with worker info
    const enrichedReports = reports.map((r) => ({
      ...r,
      worker: workersMap[r.worker_id] || {
        id: r.worker_id,
        name: 'Unknown Worker',
        skill: 'Artisan',
        banned: false,
      },
    }));

    res.json({
      success: true,
      count: enrichedReports.length,
      reports: enrichedReports,
    });
  } catch (err) {
    console.error('Server error in getAllReports:', err.message);
    res.status(500).json({ success: false, message: 'Server error', reports: [] });
  }
};

/**
 * PATCH /api/reports/:id
 * Admin updates report status ('pending', 'resolved', 'dismissed') or adds admin notes
 */
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { data, error } = await supabase
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      message: 'Report status updated.',
      report: data,
    });
  } catch (err) {
    console.error('Server error in updateReport:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

