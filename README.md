# زيتونة — بوابة المناهج والتدريس

بوابة Google Apps Script عربية RTL لإدارة البيانات الأساسية وسير الدروس داخل المدرسة. **MILESTONE = 7.0.0**

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
- `24_EvaluationService.gs`: نماذج التقييم وإصداراتها، نطاق المعلم، المسودات والإرسال والتاريخ والملخصات.
- `25_ReportService.gs`: محرك توليد تقارير الطلاب — يقرأ من `EVALUATIONS`/`EVALUATION_RESPONSES` مباشرة (بدون قاعدة بيانات موازية)، يحسب الملخصات، يحل نسخة القالب، يولّد Google Doc/PDF، ويسجّل النتيجة في `REPORTS`.

## 14) Milestone 6 — نظام تقييم الطلاب

تمت إضافة الجداول الآمنة `EVALUATION_FORMS`, `EVALUATION_CRITERIA`, `EVALUATIONS`, و`EVALUATION_RESPONSES`. النموذج قابل للتهيئة حسب نوع الإجابة والخيارات، ولا يمكن تعديل نسخة مستخدمة؛ يرتبط كل تقييم بنسخة النموذج حتى تبقى السجلات التاريخية قابلة للقراءة بعد أرشفة النموذج.

تتطلب إدارة النماذج `MANAGE_EVALUATIONS`، بينما يتطلب العرض `VIEW_EVALUATIONS`. المعلم لا يستطيع إنشاء أو تعديل تقييم إلا لطالب يقع صفه ومادته ضمن `USER_ASSIGNMENTS`، ولا يسمح الخادم بتعديل التقييم بعد إرساله. تشمل API الإجراءات `evaluationForms`, `evaluationFormSave`, `evaluationFormActivate`, `teacherEvaluationData`, `evaluationGet`, `evaluationSave`, `evaluationSubmit`, `evaluationHistory`, و`evaluationDashboard`. الواجهتان الجديدتان هما `EvaluationForms.html` و`TeacherEvaluations.html`.

تُسجل عمليات الحفظ والتفعيل والإرسال في `AUDIT_LOG`، وتُسجل الأخطاء والرفض في `SYSTEM_LOG`. التحقق الفعلي من Sheets/Session وواجهة Apps Script المنشورة واختبار UAT متعدد المستخدمين **Not Tested** في بيئة التطوير الحالية.

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

- `lessons` (قائمة مقيّدة بحسب الرؤية: دروسي + المنشورة، إلا لأصحاب صلاحيات المراجعة/الاعتماد/النشر/الأرشفة)
- `lessonsMine` (دروس المعلم الحالي فقط، لمساحة عمل المعلم)
- `lessonCreate`
- `lessonGet`
- `lessonSaveDraft`
- `lessonSubmit`
- `lessonStartReview`
- `lessonRequestRevision`
- `lessonApprove`
- `lessonPublish`
- `lessonArchive`
- `lessonGenerateDocument`
- `lessonGeneratePdf`
- `lessonGetFile` (وصول آمن لملف Drive بعد إعادة التحقق من صلاحية الرؤية)

كل استجابة موحدة في غلاف `envelope_`: `{success,data,message,errorCode}`.

## 8) التحقق والتشخيص

تم توسيع `runLessonDiagnostics()` و`diagnostics_()` لتغطية:

- انتقالات الحالة المشروعة.
- منع انتقالات غير قانونية.
- تتبع حالة الدروس الأساسية.
- أدوار/صلاحيات ومهام الارتكاز.

التشخيص لا يحذف أي سجل ولا يشوّه البيانات، ويُستخدم فقط لتأكيد أن بوابة الدروس تعمل ضمن حدود الحالة المسموح بها.

## 9) واجهة الدروس ومساحة عمل المعلم

تم تحديث صفحة `Lessons.html` لتضمين:

- بحث/تصفية.
- قائمة بالحالات العربية.
- ترتيب عملي أساسي.
- زر إنشاء درس سريع.

أُضيفت صفحة جديدة `TeacherWorkspace.html` (مرتبطة بزر "مساحة عمل المعلم" في `Sidebar.html`) تعرض فقط الدروس المسندة إلى المعلم الحالي (`teacherEmail`)، بصرف النظر عن أي صلاحية مراجعة إضافية قد يملكها، مع إمكانية إنشاء درس، إرساله للمراجعة، وفتح ملف المستند/PDF الخاص به بعد توليده.

واجهة HTML لا تغني عن التحقق الخادمي، فكل قيود الرؤية والصلاحيات مطبّقة أولاً في الخدمات (`22_LessonFoundationService.gs`, `23_LessonWorkflowService.gs`).

## 10) القيود المعروفة

- لا توجد بعد واجهة غنية بصفحتين لقائمة انتظار المراجعة مع التعليقات المرئية (التعليقات مخزّنة في `reviewHistory`/`LESSON_WORKFLOW` لكن بدون شاشة تفاعلية مخصصة).
- لا توجد إشعارات أو مهام خلفية متقدمة للنسخ الاحتياطي أو التزامن.
- توليد PDF يعتمد على Google Drive/Docs API الموجود في Apps Script وفي بيئة العمل الفعلية.
- التحقق النهائي للمنشور/المعتمد يعتمد على تكوين Workspace الفعلي والقوالب داخل المشروع.
- لا توجد بعد آلية لإسناد المعلم إلى صف/مادة عبر `USER_ASSIGNMENTS`؛ نطاق "دروسي" حالياً هو حقل `teacherEmail` على الدرس نفسه.

## 11) حالة Milestone 5

هذا الإصدار يغلق الفجوات التالية التي كانت تمنع تشغيل حتى الأساسيات من Milestone 4، ثم يبني عليها مساحة عمل المعلم المطلوبة في Milestone 5:

- **إصلاح جوهري في `06_DatabaseService.gs`**: كانت `DatabaseService.rows()` تُعيد مصفوفات خام بلا أسماء أعمدة، وكانت `DatabaseService.find()`/`DatabaseService.upsert()` غير معرّفتين إطلاقاً رغم استدعائهما من كل خدمة تقريباً (`MasterDataService`, `LessonWorkflowService`, `UserRoleService`, `IdGeneratorService`)، ما كان يجعل `initializeSystem()` وكل عمليات الدروس تفشل فوراً. تمت إعادة الكتابة لتُعيد `rows()` كائنات مفتاحها اسم العمود، ولإضافة `find()`/`upsert()` بأسلوب غير هدّام (تحديث الصف الموجود أو الإلحاق فقط).
- **إصلاح مسدود في سير عمل الدروس**: لم تكن هناك دالة/إجراء API لنقل الدرس من `SUBMITTED` إلى `UNDER_REVIEW` رغم أن `APPROVED` تشترط المرور بـ `UNDER_REVIEW` أولاً حسب `LESSON_STATUS_TRANSITIONS`؛ أُضيفت `startLessonReview_()` وإجراء `lessonStartReview`.
- **إصلاح صلاحية**: كان `submitLessonForReview_` يتطلب `REVIEW_LESSONS` فقط، وهي صلاحية لا يملكها دور `TEACHER` افتراضياً، فلا يستطيع أي معلم إرسال درسه الخاص للمراجعة؛ أُضيفت `authorizeLessonSelfOrPermission_()` للسماح لصاحب الدرس (`MANAGE_LESSONS` + ملكية) بالإرسال دون منح صلاحيات المراجعة الكاملة.
- **نطاق الوصول المرتبط بالإسناد (assignment-scoped access) ورؤية المنشور فقط**: `listLessons`/`getLesson_`/`getLessonFileAccess_` تطبّق الآن `filterLessonsByVisibility_`/`lessonOwnedOrVisible_`: أي مستخدم بلا صلاحية مراجعة/اعتماد/نشر/أرشفة (`hasElevatedLessonAccess_`) لا يرى إلا دروسه الخاصة (`teacherEmail`) بأي حالة، بالإضافة إلى أي درس وصل لحالة `PUBLISHED` بصرف النظر عن مالكه. أصحاب أدوار المراجعة/الاعتماد/النشر/الأرشفة أو `ADMIN` يستمرون برؤية كل الدروس كما في السابق.
- **وصول آمن للملفات**: إجراء API جديد `lessonGetFile` (والدالة الداخلية `getLessonFileAccess_`) يعيد رابط/تعريف ملف Drive فقط بعد التحقق من نفس قاعدة رؤية الدرس أعلاه، ويسجّل كل عملية وصول في `AUDIT_LOG` (`FILE_ACCESS`) و`SYSTEM_LOG`.
- **مساحة عمل المعلم وربط التوجيه/الواجهة**: صفحة `TeacherWorkspace.html` جديدة، زر تنقل جديد في `Sidebar.html`، وتحميلها عبر `showPage()` في `Scripts.html`، مدعومة بإجراء `lessonsMine` (يستدعي `listMyLessons()`).
- **تعزيز التدقيق/التسجيل**: `authorize_()` وحالات رفض الوصول للدروس والملفات تسجّل الآن تحذيرات `WARN` في `SYSTEM_LOG` قبل رفض الطلب، بالإضافة لسجلات `AUDIT_LOG` الموجودة أصلاً لكل تغيير حالة.
- لا يوجد ازدواج لخدمات موجودة: التعديلات أضيفت داخل نفس الملفات/الخدمات القائمة (`06_DatabaseService.gs`, `17_AuthorizationService.gs`, `22_LessonFoundationService.gs`, `23_LessonWorkflowService.gs`, `16_AppController.gs`) دون إنشاء طبقة موازية، وكل الحقول/الجداول من Milestone 4 محفوظة كما هي.

### ما تم اختباره فعلياً (Tested)

لا تتوفر بيئة Google Apps Script حقيقية (Sheets/Drive/Docs/Session) داخل بيئة العمل الحالية، لذلك تم التحقق مما يلي عبر:

1. فحص بنيوي: `node --check` لكل ملف `.gs` (بعد نسخه بامتداد `.js` مؤقتاً) للتأكد من خلوّه من أخطاء بنيوية.
2. محاكاة كاملة (Node + محاكاة يدوية لِـ `SpreadsheetApp`/`Session`/`DriveApp`/`DocumentApp`/`PropertiesService`/`Utilities`) لسيناريو من طرف إلى طرف: `initializeSystem` → إنشاء مستخدمين/أدوار → معلم ينشئ درساً ← يرسله للمراجعة ← مراجع يبدأ المراجعة ← يعتمد ← ينشر ← توليد مستند/PDF ← معلم آخر (بلا صلاحية مراجعة) يطّلع على الدرس المنشور والملف الآمن الخاص به عبر `lessonGetFile`، مع التحقق من رفض الوصول لدرس مسودة يخص معلماً آخر، ورفض أي مستخدم بلا دور من استعراض قائمة الدروس، وتحقق مسار `MasterDataService` (حفظ/سرد/أرشفة الطلاب) والتشخيصات (`runDiagnostics`, `runLessonDiagnostics`, `runWorkspaceVisibilityDiagnostics_`).
3. اختبار منطقي منفصل لدالة الترشيح الصِرفة `filterLessonsByVisibility_` (بلا أي اعتماد على GAS) للتأكد من: رؤية المعلم لدرسه الخاص أياً كانت حالته، إخفاء مسودات الآخرين، وإظهار المنشور من الآخرين، ورؤية كاملة لأصحاب صلاحيات المراجعة/الاعتماد/النشر/الأرشفة.

هذه الاختبارات **منطقية/محاكاة (logic-level / simulated)**، وليست تشغيلاً فعلياً داخل Google Apps Script.

### ما لم يُختبر بعد (Untested / يتطلب تحققاً يدوياً بعد النشر)

- التشغيل الفعلي داخل محرر Apps Script المرتبط بجدول بيانات وملفات Drive حقيقية (أذونات OAuth، حدود الحصص، سلوك `DriveApp`/`DocumentApp` الحقيقي).
- تجربة الواجهة (`TeacherWorkspace.html`/`Lessons.html`) داخل متصفح فعلي على نشر ويب حقيقي (شكل الجداول، التمرير الأفقي على الجوال، تفاعل الأزرار مع `google.script.run`).
- سيناريوهات تعدد المستخدمين المتزامن (تنافس على نفس صف Sheet).
- ترقية قاعدة بيانات موجودة فعلياً من نسخة سابقة (تم فقط التحقق من أن `initializeSystem()`/`ensureSheet()` لا يحذفان بيانات، وليس اختبار ترقية حقيقي على نسخة إنتاج قديمة).

بعد النشر، يُنصح بتشغيل `runDiagnostics()`, `runLessonDiagnostics()`, و`runWorkspaceVisibilityDiagnostics_()` من محرر Apps Script، ثم تنفيذ اختبار قبول يدوي (UAT) يغطي: إنشاء درس كمعلم، إرساله، مراجعته من حساب آخر، اعتماده ونشره، والتأكد من ظهوره فقط للمعلمين الآخرين بعد النشر.

## 12) نقطة بداية العمل التالي بعد Milestone 5

- واجهة مراجعة أغنى مع تعليقات مرئية مرتبطة بـ `LESSON_WORKFLOW`/`reviewHistory` بدل `prompt()`.
- إسناد المعلم لصف/مادة عبر `USER_ASSIGNMENTS` كبديل/إضافة لحقل `teacherEmail` المباشر.
- إشعارات وتقارير على مستوى الدرس/الصف/المادة.
- تنزيل الملفات مباشرة (وليس فقط فتح رابط Drive) مع تتبع إصدارات أوضح.

## 13) تعليمات التشغيل

1. اربط المشروع بملف بيانات Google Sheets.
2. شغّل `initializeSystem()` من محرر Apps Script.
3. حدّد `ACTIVE_LESSON_TEMPLATE_ID` في جدول `CONFIG` أو عبر إعدادات المشروع.
4. أضف المستخدمين والأدوار عبر جدول `USERS` و`ROLE_PERMISSIONS`.
5. استخدم `runDiagnostics()` أو `runLessonDiagnostics()` للتحقق من حالة النظام.
6. حدّد `ACTIVE_REPORT_TEMPLATE_ID` (ونسخته الاختيارية `ACTIVE_REPORT_TEMPLATE_VERSION`) في جدول `CONFIG` قبل استخدام تقارير الطلاب، واستخدم `runReportDiagnostics()` للتحقق من منطق محرك التقارير.

## 15) Milestone 7 — تقارير الطلاب ومحرك توليد التقارير

### مصدر البيانات وسلامة التاريخ

التقرير لا يخزّن أي بيانات تقييم مكررة؛ عند الطلب، يقرأ `25_ReportService.gs` مباشرة من `EVALUATIONS`/`EVALUATION_RESPONSES` عبر نفس دوال `24_EvaluationService.gs` (`historicalForm_`, `criteriaForForm_`, `evaluationInScope_`)، بحيث يُستخدم **إصدار النموذج/المعيار الذي كان فعلياً وقت إنشاء كل تقييم** (وليس النسخة الحالية للنموذج)، فتبقى القراءة صحيحة تاريخياً حتى لو عُدّل النموذج أو أُرشف لاحقاً. لا يوجد إدخال يدوي لأي بيانات تقرير — كل الأرقام والتوزيعات محسوبة من استجابات تقييم فعلية.

### نموذج الفترة الزمنية (Reporting Period)

كل طلب تقرير يحدد `academicYearId` (من جدول `ACADEMIC_YEARS` الموجود) و`term` من الثوابت `REPORT_TERMS`: `FULL_YEAR` (العام كاملاً), `FIRST`, `SECOND`, `THIRD` (فصول دراسية), أو `CUSTOM` (نطاق تاريخ صريح `startDate`/`endDate`). يتحقق `validateReportPeriod_()` من: وجود العام الدراسي، صحة قيمة `term`، صحة أي تواريخ مُدخلة، وإلزامية `startDate`/`endDate` معاً عند `CUSTOM`. تُسجَّل الفترة المستخدمة فعلياً (`academicYearId`, `academicYearName`, `term`, `termLabel`, `startDate`, `endDate`) داخل بيانات وصفية للتقرير (`REPORTS.periodJson`) — وليس فقط في طلب التوليد — بحيث يبقى أي تقرير قابلاً للتفسير لاحقاً بمعزل عن حالة النظام الحالية.

### قاعدة تضمين التقييمات (Inclusion Rule)

يُضمَّن في التقرير فقط التقييمات التي حالتها ضمن `REPORT_INCLUDED_EVALUATION_STATUSES` = `SUBMITTED` أو `LOCKED`، والتي تقع ضمن الفترة الزمنية (بمقارنة `submittedAt`/`startedAt` بنطاق الفترة عند تحديدها)، ومطابقة لـ `studentId` وأي مُصفٍّ إضافي بالمادة/الصف إن وُجد. تُستبعد صراحةً تقييمات `IN_PROGRESS` (مسودات لم تُرسل بعد) — تم التحقق من هذا السلوك في الاختبار (تقييم بحالة `IN_PROGRESS` لا يدخل في الحساب ولا في `evaluationCount`).

### قواعد الحساب الموثّقة صراحة (لا اجتهاد تربوي غير موثّق)

`computeReportSummary_()` يطبّق فقط القواعد التالية، ولا يخترع أي معيار تقييم تربوي إضافي غير موجود في نظام النماذج:

- معايير من نوع `RATING`/`NUMBER`: **متوسط حسابي** لكل القيم الرقمية المُدخلة عبر كل التقييمات المشمولة لنفس المعيار (بالتسمية/label)، مقرّب إلى منزلتين عشريتين.
- معايير من نوع `SELECT`/`RADIO`: **توزيع تكراري** (عدد مرات اختيار كل قيمة)، وليس متوسطاً (لا معنى رياضياً لمتوسط قيم نصية مُصنّفة).
- أي نوع آخر (مثل `TEXT`): قائمة القيم الخام كما أُدخلت، مجمّعة حسب تسمية المعيار.

يُجمَّع كل معيار عبر جميع النماذج/الإصدارات المشمولة بنفس التسمية (`label`) حتى لو تغيّر معرف المعيار بين إصدارات النموذج.

### القالب والإصدارات (Template)

مفتاح القالب النشط `ACTIVE_REPORT_TEMPLATE_ID` (و`ACTIVE_REPORT_TEMPLATE_VERSION` اختيارياً) يُقرآن من جدول `CONFIG` في وقت التوليد — لا يوجد معرف قالب مكتوب مباشرة في الكود. عند غياب القالب أو تعذّر الوصول إليه (صلاحيات Drive)، يُرفض الطلب برسالة عربية واضحة للمستخدم، مع تسجيل تفصيل تقني (`ERROR`) في `SYSTEM_LOG`. يُحفظ `templateId`/`templateVersion` المستخدمين فعلياً داخل سجل `REPORTS` لكل تقرير، بحيث يمكن معرفة القالب الذي وُلِّد به أي تقرير تاريخياً حتى لو تغيّر القالب النشط لاحقاً.

### استراتيجية التكرار وإعادة التوليد (Duplicate / Regeneration)

- طلب توليد لنفس (الطالب + الفترة + القالب) مع نفس مجموعة التقييمات المصدرية بالضبط → **عملية معادة للتطابق (idempotent)**: يُعاد التقرير النشط الموجود دون إنشاء نسخة جديدة (يُسجَّل تدقيقياً `REPORT_OPEN_EXISTING`).
- وجود تقرير نشط لكنه أصبح غير مطابق لمصدر البيانات الحالي (تقييمات جديدة صارت متاحة) دون طلب "إعادة توليد" صريح → **يُرفض الطلب** برسالة عربية توجّه لاستخدام إعادة التوليد صراحة؛ لا يُستبدل أي تقرير ضمنياً.
- استدعاء `regenerate()` الصريح فقط → يُنشئ نسخة جديدة (`version` أعلى)، ويضع حالة التقرير السابق `SUPERSEDED` (لا يُحذف نهائياً)، مع `regeneratedFromId` يربط النسخة الجديدة بالتي سبقتها لتتبّع النسَب التاريخي الكامل.

### التخزين على Drive وسجلات الملفات

يُستخدم نفس هيكل مجلدات Drive المعتمد (مجلد `03 تقارير الطلاب` ضمن `DRIVE_FOLDERS`)؛ يُنسخ القالب، تُستبدل الحقول النائبة (placeholders)، يُنشأ Google Doc ثم PDF، ويُسجَّل كل منهما كصف مستقل في `FILES` (بمعرف Drive الحقيقي)، ثم يُربطان بسجل `REPORTS` عبر `documentFileId`/`pdfFileId`. لا يُعاد توليد PDF عند كل فتح/عرض — `reportFileAccess_()`/`getFile()` يعيدان فقط رابط/تعريف الملف المسجَّل مسبقاً بعد التحقق من النطاق، مطابقةً لنمط `getLessonFileAccess_` في Milestone 4/5.

### فصل منطق الأعمال عن العرض

`assembleReportEntries_`/`computeReportSummary_` (تجميع بيانات وحسابات) منفصلة تماماً عن `generateReportDocument_`/`applyReportPlaceholders_` (استبدال الحقول النائبة في المستند فقط)، بحيث يمكن اختبار صحة الحسابات دون الحاجة لأي استدعاء Drive/Docs فعلي.

### الصلاحيات

- `VIEW_REPORTS`: عرض قائمة الطلاب، التقرير، وسجل التقارير (ضمن نطاق المستخدم).
- `GENERATE_REPORTS`: توليد/إعادة توليد تقرير.
تُمنح افتراضياً لأدوار `ADMIN`, `TEACHER`, `MANAGEMENT`, `SUPERVISOR` (`14_InitializationService.gs`). المعلم مقيّد بنطاق إسناده (`USER_ASSIGNMENTS`: الصفوف/المواد) بنفس آلية `assignmentScope_`/`evaluationInScope_` من Milestone 6 — أي محاولة تمرير `studentId` يدوياً خارج نطاق المعلم تُرفض صراحة (`reportStudentInScope_`) برسالة تحتوي "صلاحية"، بصرف النظر عمّا يُرسله العميل.

### إجراءات API الجديدة (`16_AppController.gs`)

`reportStudents`, `reportGenerate`, `reportRegenerate`, `reportGet`, `reportHistory`, `reportGetFile`. كما أُضيف `reportTerms` إلى استجابة `bootstrap` ليقرأ العميل قائمة الفصول المتاحة من الخادم بدل تكرارها في الواجهة.

### الواجهة (Arabic RTL)

- `StudentReports.html` (تقارير الطلاب): بحث/اختيار طالب ضمن نطاق المستخدم.
- `StudentReport.html` (تقرير الطالب): اختيار العام/الفصل، توليد/إعادة توليد، معاينة ملخص التقرير، فتح المستند/PDF.
- `StudentReportHistory.html` (سجل تقارير الطالب): عرض كل نسخ التقارير التاريخية لطالب (نشطة وملغاة/`SUPERSEDED`).

زر التنقل `studentReportsNav` في `Sidebar.html` يظهر فقط لمن يملك `VIEW_REPORTS` (يُتحقق في `boot()` ضمن `Scripts.html`)، بنفس أسلوب الإظهار/الإخفاء الشرطي المستخدم لعناصر التنقل الأخرى.

### الأخطاء والتدقيق

جميع رسائل الخطأ الموجّهة للمستخدم بالعربية (لا توجد بيانات مؤهلة، رفض صلاحية، تعذّر القالب/المستند/PDF)، مع تسجيل التفاصيل التقنية في `SYSTEM_LOG`. تُسجَّل في `AUDIT_LOG` الأحداث: `REPORT_REQUEST_GENERATE` (طلب التوليد قبل التنفيذ), `REPORT_GENERATE` (نجاح إنشاء نسخة جديدة), `REPORT_OPEN_EXISTING` (إعادة استخدام تقرير مطابق موجود), `REPORT_REGENERATE` (إعادة توليد صريحة), و`REPORT_FILE_ACCESS` (فتح مستند/PDF مسجَّل).

> ملاحظة: لم يُنفَّذ إجراء "أرشفة تقرير" (archive) منفصل في هذا الإصدار — `SUPERSEDED` هي الحالة الوحيدة غير `ACTIVE` المُطبَّقة حالياً عبر إعادة التوليد؛ انظر قسم الحالة أدناه (Deferred).

### إصلاح جانبي ضروري في `24_EvaluationService.gs`

أثناء بناء اختبارات المحاكاة، اكتُشف أن `evaluationWrite_` كان يولّد معرّف `uuid_()` جديداً لكل استجابة (`EVALUATION_RESPONSES`) في كل مرة يُحفظ فيها التقييم (حفظ مسودة ثم إرسال)، بدل تحديث الصف الموجود لنفس (`evaluationId` + `criterionId`)؛ هذا كان يُنتج صفوفاً مكررة لنفس المعيار ويُفسد أي حساب تجميعي (مثل توزيع Milestone 7). تم إصلاحه بالبحث عن صف استجابة موجود لنفس المعيار وإعادة استخدام معرّفه إن وُجد، بما يحافظ على سلوك `upsert` الصحيح دون أي حذف أو فقدان بيانات تاريخية.

## 16) MILESTONE 7 COMPLETION REPORT

### نطاق العمل المُنفَّذ

| البند | الحالة |
|---|---|
| قراءة التقارير مباشرة من `EVALUATIONS`/`EVALUATION_RESPONSES` بدون قاعدة بيانات مكررة | Implemented / Tested |
| الحفاظ على السياق التاريخي لإصدار النموذج/المعايير | Implemented / Tested |
| نموذج الفترة (عام دراسي + فصل/نطاق تاريخ مخصص) وتسجيلها في بيانات التقرير الوصفية | Implemented / Tested |
| قاعدة تضمين التقييمات (`SUBMITTED`/`LOCKED` فقط، استبعاد `IN_PROGRESS`) | Implemented / Tested |
| التحقق الخادمي من المستخدم النشط، الصلاحية، نطاق الطالب، ورفض التلاعب بالمعرفات يدوياً | Implemented / Tested |
| حساب الملخصات الموثّق (متوسط/توزيع/قيم خام) بلا اجتهاد تربوي غير موثّق | Implemented / Tested |
| فصل منطق تجميع البيانات عن استبدال الحقول النائبة في المستند | Implemented |
| قالب نشط قابل للتهيئة (`CONFIG`) بلا معرف مكتوب في الكود، مع رسائل عربية وتسجيل تقني عند غياب/تعذّر القالب | Implemented / Tested |
| تتبع إصدار القالب المستخدم لكل تقرير | Implemented / Tested |
| توليد Google Doc + PDF وتسجيلهما في `FILES` و`REPORTS` | Implemented / Tested (محاكاة) |
| عدم توليد PDF جديد عند كل فتح/عرض | Implemented / Tested |
| استراتيجية التكرار/إعادة التوليد (idempotent، رفض الاستبدال الضمني، نسخ صريحة عبر `regenerate`) | Implemented / Tested |
| أرشفة تقرير كإجراء منفصل | Deferred (لم يُطلب صراحة كإجراء مستقل غير `SUPERSEDED` التلقائي عبر إعادة التوليد) |
| واجهات Arabic RTL الثلاث (تقارير الطلاب / تقرير الطالب / سجل تقارير الطالب) وربط التنقل حسب الصلاحية | Implemented |
| تسجيل تدقيقي شامل للأحداث المطلوبة (طلب/توليد/إعادة توليد/فتح ملف) | Implemented / Tested |
| تسجيل تقني في `SYSTEM_LOG` لكل الأخطاء | Implemented / Tested |
| إصلاح ازدواج صفوف `EVALUATION_RESPONSES` (Milestone 6) المؤثر مباشرة على صحة حسابات Milestone 7 | Implemented / Tested |

### ما تم اختباره فعلياً (Tested)

نفس منهجية الاختبار المتّبعة في Milestones 4–6 (لا تتوفر بيئة Google Apps Script حقيقية):

1. فحص بنيوي: `node --check` على كل ملفات `.gs` بعد نسخها بامتداد `.js` مؤقتاً — لا أخطاء بنيوية.
2. محاكاة Node.js كاملة (`vm` + محاكاة يدوية لِـ `SpreadsheetApp`/`Session`/`Utilities`/`DriveApp`/`DocumentApp`/`PropertiesService`) تُنفّذ كود المستودع الفعلي بترتيب الاعتماديات، وتغطي 15 سيناريو تحقق متسلسل ضمن تشغيل واحد:
   - قراءة/كتابة إعدادات القالب النشط من `CONFIG`.
   - رفض معلم خارج نطاق إسناده (`رفض بسبب الصلاحية/النطاق`).
   - توليد ناجح لمعلم ضمن النطاق، مع تسجيل `documentFileId`/`pdfFileId`.
   - شمول تقييمين `SUBMITTED` واستبعاد تقييم `IN_PROGRESS` من `evaluationCount` والحسابات.
   - صحة المتوسط الحسابي لمعيار `RATING` وصحة التوزيع التكراري لمعيار `SELECT`.
   - التحقق من استبدال الحقول النائبة فعلياً داخل نص المستند المُولَّد (لا نص `{{ }}` متبقٍّ).
   - التكرار المتطابق (idempotent) يعيد نفس التقرير دون نسخة جديدة.
   - بيانات جديدة متاحة دون طلب إعادة توليد صريح → رفض واضح.
   - إعادة التوليد الصريحة → نسخة جديدة، والنسخة السابقة تتحول لحالة `SUPERSEDED` (غير محذوفة).
   - سجل التاريخ (`history`) يعرض كل النسخ.
   - الوصول للملف (`getFile`) يعيد نفس الملف المسجَّل دون توليد PDF جديد.
   - فرض النطاق عند `get`/`history`/`getFile` أيضاً وليس فقط عند `generate`.
   - رفض عدم وجود بيانات مؤهلة (عام دراسي بلا أي تقييم).
   - رفض غياب القالب النشط برسالة عربية + تسجيل `SYSTEM_LOG` من نوع `ERROR`، ثم نجاح التوليد بعد إعادة ضبط القالب.
   - رفض التلاعب بمعرف طالب خارج نطاق المعلم (طالب في صف آخر).
   - رفض فترة `CUSTOM` بلا تاريخ بداية/نهاية صريح.
   - اكتمال سجل `AUDIT_LOG` بكل الأحداث الخمسة المطلوبة.
   - نطاق قائمة الطلاب (`students()`) يعرض فقط طلاب صف المعلم المُسنَد.
   - نجاح `runReportDiagnostics()` (فحص منطقي صرف لقواعد النطاق والحساب دون أي اعتماد على GAS).
3. اختبار منطقي منفصل لدالة `computeReportSummary_`-المرتبطة عبر `runReportDiagnostics()`.

هذه الاختبارات **منطقية/محاكاة (logic-level / simulated)** تماماً كما في التقارير السابقة، وليست تشغيلاً فعلياً داخل Google Apps Script.

### ما لم يُختبر (Not Tested)

- التشغيل الفعلي داخل محرر Apps Script المرتبط بجدول بيانات وملفات Drive/Docs حقيقية (حصص `DriveApp.getFileById`/`DocumentApp.openById`، حدود OAuth الفعلية لنطاق `documents` المُضاف حديثاً في `appsscript.json`).
- تجربة الواجهات الثلاث الجديدة داخل متصفح فعلي على نشر ويب حقيقي (التمرير الأفقي، تفاعل الأزرار الحقيقي مع `google.script.run`، وضوح RTL على الجوال).
- سيناريوهات تعدد مستخدمين متزامن (تنافس على توليد نفس التقرير في نفس اللحظة).
- ترقية قاعدة بيانات إنتاج فعلية قائمة مسبقاً (تم التحقق فقط من أن `ensureSheet()`/`initializeSystem()` يضيفان `REPORTS` وإعدادات القالب دون حذف أي بيانات سابقة، وليس اختبار ترقية حقيقي على نسخة إنتاج قديمة).
- قبول مستخدم فعلي (UAT) لصياغة/تنسيق المستند الناتج من قالب Google Doc حقيقي مصمَّم يدوياً.

### مؤجَّل (Deferred)

- إجراء "أرشفة تقرير" (`REPORT_ARCHIVE`) كعملية مستقلة صريحة عن دورة `SUPERSEDED` التلقائية الحالية عبر إعادة التوليد. لم يُطلب صراحة في نطاق التنفيذ الأساسي، ويمكن إضافته لاحقاً بنفس نمط `archiveLesson_`.
- تنزيل مباشر للملف (بدل فتح رابط Drive) — نفس القيد الموروث من Milestone 5.

### القيود المحفوظة من قبل

جميع بيانات وسجلات Milestones 2–6 محفوظة كما هي؛ لم تُحذف أو تُعدَّل أي جداول/حقول سابقة — أُضيفت فقط جداول/أعمدة/صلاحيات جديدة (`REPORTS`, مفاتيح `CONFIG` الخاصة بالقالب, `VIEW_REPORTS`, `GENERATE_REPORTS`). إصلاح ازدواج `EVALUATION_RESPONSES` في `24_EvaluationService.gs` هو التعديل الوحيد على منطق Milestone 6 القائم، وهو تعديل غير هدّام (تحديث الصف الموجود بدل إضافة صف مكرر) لا يحذف أي بيانات تاريخية.
