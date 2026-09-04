// Milestone 5: teacher-facing workspace access control.
// A plain TEACHER only has REVIEW_LESSONS/APPROVE_LESSONS/PUBLISH_LESSONS/
// ARCHIVE_LESSONS withheld by ROLE_PERMISSIONS, so "elevated" reviewers
// (ADMIN/CURRICULUM/SUPERVISOR/MANAGEMENT) can see every lesson for review
// purposes, while everyone else is scoped to lessons they authored plus any
// lesson that has already reached the PUBLISHED status.
var __lessonPermissionsCache_ = null;
var __lessonPermissionsCacheEmail_ = null;
// Memoized per current user email so a single request that calls this
// multiple times (list -> authorize -> visibility checks) only reads
// ROLE_PERMISSIONS once, while still staying safe if the underlying Apps
// Script container is ever reused across a different user's execution.
function currentLessonPermissions_(){var email=currentEmail_();if(__lessonPermissionsCache_&&__lessonPermissionsCacheEmail_===email)return __lessonPermissionsCache_;var roles=UserRoleService.current().roles||[];var perms=roles.indexOf('ADMIN')>=0?{__admin:true}:{};if(!perms.__admin){var rows=DatabaseService.rows('ROLE_PERMISSIONS');rows.forEach(function(r){if(roles.indexOf(r.role)>=0)perms[r.permission]=true;});}__lessonPermissionsCache_=perms;__lessonPermissionsCacheEmail_=email;return perms;}

function hasElevatedLessonAccess_(){var perms=currentLessonPermissions_();return !!(perms.__admin||perms.REVIEW_LESSONS||perms.APPROVE_LESSONS||perms.PUBLISH_LESSONS||perms.ARCHIVE_LESSONS);}

function lessonVisibilityContext_(){return {elevated:hasElevatedLessonAccess_(),email:currentEmail_()};}

// Single shared predicate for "can this caller see this lesson row" so the
// list filter and the single-record check can never drift apart.
function lessonOwnedOrVisible_(lesson, context){if(!lesson)return false;context=context||{};if(context.elevated)return true;var email=String(context.email||'').toLowerCase();return String(lesson.teacherEmail||'').toLowerCase()===email||String(lesson.status)==='PUBLISHED';}

// Pure filtering function kept separate from Apps Script services so it can
// be exercised directly (see /tmp verification harness) without Session/
// SpreadsheetApp/DriveApp being available.
function filterLessonsByVisibility_(rows, context){context=context||{};if(context.elevated)return rows;return (rows||[]).filter(function(r){return lessonOwnedOrVisible_(r,context);});}

// Allows the teacher who authored a lesson to perform an action (e.g. submit
// their own draft for review) even without the broader reviewer permission,
// while still requiring the full permission for anyone acting on someone
// else's lesson. This keeps REVIEW_LESSONS/APPROVE_LESSONS/etc. meaningful
// for reviewers without blocking the teacher workspace's own submit action.
function authorizeLessonSelfOrPermission_(permission, lesson){var perms=currentLessonPermissions_();if(perms.__admin||perms[permission])return true;if(perms.MANAGE_LESSONS&&lesson&&String(lesson.teacherEmail||'').toLowerCase()===currentEmail_())return true;logSystem_('WARN','Permission denied',{permission:permission,userEmail:currentEmail_()});throw Error('لا تملك صلاحية تنفيذ هذه العملية');}

function listLessons(filters){authorize_('VIEW_LESSONS');ensureLessonSchema_();var rows=DatabaseService.rows('LESSONS');filters=filters||{};var query=safeText_(filters.query||'').toLowerCase();var status=safeText_(filters.status||'');var sort=safeText_(filters.sort||'updatedAt');var pageSize=Number(filters.pageSize||25)||25;var page=Number(filters.page||1)||1;var mineOnly=!!filters.mineOnly;if(mineOnly){var email=currentEmail_();rows=rows.filter(function(r){return String(r.teacherEmail||'').toLowerCase()===email;});}else{rows=filterLessonsByVisibility_(rows,lessonVisibilityContext_());}rows=rows.filter(function(r){var matches=!status||String(r.status)===status;if(!matches)return false;if(!query)return true;return JSON.stringify(r).toLowerCase().indexOf(query)>=0;});if(sort==='title'){rows=rows.sort(function(a,b){return String(a.title||'').localeCompare(String(b.title||''));});}else if(sort==='status'){rows=rows.sort(function(a,b){return String(a.status||'').localeCompare(String(b.status||''));});}else {rows=rows.sort(function(a,b){return new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0);});}var start=(page-1)*pageSize;return rows.slice(start,start+pageSize);}

// Teacher workspace: always scoped to lessons authored by the caller,
// regardless of any elevated review/approve/publish role they might also hold.
function listMyLessons(filters){authorize_('VIEW_LESSONS');filters=filters||{};var scoped={};Object.keys(filters).forEach(function(k){scoped[k]=filters[k];});scoped.mineOnly=true;return listLessons(scoped);}
