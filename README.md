# زيتونة — بوابة المناهج والتدريس

بوابة Google Apps Script عربية RTL لإدارة البيانات الأساسية وسير الدروس داخل المدرسة. **MILESTONE = 4.0.0**

## 1) الهندسة المعمارية

المشروع ما يزال بنية مسطحة من خدمات Apps Script متخصصة، مع إعادة استخدام الخدمات الراسخة:

- `01_Config.gs` / `02_Constants.gs`: التهيئة والثوابت والحالات المركزية.
- `03_UtilityService.gs` / `04_SystemLogService.gs` / `05_AuditService.gs`: وظائف الحماية، السجل النظامي، والتدقيق.
- `06_DatabaseService.gs`: الوصول إلى Google Sheets وبناء الجداول.
- `07_ValidationService.gs` / `08_IdGeneratorService.gs`: التحقق وتوليد المعرفات.
- `09_AuthFoundationService.gs` / `10_UserRoleService.gs` / `17_AuthorizationService.gs`: الهوية والأدوار والتفويض الخادمي.
- `11_DriveService.gs` / `12_DocumentService.gs`: طبقة Google Drive/Docs.
- `14_InitializationService.gs`: إنشاء الجداول والتهيئة الآمنة.
- `15_DiagnosticsService.gs`: الفحص المبدئي.
- `16_AppController.gs`: نقطة دخول API.
- `18_MasterDataService.gs` / `19_StudentService.gs` / `20_TeacherService.gs` / `21_CurriculumService.gs`: خدمات البيانات الأساسية.
- `22_LessonFoundationService.gs` / `23_LessonWorkflowService.gs`: مكوّنات ومتطلبات Milestone 4.

التجميع الحالي يفضل الجداول المسبقة في Sheets مع وضع البيانات في `LESSONS`, `LESSON_CONTENT`, `LESSON_WORKFLOW`, و`FILES`, بدل إنشاء عمليات حذف أو تحديثات مدمرة.

## 2) تقييم Milestone 4 (الداخلية)

- بنية المشروع قائمة على طبقات مستقلة، ومشروعة للاستخدام في تطبيق School Portal.
- الخدمات الحالية قادرة على إعادة الاستخدام دون إنشاء خدمات مكرّرة: `DatabaseService`, `DriveService`, `DocumentService`, `UserRoleService`, `audit_`, `logSystem_`.
- هيكل الدروس موجود سابقاً في الجداول الأساسية، ولكن سير العمل كان غير مركزي وبلا قواعد انتقال صارمة.
- الحاجة الأساسية في Milestone 4: إنشاء `LessonWorkflowService` مركزية، حماية الإجراءات من جانب الخادم، وتسجيل كل انتقال/حالة/توليد ملف في `LESSON_WORKFLOW` و`AUDIT_LOG` مع الحفاظ على السجل التاريخي.
- لا توجد تعارضات جوهرية مع البنية الحالية؛ التغييرات تم تصميمها على نفس الطبقات وبدون حذف سجلات موجودة.
- تم إضافة جداول/حقول فقط عند الضرورة: `LESSON_WORKFLOW` وحقول `version`, `approvedVersion`, `publishedVersion`, `documentFileId`, `pdfFileId` داخل `LESSONS` و`FILES`.

## 3) مصفوفة حالات الدروس

قيمة الحالة المعتمدة مركزياً في `LESSON_STATUSES` و`LESSON_STATUS_TRANSITIONS`:

- `DRAFT` -> `SUBMITTED`
- `SUBMITTED` -> `UNDER_REVIEW` (إن كان هناك مراجعة صريحة)
- `UNDER_REVIEW` -> `APPROVED`
- `UNDER_REVIEW` -> `REVISION_REQUIRED`
- `REVISION_REQUIRED` -> `SUBMITTED`
- `APPROVED` -> `PUBLISHED`
- `PUBLISHED` -> `ARCHIVED`

الانتقالات غير المسموح بها تُرفض من جانب الخادم، ولا يتم السماح بالتجاوز من الواجهة فقط.

## 4) الأذونات

التحقق الخادمي استخدم نفس بنية `authorize_()`:

- `MANAGE_LESSONS`: إنشاء أو حفظ المسودة.
- `REVIEW_LESSONS`: إرسال الدرس للمراجعة، طلب التعديل، أو بدء المراجعة.
- `APPROVE_LESSONS`: اعتماد الدرس.
- `PUBLISH_LESSONS`: النشر.
- `ARCHIVE_LESSONS`: الأرشفة.
- `GENERATE_LESSON_DOCS`: إنشاء ملف Google Doc وPDF.

الأدوار الأساسية التي تم تهيئتها عند التشغيل: `ADMIN`, `CURRICULUM`, `CONTENT`, `SUPERVISOR`, `MANAGEMENT`, `TEACHER`.

## 5) مخطط الجداول / الترقية الآمنة

يتم تنفيذ التهيئة في `initializeSystem()` مع دعم إنشاء الجداول المفقودة فقط، دون حذف أو إفراغ البيانات الحالية. تم إضافة حقول الطور الجديد بالتدرج الآمن:

- `LESSONS`: `id`, `title`, `lessonCode`, `status`, `teacherEmail`, `subject`, `grade`, `unitId`, `summary`, `contentJson`, `version`, `approvedVersion`, `publishedVersion`, `documentFileId`, `pdfFileId`, `reviewHistory`, `createdAt`, `updatedAt`
- `LESSON_CONTENT`: `id`, `lessonId`, `section`, `content`, `version`, `createdAt`, `updatedAt`
- `LESSON_WORKFLOW`: `id`, `lessonId`, `fromStatus`, `toStatus`, `action`, `actorEmail`, `comment`, `metadata`, `timestamp`
- `FILES`: `id`, `entityType`, `entityId`, `type`, `fileName`, `driveFileId`, `folderPath`, `mimeType`, `templateId`, `templateVersion`, `version`, `metadata`, `status`, `createdAt`, `updatedAt`

يُحفظ كل سجل تاريخي في `LESSON_WORKFLOW` بدلاً من الكتابة فوق السجل السابق، ويُحفظ كل حدث مهم في `AUDIT_LOG` و`SYSTEM_LOG`.

## 6) القوالب / التوليد

استخدام القالب النشط من التهيئة المركزية وليس من معرفات ثابتة في الشفرة:

- المفتاح: `ACTIVE_LESSON_TEMPLATE_ID`
- نسخة القالب: `ACTIVE_LESSON_TEMPLATE_VERSION`

قبل توليد الملف يتم التحقق من:

- وجود القالب النشط.
- صلاحية المستخدم.
- أن يكون الدرس في الحالة `APPROVED` أو `PUBLISHED`.
- عدم التكرار غير المنضبط: إذا كان هناك مستند/ملف PDF موجود مسبقاً، ينعكس في `FILES` ويُعاد دون توليد جديد.

## 7) مخرجات API الأساسية

تدعم نقطة الدخول الحالية هذه الإجراءات:

- `lessonCreate`
- `lessonGet`
- `lessonSaveDraft`
- `lessonSubmit`
- `lessonRequestRevision`
- `lessonApprove`
- `lessonPublish`
- `lessonArchive`
- `lessonGenerateDocument`
- `lessonGeneratePdf`

كل استجابة موحدة في غلاف `envelope_`: `{success,data,message,errorCode}`.

## 8) التحقق والتشخيص

تم توسيع `runLessonDiagnostics()` و`diagnostics_()` لتغطية:

- انتقالات الحالة المشروعة.
- منع انتقالات غير قانونية.
- تتبع حالة الدروس الأساسية.
- أدوار/صلاحيات ومهام الارتكاز.

التشخيص لا يحذف أي سجل ولا يشوّه البيانات، ويُستخدم فقط لتأكيد أن بوابة الدروس تعمل ضمن حدود الحالة المسموح بها.

## 9) واجهة الدروس

تم تحديث صفحة `Lessons.html` لتضمين:

- بحث/تصفية.
- قائمة بالحالات العربية.
- ترتيب عملي أساسي.
- زر إنشاء درس سريع.

واجهة HTML لا تغني عن التحقق الخادمي، لكنها تمثل نقطة بداية مناسبة لتطوير شاشة الدروس المفصلة في Milestone 5.

## 10) القيود المعروفة

- لا توجد بعد واجهة كاملة لإدارة مراجعة الدروس، التعليقات، والأرشفة بطريقة صفحتي غنية.
- لا توجد إشعارات أو مهام خلفية متقدمة للنسخ الاحتياطي أو التزامن.
- توليد PDF يعتمد على Google Drive/Docs API الموجود في Apps Script وفي بيئة العمل الفعلية.
- التحقق النهائي للمنشور/المعتمد يعتمد على تكوين Workspace الفعلي والقوالب داخل المشروع.

## 11) نقطة بداية Milestone 5

الخطوة التالية بعد هذا الإصدار هي:

- واجهة مراجعة الدروس الكاملة مع قائمة انتظار ومعايير الموافقة.
- تعليق المراجع/الأرشيف والتتبع الزمني.
- تخصيص أدوار أكثر دقة عبر `ROLE_PERMISSIONS`.
- تحسين الملفات المعتمدة والمنشورة مع إصدارات واضحة وإمكانية التنزيل.
- إضافة تقارير على مستوى الدرس والصف والمادة.

## 12) تعليمات التشغيل

1. اربط المشروع بملف بيانات Google Sheets.
2. شغّل `initializeSystem()` من محرر Apps Script.
3. حدّد `ACTIVE_LESSON_TEMPLATE_ID` في جدول `CONFIG` أو عبر إعدادات المشروع.
4. أضف المستخدمين والأدوار عبر جدول `USERS` و`ROLE_PERMISSIONS`.
5. استخدم `runDiagnostics()` أو `runLessonDiagnostics()` للتحقق من حالة النظام.
