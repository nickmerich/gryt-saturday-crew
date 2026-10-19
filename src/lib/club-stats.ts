// Single source of truth for GRYT crew counts. Update here only.
// Strava member count read from the public GRYT RUN CLUB page (club 1708552)
// on 2026-09-23. Re-check before quoting it anywhere new.
export const STRAVA_MEMBERS = 104;
export const SATURDAY_REGULARS = 15;
export const INSTAGRAM_FOLLOWERS = 152;

/** "82" */
export const STRAVA_MEMBERS_LABEL = String(STRAVA_MEMBERS);
/** "15-30" */
export const REGULARS_LABEL = "15-30";
/** "123" */
export const INSTAGRAM_LABEL = String(INSTAGRAM_FOLLOWERS);


// All-time club distance from the Strava club page. Earlier screenshot read
// 2,192.1 mi. Copied by hand; update when you re-check.
export const STRAVA_TOTAL_MILES = 2192;
/** "2,192" */
export const STRAVA_TOTAL_MILES_LABEL = STRAVA_TOTAL_MILES.toLocaleString("en-US");
