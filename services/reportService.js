// Report service layer: wraps Firestore operations with business logic
import {
    createReport as firestoreCreateReport,
    deleteReport as firestoreDeleteReport,
    updateReport as firestoreUpdateReport,
    getAllReports,
    getReport,
    getReportsByReporter,
    getReportsByStatus,
    getReportsByTarget,
    getReportsByType,
    updateReportStatus,
} from '../firebase/firestore';

// Valid report statuses
export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

// Valid report target types
export const REPORT_TARGET_TYPE = {
  LISTING: 'listing',
  USER: 'user',
};

// ==================== CREATE ====================

/**
 * Submit a new report
 * @param {Object} reportData - Report data
 * @param {string} reportData.reporterId - ID of the user submitting the report
 * @param {string} reportData.targetId - ID of the listing/user being reported
 * @param {string} reportData.targetType - Type of target ('listing' or 'user')
 * @param {string} reportData.reason - Reason for the report
 * @param {string} [reportData.details] - Additional details
 * @param {string} [reportData.productTitle] - Title of the product if reporting a listing
 * @returns {Promise<string>} The ID of the created report
 */
export const submitReport = async (reportData) => {
  // Validate required fields
  if (!reportData.reporterId) {
    throw new Error('Reporter ID is required');
  }
  if (!reportData.targetId) {
    throw new Error('Target ID is required');
  }
  if (!reportData.targetType || !Object.values(REPORT_TARGET_TYPE).includes(reportData.targetType)) {
    throw new Error('Valid target type is required (listing or user)');
  }
  if (!reportData.reason) {
    throw new Error('Report reason is required');
  }

  const report = {
    reporterId: reportData.reporterId,
    targetId: reportData.targetId,
    targetType: reportData.targetType,
    reason: reportData.reason,
    details: reportData.details || '',
    productTitle: reportData.productTitle || null,
    status: REPORT_STATUS.PENDING,
  };

  return await firestoreCreateReport(report);
};

// ==================== READ ====================

/**
 * Get a single report by ID
 * @param {string} reportId - The report ID
 * @returns {Promise<Object>} The report data
 */
export const getReportById = async (reportId) => {
  return await getReport(reportId);
};

/**
 * Get all reports (admin use)
 * @returns {Promise<Array>} Array of all reports
 */
export const fetchAllReports = async () => {
  return await getAllReports();
};

/**
 * Get reports submitted by a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of reports by this user
 */
export const getMyReports = async (userId) => {
  return await getReportsByReporter(userId);
};

/**
 * Get reports against a specific target (listing or user)
 * @param {string} targetId - The target ID
 * @returns {Promise<Array>} Array of reports against this target
 */
export const getReportsForTarget = async (targetId) => {
  return await getReportsByTarget(targetId);
};

/**
 * Get reports by status
 * @param {string} status - The status to filter by
 * @returns {Promise<Array>} Array of reports with this status
 */
export const getReportsByStatusFilter = async (status) => {
  if (!Object.values(REPORT_STATUS).includes(status)) {
    throw new Error('Invalid status');
  }
  return await getReportsByStatus(status);
};

/**
 * Get pending reports (convenience method)
 * @returns {Promise<Array>} Array of pending reports
 */
export const getPendingReports = async () => {
  return await getReportsByStatus(REPORT_STATUS.PENDING);
};

/**
 * Get reports by target type (listing or user)
 * @param {string} targetType - The target type
 * @returns {Promise<Array>} Array of reports of this type
 */
export const getReportsByTargetType = async (targetType) => {
  if (!Object.values(REPORT_TARGET_TYPE).includes(targetType)) {
    throw new Error('Invalid target type');
  }
  return await getReportsByType(targetType);
};

// ==================== UPDATE ====================

/**
 * Update a report
 * @param {string} reportId - The report ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateReport = async (reportId, updates) => {
  // Don't allow updating certain fields directly
  const { reporterId, targetId, targetType, createdAt, ...safeUpdates } = updates;
  return await firestoreUpdateReport(reportId, safeUpdates);
};

/**
 * Mark a report as reviewed
 * @param {string} reportId - The report ID
 * @param {string} [adminNotes] - Admin notes
 * @returns {Promise<void>}
 */
export const markAsReviewed = async (reportId, adminNotes = null) => {
  return await updateReportStatus(reportId, REPORT_STATUS.REVIEWED, adminNotes);
};

/**
 * Resolve a report
 * @param {string} reportId - The report ID
 * @param {string} [adminNotes] - Admin notes
 * @returns {Promise<void>}
 */
export const resolveReport = async (reportId, adminNotes = null) => {
  return await updateReportStatus(reportId, REPORT_STATUS.RESOLVED, adminNotes);
};

/**
 * Dismiss a report
 * @param {string} reportId - The report ID
 * @param {string} [adminNotes] - Admin notes
 * @returns {Promise<void>}
 */
export const dismissReport = async (reportId, adminNotes = null) => {
  return await updateReportStatus(reportId, REPORT_STATUS.DISMISSED, adminNotes);
};

// ==================== DELETE ====================

/**
 * Delete a report
 * @param {string} reportId - The report ID
 * @returns {Promise<void>}
 */
export const deleteReport = async (reportId) => {
  return await firestoreDeleteReport(reportId);
};

// ==================== UTILITY ====================

/**
 * Check if a user has already reported a target
 * @param {string} reporterId - The reporter's user ID
 * @param {string} targetId - The target ID
 * @returns {Promise<boolean>} True if already reported
 */
export const hasAlreadyReported = async (reporterId, targetId) => {
  const reports = await getReportsByReporter(reporterId);
  return reports.some(report => report.targetId === targetId);
};

/**
 * Get report count for a target
 * @param {string} targetId - The target ID
 * @returns {Promise<number>} Number of reports
 */
export const getReportCount = async (targetId) => {
  const reports = await getReportsByTarget(targetId);
  return reports.length;
};

