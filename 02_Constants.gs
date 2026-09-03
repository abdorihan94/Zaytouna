
var SHEETS = ['CONFIG','SEQUENCES','USERS','ROLES','ROLE_PERMISSIONS','USER_ASSIGNMENTS','ACADEMIC_YEARS','GRADES','CLASSES','STUDENTS','TEACHERS','SUBJECTS','CURRICULUM_UNITS','LESSONS','LESSON_CONTENT','LESSON_WORKFLOW','EVALUATION_FORMS','EVALUATION_CRITERIA','EVALUATIONS','EVALUATION_RESPONSES','REPORTS','FILES','AUDIT_LOG','SYSTEM_LOG','BACKUP_JOBS','ARCHIVE_INDEX'];
var ID_PREFIXES = {student:'STD',teacher:'TCH',lesson:'LES',evaluation:'EVA',report:'RPT',academicYear:'ACY',grade:'GRD',class:'CLS',subject:'SUB',curriculumUnit:'UNT'};
var LESSON_STATUSES = {DRAFT:'مسودة',SUBMITTED:'مرسلة للمراجعة',UNDER_REVIEW:'قيد المراجعة',REVISION_REQUIRED:'تحتاج إلى تعديل',APPROVED:'معتمدة',PUBLISHED:'منشورة',ARCHIVED:'مؤرشفة'};
var EVALUATION_STATUSES = {NOT_STARTED:'لم تبدأ',IN_PROGRESS:'قيد التنفيذ',SUBMITTED:'مرسلة',LOCKED:'مغلقة',ARCHIVED:'مؤرشفة'};
var ROLES = {ADMIN:'مدير النظام',CURRICULUM:'مسؤول المناهج والتنسيق',CONTENT:'فريق إعداد المحتوى',EVALUATION:'فريق التصميم والتقييم',TEACHER:'المعلم',SUPERVISOR:'المشرف / المنسق',MANAGEMENT:'الإدارة'};
var DRIVE_FOLDERS = ['01 خطط الدروس','02 PDF الدروس','03 تقارير الطلاب','04 ملفات التقييم','05 القوالب','06 النسخ الاحتياطية','07 الأرشيف','08 ملفات النظام'];
