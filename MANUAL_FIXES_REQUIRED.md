
# Manual Fixes Required

This document lists all the issues that require manual intervention.

## Issue #1: Inconsistent Route Naming

*   **Severity:** Low
*   **Location:** `routers/api.js`
*   **Description:** The API routes use a mix of Portuguese and English names (e.g., `/usuarios`, `/espacos`, `/amenities`).
*   **Impact:** This makes the API less consistent and harder to use.
*   **Recommended Fix:** Standardize all route names to English for consistency.
*   **Time Estimate:** 15 minutes

## Issue #2: Inconsistent Logging Format

*   **Severity:** Low
*   **Location:** `controllers/api/spaceAmenityController.js`
*   **Description:** The logging format in `associateAmenity` and `disassociateAmenity` was inconsistent. This has been partially fixed, but a full review of the logging strategy is recommended.
*   **Impact:** Inconsistent logs can make it harder to debug issues.
*   **Recommended Fix:** Implement a centralized logging service (e.g., Winston) and use a consistent logging format throughout the application.
*   **Time Estimate:** 30 minutes
