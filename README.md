# زيتونة — بوابة المناهج والتدريس

بوابة Google Apps Script عربية RTL لإدارة البيانات الأساسية وسير الدروس داخل المدرسة. **MILESTONE = 6.0.0**

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
