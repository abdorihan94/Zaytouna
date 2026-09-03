
function diagnostics_(){var ss=DatabaseService.spreadsheet();return {spreadsheet:ss.getId(),sheets:SHEETS.filter(function(n){return !!ss.getSheetByName(n);}),milestone:CONFIG.MILESTONE,lessonStatuses:LESSON_STATUSES,lessonTransitions:LESSON_STATUS_TRANSITIONS};}
function runDiagnostics(){return envelope_(true,diagnostics_(),'تم تشغيل الفحص');}
function runLessonDiagnostics(){var summary={milestone:CONFIG.MILESTONE,validDraftTransition:lessonTransitionAllowed_('DRAFT','SUBMITTED'),validReviewTransition:lessonTransitionAllowed_('UNDER_REVIEW','APPROVED'),validRevisionTransition:lessonTransitionAllowed_('REVISION_REQUIRED','SUBMITTED'),invalidTransition:lessonTransitionAllowed_('DRAFT','APPROVED')};return envelope_(true,summary,'تم تشغيل تشخيص سير الدروس');}
