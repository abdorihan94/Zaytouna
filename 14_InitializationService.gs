function initializeSystem(){
  var headers={
    CONFIG:['key','value'],SEQUENCES:['id','key','value'],USERS:['id','email','name','roles','status'],
    ROLES:['id','code','name','status'],ROLE_PERMISSIONS:['id','role','permission'],
    USER_ASSIGNMENTS:['id','userEmail','entityType','entityId'],ACADEMIC_YEARS:['id','name','status','createdAt','updatedAt'],
    GRADES:['id','name','status','createdAt','updatedAt'],CLASSES:['id','name','status','createdAt','updatedAt'],
    STUDENTS:['id','name','classId','gradeId','status','createdAt','updatedAt'],TEACHERS:['id','name','status','createdAt','updatedAt'],
    SUBJECTS:['id','name','status','createdAt','updatedAt'],CURRICULUM_UNITS:['id','name','status','createdAt','updatedAt'],
    LESSONS:['id','title','lessonCode','status','teacherEmail','subject','grade','unitId','summary','contentJson','version','approvedVersion','publishedVersion','documentFileId','pdfFileId','reviewHistory','createdAt','updatedAt'],
    LESSON_CONTENT:['id','lessonId','section','content','version','createdAt','updatedAt'],
    LESSON_WORKFLOW:['id','lessonId','fromStatus','toStatus','action','actorEmail','comment','metadata','timestamp'],
    EVALUATION_FORMS:['id','title','description','version','status','createdBy','createdAt','updatedAt'],
    EVALUATION_CRITERIA:['id','formId','formVersion','label','description','responseType','optionsJson','required','sortOrder','status','createdAt','updatedAt'],
    EVALUATIONS:['id','studentId','classId','subjectId','formId','formVersion','teacherEmail','academicYearId','status','startedAt','updatedAt','submittedAt','lockedAt'],
    EVALUATION_RESPONSES:['id','evaluationId','criterionId','value','updatedAt'],
    FILES:['id','entityType','entityId','type','fileName','driveFileId','folderPath','mimeType','templateId','templateVersion','version','metadata','status','createdAt','updatedAt'],
    AUDIT_LOG:['id','timestamp','userEmail','action','entity','entityId','before','after'],SYSTEM_LOG:['id','timestamp','level','message','context'],
    BACKUP_JOBS:['id','createdAt','status'],ARCHIVE_INDEX:['id','entity','entityId','archivedAt']
  };
  SHEETS.forEach(function(n){DatabaseService.ensureSheet(n,headers[n]||['id','status','createdAt','updatedAt']);});
  var c=DatabaseService.rows('CONFIG');
  if(!c.some(function(x){return x.key==='MILESTONE';}))DatabaseService.append('CONFIG',{key:'MILESTONE',value:CONFIG.MILESTONE});
  if(!c.some(function(x){return x.key===CONFIG.ACTIVE_LESSON_TEMPLATE_ID_KEY;}))DatabaseService.append('CONFIG',{key:CONFIG.ACTIVE_LESSON_TEMPLATE_ID_KEY,value:''});
  if(!c.some(function(x){return x.key===CONFIG.ACTIVE_LESSON_TEMPLATE_VERSION_KEY;}))DatabaseService.append('CONFIG',{key:CONFIG.ACTIVE_LESSON_TEMPLATE_VERSION_KEY,value:'1.0'});
  var roleRows=DatabaseService.rows('ROLES');
  Object.keys(ROLES).forEach(function(k){if(!roleRows.some(function(r){return r.code===k;}))DatabaseService.append('ROLES',{id:'ROLE-'+k,code:k,name:ROLES[k],status:'ACTIVE'});});
  var permissionRows=DatabaseService.rows('ROLE_PERMISSIONS');
  var permissions=[['ADMIN','VIEW_LESSONS'],['ADMIN','MANAGE_LESSONS'],['ADMIN','REVIEW_LESSONS'],['ADMIN','APPROVE_LESSONS'],['ADMIN','PUBLISH_LESSONS'],['ADMIN','ARCHIVE_LESSONS'],['ADMIN','GENERATE_LESSON_DOCS'],['ADMIN','MANAGE_EVALUATIONS'],['ADMIN','VIEW_EVALUATIONS'],['CURRICULUM','VIEW_LESSONS'],['CURRICULUM','MANAGE_LESSONS'],['CURRICULUM','REVIEW_LESSONS'],['CONTENT','VIEW_LESSONS'],['CONTENT','MANAGE_LESSONS'],['SUPERVISOR','VIEW_LESSONS'],['SUPERVISOR','REVIEW_LESSONS'],['SUPERVISOR','APPROVE_LESSONS'],['MANAGEMENT','VIEW_LESSONS'],['MANAGEMENT','APPROVE_LESSONS'],['MANAGEMENT','PUBLISH_LESSONS'],['MANAGEMENT','ARCHIVE_LESSONS'],['EVALUATION','MANAGE_EVALUATIONS'],['EVALUATION','VIEW_EVALUATIONS'],['TEACHER','VIEW_LESSONS'],['TEACHER','MANAGE_LESSONS'],['TEACHER','VIEW_EVALUATIONS'],['TEACHER','MANAGE_EVALUATIONS']];
  permissions.forEach(function(pair){if(!permissionRows.some(function(r){return r.role===pair[0]&&r.permission===pair[1];}))DatabaseService.append('ROLE_PERMISSIONS',{id:pair[0]+'-'+pair[1],role:pair[0],permission:pair[1]});});
  return diagnostics_();
}
