import type {
  DemoData,
  Patient,
  RegistrationRequest,
  Employee,
  Appointment,
  RehabSession,
  TreatmentPlan,
  Exercise,
  AppNotification,
  DemoDocument,
  Conversation,
  CompanionMessage,
} from "@/types/demo";

const SEED_VERSION = 2;

function isoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function isoDateTime(daysFromNow: number, hoursAgo: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

const employees: Employee[] = [
  { id: "e1", fullName: "د. خالد الشمري", role: "doctor", specialty: "طب التأهيل", employmentStatus: "active", assignedCaseCount: 12, todayAppointmentCount: 4, phone: "0501234567", email: "k.shammari@taaheeli.example", hireDate: "2021-09-01" },
  { id: "e2", fullName: "أ. منيرة العنزي", role: "therapist", specialty: "علاج طبيعي", employmentStatus: "active", assignedCaseCount: 15, todayAppointmentCount: 6, phone: "0502345678", email: "m.otaibi@taaheeli.example", hireDate: "2022-01-15" },
  { id: "e3", fullName: "أ. سارة المطيري", role: "therapist", specialty: "علاج وظيفي", employmentStatus: "active", assignedCaseCount: 10, todayAppointmentCount: 3, phone: "0503456789", email: "s.mutairi@taaheeli.example", hireDate: "2022-03-10" },
  { id: "e4", fullName: "أ. فهد الدوسري", role: "therapist", specialty: "علاج نطق وتخاطب", employmentStatus: "active", assignedCaseCount: 8, todayAppointmentCount: 2, phone: "0504567890", email: "f.dosari@taaheeli.example", hireDate: "2023-01-20" },
  { id: "e5", fullName: "سارة المطيري", role: "admin", specialty: "إدارة مكتبية", employmentStatus: "active", assignedCaseCount: 0, todayAppointmentCount: 0, phone: "0505678901", email: "s.admin@taaheeli.example", hireDate: "2021-06-01" },
  { id: "e6", fullName: "أ. نورة القحطاني", role: "nurse", specialty: "تمريض تأهيلي", employmentStatus: "on-leave", assignedCaseCount: 5, todayAppointmentCount: 0, phone: "0506789012", email: "n.qahtani@taaheeli.example", hireDate: "2022-11-05" },
  { id: "e7", fullName: "أ. عبدالله الحربي", role: "coordinator", specialty: "تنسيق المواعيد", employmentStatus: "active", assignedCaseCount: 0, todayAppointmentCount: 0, phone: "0507890123", email: "a.harbi@taaheeli.example", hireDate: "2023-05-01" },
];

const patients: Patient[] = [
  { id: "p1", fullName: "وليد العويس", fileNumber: "T-1001", username: "w_owis", status: "active", assignedTherapistId: "e2", birthDate: "1998-04-15", gender: "male", phone: "0551112222", email: "w.owis@gmail.com", progress: 65, lastSessionDate: isoDate(-1), nextAppointmentDate: isoDate(2), createdAt: isoDate(-120) },
  { id: "p2", fullName: "فاطمة الزهراني", fileNumber: "T-1002", username: "fatimah", status: "active", assignedTherapistId: "e3", birthDate: "2001-07-22", gender: "female", phone: "0552223333", progress: 40, lastSessionDate: isoDate(-2), nextAppointmentDate: isoDate(1), createdAt: isoDate(-90) },
  { id: "p3", fullName: "عبدالرحمن السبيعي", fileNumber: "T-1003", username: "abdulrahman", status: "active", assignedTherapistId: "e2", birthDate: "1995-12-03", gender: "male", phone: "0553334444", progress: 80, lastSessionDate: isoDate(0), nextAppointmentDate: isoDate(3), createdAt: isoDate(-200) },
  { id: "p4", fullName: "ريم الشهري", fileNumber: "T-1004", username: "reem", status: "active", assignedTherapistId: "e4", birthDate: "2003-03-18", gender: "female", phone: "0554445555", progress: 25, lastSessionDate: isoDate(-3), nextAppointmentDate: isoDate(0), createdAt: isoDate(-60) },
  { id: "p5", fullName: "ماجد الغامدي", fileNumber: "T-1005", username: "majed", status: "active", assignedTherapistId: "e1", birthDate: "1990-09-30", gender: "male", phone: "0555556666", progress: 90, lastSessionDate: isoDate(-1), nextAppointmentDate: isoDate(5), createdAt: isoDate(-300) },
  { id: "p6", fullName: "هند البقمي", fileNumber: "T-1006", username: "hind", status: "active", assignedTherapistId: "e3", birthDate: "2005-02-14", gender: "female", phone: "0556667777", caregiverName: "أم هند", caregiverRelation: "الأم", progress: 55, lastSessionDate: isoDate(-1), nextAppointmentDate: isoDate(1), createdAt: isoDate(-45) },
  { id: "p7", fullName: "سلطان الرشيدي", fileNumber: "T-1007", username: "sultan", status: "active", assignedTherapistId: "e2", birthDate: "1992-11-25", gender: "male", phone: "0557778888", progress: 70, lastSessionDate: isoDate(0), nextAppointmentDate: isoDate(2), createdAt: isoDate(-150) },
  { id: "p8", fullName: "لمى المطيري", fileNumber: "T-1008", username: "lama", status: "inactive", assignedTherapistId: null, birthDate: "2000-06-08", gender: "female", phone: "0558889999", progress: 15, lastSessionDate: isoDate(-30), nextAppointmentDate: null, createdAt: isoDate(-250) },
  { id: "p9", fullName: "تركي العنزي", fileNumber: "T-1009", username: "turki", status: "active", assignedTherapistId: "e4", birthDate: "1997-01-19", gender: "male", phone: "0559990000", progress: 50, lastSessionDate: isoDate(-2), nextAppointmentDate: isoDate(4), createdAt: isoDate(-80) },
  { id: "p10", fullName: "جواهر الحربي", fileNumber: "T-1010", username: "jawahir", status: "active", assignedTherapistId: "e1", birthDate: "2002-08-11", gender: "female", phone: "0550001111", caregiverName: "أبو جواهر", caregiverRelation: "الأب", progress: 35, lastSessionDate: isoDate(-1), nextAppointmentDate: isoDate(0), createdAt: isoDate(-55) },
];

const requests: RegistrationRequest[] = [
  { id: "r1", fullName: "نورة القحطاني", username: "noura", birthDate: "1999-05-12", gender: "female", hasCaregiver: false, caregiverName: "", caregiverRelation: "", phone: "0561234567", email: "noura@example.com", consent: true, status: "pending", submittedAt: isoDateTime(-2, 5), reviewedAt: null, reviewNote: null },
  { id: "r2", fullName: "بدر الشمري", username: "badr", birthDate: "2004-03-25", gender: "male", hasCaregiver: true, caregiverName: "خالد الشمري", caregiverRelation: "الأب", phone: "0562345678", consent: true, status: "pending", submittedAt: isoDateTime(-1, 2), reviewedAt: null, reviewNote: null },
  { id: "r3", fullName: "أحمد المطيري", username: "ahmad_m", birthDate: "1996-11-08", gender: "male", hasCaregiver: false, caregiverName: "", caregiverRelation: "", phone: "", email: "ahmad@example.com", consent: true, status: "approved", submittedAt: isoDateTime(-10, 0), reviewedAt: isoDateTime(-8, 0), reviewNote: "تم التفعيل" },
];

const appointments: Appointment[] = [
  { id: "a1", patientId: "p3", employeeId: "e2", date: isoDate(0), time: "09:00", durationMin: 45, type: "علاج طبيعي", channel: "in-person", status: "completed" },
  { id: "a2", patientId: "p7", employeeId: "e2", date: isoDate(0), time: "10:00", durationMin: 40, type: "علاج طبيعي", channel: "in-person", status: "completed" },
  { id: "a3", patientId: "p1", employeeId: "e2", date: isoDate(0), time: "11:00", durationMin: 45, type: "متابعة", channel: "in-person", status: "scheduled" },
  { id: "a4", patientId: "p4", employeeId: "e4", date: isoDate(0), time: "12:00", durationMin: 30, type: "علاج نطق", channel: "video", status: "scheduled" },
  { id: "a5", patientId: "p10", employeeId: "e1", date: isoDate(0), time: "13:00", durationMin: 45, type: "تقييم", channel: "in-person", status: "scheduled" },
  { id: "a6", patientId: "p2", employeeId: "e3", date: isoDate(1), time: "09:00", durationMin: 35, type: "علاج وظيفي", channel: "in-person", status: "scheduled" },
  { id: "a7", patientId: "p6", employeeId: "e3", date: isoDate(1), time: "10:00", durationMin: 40, type: "علاج وظيفي", channel: "video", status: "scheduled" },
  { id: "a8", patientId: "p1", employeeId: "e2", date: isoDate(2), time: "09:00", durationMin: 45, type: "علاج طبيعي", channel: "in-person", status: "scheduled" },
  { id: "a9", patientId: "p3", employeeId: "e2", date: isoDate(3), time: "11:00", durationMin: 45, type: "علاج طبيعي", channel: "in-person", status: "scheduled" },
  { id: "a10", patientId: "p5", employeeId: "e1", date: isoDate(5), time: "14:00", durationMin: 45, type: "متابعة", channel: "video", status: "scheduled" },
  { id: "a11", patientId: "p9", employeeId: "e4", date: isoDate(4), time: "10:00", durationMin: 30, type: "علاج نطق", channel: "in-person", status: "scheduled" },
  { id: "a12", patientId: "p4", employeeId: "e4", date: isoDate(-1), time: "09:00", durationMin: 30, type: "علاج نطق", channel: "in-person", status: "missed" },
];

const sessions: RehabSession[] = [
  { id: "s1", patientId: "p3", employeeId: "e2", date: isoDate(0), durationMin: 45, type: "علاج طبيعي", notes: "تحسن ملحوظ في مدى الحركة", attendance: "attended", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "الاستمرار على نفس التمارين مع زيادة التكرار", followUpDate: isoDate(3), status: "completed" },
  { id: "s2", patientId: "p7", employeeId: "e2", date: isoDate(0), durationMin: 40, type: "علاج طبيعي", notes: "تمارين تقوية العضلات", attendance: "attended", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "إضافة تمارين توازن جديدة", followUpDate: isoDate(2), status: "completed" },
  { id: "s3", patientId: "p1", employeeId: "e2", date: isoDate(-1), durationMin: 50, type: "علاج طبيعي", notes: "جلسة متابعة", attendance: "attended", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "متابعة التمارين المنزلية", followUpDate: isoDate(2), status: "completed" },
  { id: "s4", patientId: "p2", employeeId: "e3", date: isoDate(-2), durationMin: 35, type: "علاج وظيفي", notes: "تمارين الحياة اليومية", attendance: "attended", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "التركيز على الاستقلالية في الأكل", followUpDate: isoDate(1), status: "completed" },
  { id: "s5", patientId: "p4", employeeId: "e4", date: isoDate(-3), durationMin: 30, type: "علاج نطق", notes: "تمارين النطق", attendance: "attended", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "تمارين المخاطبة في المنزل", followUpDate: isoDate(0), status: "completed" },
  { id: "s6", patientId: "p5", employeeId: "e1", date: isoDate(-1), durationMin: 45, type: "تقييم", notes: "تقييم شهري", attendance: "attended", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "الاستمرار على الخطة الحالية", followUpDate: isoDate(5), status: "completed" },
  { id: "s7", patientId: "p6", employeeId: "e3", date: isoDate(-1), durationMin: 40, type: "علاج وظيفي", notes: "تحسن في المهارات الحركية الدقيقة", attendance: "attended", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "تمارين الكتابة في المنزل", followUpDate: isoDate(1), status: "completed" },
  { id: "s8", patientId: "p9", employeeId: "e4", date: isoDate(-2), durationMin: 30, type: "علاج نطق", notes: "تمارين المخاطبة", attendance: "late", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "زيادة التكرار في المنزل", followUpDate: isoDate(4), status: "completed" },
  { id: "s9", patientId: "p4", employeeId: "e4", date: isoDate(-1), durationMin: 30, type: "علاج نطق", notes: "لم يحضر المريض", attendance: "missed", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "إعادة جدولة الموعد", followUpDate: null, status: "completed" },
  { id: "s10", patientId: "p10", employeeId: "e1", date: isoDate(-1), durationMin: 45, type: "تقييم", notes: "تقييم أولي", attendance: "attended", completedExerciseIds: [], goalProgressUpdates: [], nextRecommendations: "بدء خطة علاج طبيعي", followUpDate: isoDate(0), status: "completed" },
];

const treatmentPlans: TreatmentPlan[] = [
  { id: "tp1", patientId: "p1", employeeId: "e2", title: "خطة علاج طبيعي - المرحلة الثانية", startDate: isoDate(-60), endDate: isoDate(30), reviewDate: isoDate(7), goals: [{ id: "tp1g1", text: "زيادة مدى الحركة في الكتف", progress: 70 }, { id: "tp1g2", text: "تقوية عضلات الذراع", progress: 60 }], sessionFrequency: "٣ جلسات أسبوعياً", notes: "المريض متجاوب ويستجيب جيداً للعلاج", progress: 65, status: "active" },
  { id: "tp2", patientId: "p2", employeeId: "e3", title: "خطة علاج وظيفي", startDate: isoDate(-45), endDate: isoDate(45), reviewDate: isoDate(14), goals: [{ id: "tp2g1", text: "تحسين مهارات الحياة اليومية", progress: 45 }, { id: "tp2g2", text: "زيادة الاستقلالية", progress: 35 }], sessionFrequency: "مرتان أسبوعياً", notes: "تحسن تدريجي في المهارات", progress: 40, status: "active" },
  { id: "tp3", patientId: "p3", employeeId: "e2", title: "خطة علاج طبيعي - المرحلة الأولى", startDate: isoDate(-120), endDate: isoDate(-10), reviewDate: null, goals: [{ id: "tp3g1", text: "استعادة المشي", progress: 85 }, { id: "tp3g2", text: "تقوية الأطراف السفلية", progress: 75 }], sessionFrequency: "٣ جلسات أسبوعياً", notes: "اكتملت المرحلة الأولى بنجاح", progress: 80, status: "completed" },
  { id: "tp4", patientId: "p5", employeeId: "e1", title: "خطة تأهيل شاملة", startDate: isoDate(-90), endDate: null, reviewDate: isoDate(10), goals: [{ id: "tp4g1", text: "تحسين التوازن", progress: 90 }, { id: "tp4g2", text: "زيادة القدرة على التحمل", progress: 90 }], sessionFrequency: "٤ جلسات أسبوعياً", notes: "تقدم ممتاز", progress: 90, status: "active" },
  { id: "tp5", patientId: "p4", employeeId: "e4", title: "خطة علاج النطق", startDate: isoDate(-30), endDate: isoDate(60), reviewDate: isoDate(21), goals: [{ id: "tp5g1", text: "تحسين وضوح النطق", progress: 25 }, { id: "tp5g2", text: "زيادة المفردات", progress: 25 }], sessionFrequency: "مرتان أسبوعياً", notes: "بداية العلاج", progress: 25, status: "active" },
  { id: "tp6", patientId: "p7", employeeId: "e2", title: "خطة تقوية العضلات", startDate: isoDate(-30), endDate: isoDate(60), reviewDate: isoDate(14), goals: [{ id: "tp6g1", text: "تقوية عضلات الظهر", progress: 65 }, { id: "tp6g2", text: "تحسين وضعية الجسم", progress: 75 }], sessionFrequency: "٣ جلسات أسبوعياً", notes: "تحسن جيد", progress: 70, status: "active" },
  { id: "tp7", patientId: "p6", employeeId: "e3", title: "خطة المهارات الحركية الدقيقة", startDate: isoDate(-20), endDate: isoDate(40), reviewDate: isoDate(10), goals: [{ id: "tp7g1", text: "تحسين مهارات الكتابة", progress: 50 }, { id: "tp7g2", text: "تحسين استخدام الأدوات", progress: 60 }], sessionFrequency: "مرتان أسبوعياً", notes: "تحسن مستمر", progress: 55, status: "active" },
  { id: "tp8", patientId: "p9", employeeId: "e4", title: "خطة تحسين المخاطبة", startDate: isoDate(-15), endDate: isoDate(45), reviewDate: isoDate(7), goals: [{ id: "tp8g1", text: "تحسين طلاقة الكلام", progress: 45 }, { id: "tp8g2", text: "تقليل التردد في الكلام", progress: 55 }], sessionFrequency: "مرتان أسبوعياً", notes: "استجابة جيدة", progress: 50, status: "active" },
];

const exercises: Exercise[] = [
  { id: "ex1", patientId: "p1", title: "تمارين مدى الحركة - الكتف", description: "تحريك الكتف في دوائر بطيئة ١٠ مرات", frequency: "٣ مرات يومياً", safetyNote: "توقف إذا شعرت بألم حاد", status: "active" },
  { id: "ex2", patientId: "p1", title: "تمرين تقوية الذراع", description: "استخدام شريط مطاطي للضغط ١٥ مرة", frequency: "مرتان يومياً", safetyNote: "حافظ على استقامة الظهر", status: "active" },
  { id: "ex3", patientId: "p2", title: "تمارين الحياة اليومية", description: "تمارين ارتداء الملابس واستخدام الأدوات", frequency: "مرة يومياً", safetyNote: "استخدم أدوات آمنة فقط", status: "active" },
  { id: "ex4", patientId: "p4", title: "تمارين النطق - المقاطع", description: "تكرار مقاطع صوتية محددة ٢٠ مرة", frequency: "مرتان يومياً", safetyNote: "رتّب وقتاً هادئاً للتمرين", status: "active" },
  { id: "ex5", patientId: "p5", title: "تمارين التوازن", description: "الوقوف على قدم واحدة ٣٠ ثانية", frequency: "٣ مرات يومياً", safetyNote: "استند على كرسي ثابت للحماية", status: "active" },
  { id: "ex6", patientId: "p3", title: "تمارين المشي", description: "المشي ١٠ دقائق بوتيرة متوسطة", frequency: "مرة يومياً", safetyNote: "ارتدِ حذاء مريح", status: "active" },
  { id: "ex7", patientId: "p7", title: "تمارين تقوية الظهر", description: "تمرين القطة والجمل ١٥ مرة", frequency: "مرتان يومياً", safetyNote: "حافظ على تنفس منتظم", status: "active" },
  { id: "ex8", patientId: "p6", title: "تمارين الكتابة", description: "تتبع خطوط منقطة ١٠ مرات", frequency: "مرة يومياً", safetyNote: "استخدم قلم مريح", status: "active" },
];

const notifications: AppNotification[] = [
  { id: "n1", type: "registration", title: "طلب تسجيل جديد", message: "وصل طلب تسجيل جديد من نورة القحطاني", createdAt: isoDateTime(-2, 5), read: false, link: "/manager/requests/r1", targetRole: "manager" },
  { id: "n2", type: "registration", title: "طلب تسجيل جديد", message: "وصل طلب تسجيل جديد من بدر الشمري", createdAt: isoDateTime(-1, 2), read: false, link: "/manager/requests/r2", targetRole: "manager" },
  { id: "n3", type: "missed-appointment", title: "موعد فائت", message: "لم يحضر المريض ريم الشهري موعد علاج النطق أمس", createdAt: isoDateTime(-1, 12), read: false, link: "/manager/patients/p4", targetRole: "manager" },
  { id: "n4", type: "incomplete-file", title: "ملف غير مكتمل", message: "ملف المريضة لمى المطيري ينقصه تقرير التقييم الأخير", createdAt: isoDateTime(-3, 8), read: false, link: "/manager/patients/p8", targetRole: "manager" },
  { id: "n5", type: "report-review", title: "تقرير بانتظار المراجعة", message: "تقرير الحضور الأسبوعي بانتظار مراجعتك", createdAt: isoDateTime(-4, 10), read: true, link: "/manager/reports", targetRole: "manager" },
  { id: "n6", type: "attendance-change", title: "تغير في معدل الحضور", message: "انخفض معدل الحضور بنسبة ١٠٪ هذا الأسبوع", createdAt: isoDateTime(-5, 6), read: true, link: "/manager/reports", targetRole: "manager" },
  // Therapist notifications
  { id: "n7", type: "plan-review", title: "تذكير مراجعة خطة", message: "خطة علاج طبيعي - المرحلة الثانية لمحمد العتيبي بحاجة لمراجعة خلال أسبوع", createdAt: isoDateTime(-1, 3), read: false, link: "/therapist/plans/tp1", targetRole: "doctor" },
  { id: "n8", type: "patient-followup", title: "تنبيه متابعة مريض", message: "ريم الشهري تحتاج متابعة بعد موعد فائت", createdAt: isoDateTime(-1, 10), read: false, link: "/therapist/patients/p4", targetRole: "doctor" },
  { id: "n9", type: "appointment-change", title: "تغيير في موعد", message: "تمت إعادة جدولة موعد عبدالرحمن السبيعي", createdAt: isoDateTime(-2, 4), read: false, link: "/therapist/appointments", targetRole: "doctor" },
  // Admin notifications
  { id: "n10", type: "registration", title: "تسجيل جديد", message: "طلب تسجيل جديد من نورة القحطاني بحاجة لاستكمال البيانات", createdAt: isoDateTime(-2, 5), read: false, link: "/admin/registrations", targetRole: "admin" },
  { id: "n11", type: "missing-info", title: "معلومات ناقصة", message: "طلب بدر الشمري ينقصه رقم الهاتف", createdAt: isoDateTime(-1, 2), read: false, link: "/admin/registrations", targetRole: "admin" },
  { id: "n12", type: "document-reminder", title: "تذكير مستند", message: "ملف جواهر الحربي ينقصه نسخة الهوية", createdAt: isoDateTime(-3, 6), read: false, link: "/admin/documents", targetRole: "admin" },
  { id: "n13", type: "appointment-change", title: "إلغاء موعد", message: "تم إلغاء موعد لمى المطيري", createdAt: isoDateTime(-1, 8), read: true, link: "/admin/appointments", targetRole: "admin" },
];

const documents: DemoDocument[] = [
  { id: "d1", patientId: "p1", title: "نسخة الهوية", category: "identity", status: "received", uploadedAt: isoDate(-120), notes: "نسخة واضحة" },
  { id: "d2", patientId: "p1", title: "موافقة العلاج", category: "consent", status: "received", uploadedAt: isoDate(-120), notes: "موقعة" },
  { id: "d3", patientId: "p1", title: "تقرير طبي", category: "medical-report", status: "reviewed", uploadedAt: isoDate(-60), notes: "تقريم شامل" },
  { id: "d4", patientId: "p2", title: "نسخة الهوية", category: "identity", status: "received", uploadedAt: isoDate(-90), notes: "" },
  { id: "d5", patientId: "p2", title: "تحويل طبي", category: "referral", status: "missing", uploadedAt: null, notes: "لم يُستلم بعد" },
  { id: "d6", patientId: "p4", title: "نسخة الهوية", category: "identity", status: "missing", uploadedAt: null, notes: "ينقص" },
  { id: "d7", patientId: "p4", title: "موافقة العلاج", category: "consent", status: "received", uploadedAt: isoDate(-60), notes: "موقعة من ولي الأمر" },
  { id: "d8", patientId: "p10", title: "نسخة الهوية", category: "identity", status: "missing", uploadedAt: null, notes: "ينقص" },
  { id: "d9", patientId: "p10", title: "تحويل طبي", category: "referral", status: "received", uploadedAt: isoDate(-55), notes: "تحويل من مستشفى المدينة" },
  { id: "d10", patientId: "p6", title: "موافقة ولي الأمر", category: "consent", status: "received", uploadedAt: isoDate(-45), notes: "موقعة من الأم" },
  { id: "d11", patientId: "p6", title: "تقرير تقييم", category: "medical-report", status: "reviewed", uploadedAt: isoDate(-30), notes: "تقييم أولي" },
  { id: "d12", patientId: "p3", title: "مستند إداري", category: "administrative", status: "received", uploadedAt: isoDate(-200), notes: "استمارة تسجيل" },
];

const conversations: Conversation[] = [
  {
    id: "conv1", patientId: "p6", messages: [
      { id: "m1", sender: "therapist", text: "السلام عليكم، كيف تسير تمارين هند في المنزل؟", timestamp: isoDateTime(-2, 6) },
      { id: "m2", sender: "family", text: "وعليكم السلام، الحمدلہ تسير جيداً وتحب التمارين", timestamp: isoDateTime(-2, 5) },
      { id: "m3", sender: "therapist", text: "ممتاز! واصلوا معها وأخبروني بأي ملاحظة", timestamp: isoDateTime(-2, 4) },
      { id: "m4", sender: "family", text: "شكراً لكم، سنخبركم بكل تطور", timestamp: isoDateTime(-2, 3) },
    ],
  },
  {
    id: "conv2", patientId: "p10", messages: [
      { id: "m5", sender: "therapist", text: "مرحباً، نريد متابعة تقدم جواهر في تمارين التوازن", timestamp: isoDateTime(-1, 4) },
      { id: "m6", sender: "family", text: "مرحباً، حاولنا التمارين أمس وكانت جيدة", timestamp: isoDateTime(-1, 3) },
    ],
  },
];

const companionMessages: CompanionMessage[] = [
  { id: "cm1", sender: "companion", text: "مرحباً بك! أنا مرافقك الذكي التجريبي. كيف يمكنني مساعدتك اليوم؟", timestamp: isoDateTime(0, 0) },
];

export function generateSeedData(): DemoData {
  return {
    patients,
    requests,
    employees,
    appointments,
    treatmentPlans,
    sessions,
    exercises,
    notifications,
    documents,
    conversations,
    companionMessages,
    version: SEED_VERSION,
  };
}

export { SEED_VERSION };
