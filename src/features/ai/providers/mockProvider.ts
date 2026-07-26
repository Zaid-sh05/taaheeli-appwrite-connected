import { AI_LIMITATIONS, AI_PROVIDER_CONFIG } from "@/config/ai";
import type {
  AIAudience,
  AIEvidence,
  AIProvider,
  AIProviderInput,
  AIResult,
} from "@/types/ai";
import type { DemoData, Patient } from "@/types/demo";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatPercent(value: number): string {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function caseEvidence(data: DemoData, patient: Patient): AIEvidence[] {
  const sessions = data.sessions.filter((item) => item.patientId === patient.id);
  const attended = sessions.filter((item) => item.attendance === "attended").length;
  const plans = data.treatmentPlans.filter((item) => item.patientId === patient.id);
  const activePlan = plans.find((item) => item.status === "active");
  const exercises = data.exercises.filter((item) => item.patientId === patient.id);
  const completedExercises = exercises.filter((item) => item.status === "completed").length;
  const documents = data.documents.filter((item) => item.patientId === patient.id);

  return [
    {
      id: makeId("ev"),
      label: "مؤشر التقدم المسجل",
      value: formatPercent(patient.progress),
      sourceType: "patient",
      sourceId: patient.id,
      recordedAt: patient.lastSessionDate ?? undefined,
    },
    {
      id: makeId("ev"),
      label: "الجلسات والحضور",
      value: `${attended} حضور من أصل ${sessions.length} جلسات`,
      sourceType: "session",
      recordedAt: patient.lastSessionDate ?? undefined,
    },
    {
      id: makeId("ev"),
      label: "الخطة العلاجية النشطة",
      value: activePlan
        ? `${activePlan.title} — تقدم ${formatPercent(activePlan.progress)}`
        : "لا توجد خطة نشطة",
      sourceType: "treatment-plan",
      sourceId: activePlan?.id,
      recordedAt: activePlan?.reviewDate ?? undefined,
    },
    {
      id: makeId("ev"),
      label: "التمارين",
      value: `${completedExercises} مكتمل من أصل ${exercises.length}`,
      sourceType: "exercise",
    },
    {
      id: makeId("ev"),
      label: "المستندات",
      value: `${documents.filter((item) => item.status !== "missing").length} متوفر من أصل ${documents.length}`,
      sourceType: "document",
    },
  ];
}

function caseSummary(
  data: DemoData,
  patient: Patient,
  audience: AIAudience,
): string {
  const sessions = data.sessions
    .filter((item) => item.patientId === patient.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const activePlan = data.treatmentPlans.find(
    (item) => item.patientId === patient.id && item.status === "active",
  );
  const attended = sessions.filter((item) => item.attendance === "attended").length;
  const attendanceRate =
    sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;
  const latest = sessions[0];

  if (audience === "parent") {
    return [
      `${patient.fullName} مستمر في برنامج التأهيل، ومؤشر التقدم التجريبي الحالي هو ${formatPercent(patient.progress)}.`,
      `تم تسجيل ${sessions.length} جلسات بنسبة حضور ${formatPercent(attendanceRate)}.`,
      activePlan
        ? `الخطة الحالية هي «${activePlan.title}» وتقدمها المسجل ${formatPercent(activePlan.progress)}.`
        : "لا توجد خطة علاجية نشطة مسجلة حالياً.",
      "هذه صياغة أولية مبسطة ولن تظهر للأسرة بصفتها نتيجة معتمدة قبل مراجعة المختص.",
    ].join("\n\n");
  }

  return [
    `ملخص حالة تجريبي للمستفيد ${patient.fullName} (${patient.fileNumber}).`,
    `مؤشر التقدم المسجل ${formatPercent(patient.progress)}، وعدد الجلسات ${sessions.length}، ومعدل الحضور ${formatPercent(attendanceRate)}.`,
    activePlan
      ? `الخطة النشطة: ${activePlan.title}. تقدم الخطة ${formatPercent(activePlan.progress)} وتضم ${activePlan.goals.length} أهداف.`
      : "لا توجد خطة علاجية نشطة مسجلة.",
    latest
      ? `آخر جلسة مسجلة بتاريخ ${latest.date}: ${latest.notes || "لا توجد ملاحظات"}.`
      : "لا توجد جلسات مسجلة حتى الآن.",
    "يجب على المختص التحقق من دقة الملخص وتعديله قبل اعتماده.",
  ].join("\n\n");
}

function recommendationDraft(
  data: DemoData,
  patient: Patient,
  audience: AIAudience,
): string {
  const sessions = data.sessions.filter((item) => item.patientId === patient.id);
  const attended = sessions.filter((item) => item.attendance === "attended").length;
  const attendanceRate =
    sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;
  const activePlan = data.treatmentPlans.find(
    (item) => item.patientId === patient.id && item.status === "active",
  );
  const latest = [...sessions].sort((a, b) => b.date.localeCompare(a.date))[0];
  const suggestions: string[] = [];

  if (attendanceRate < 80) {
    suggestions.push("مراجعة انتظام المواعيد ومعالجة أسباب الغياب أو التأخر.");
  } else {
    suggestions.push("المحافظة على انتظام الحضور الحالي.");
  }
  if (activePlan?.reviewDate) {
    suggestions.push(`مراجعة الخطة في موعدها المسجل (${activePlan.reviewDate}).`);
  }
  if (latest?.nextRecommendations) {
    suggestions.push(`التحقق من توصية الجلسة الأخيرة: ${latest.nextRecommendations}.`);
  }
  if (suggestions.length === 0) {
    suggestions.push("استكمال التقييم المهني قبل اقتراح أي تعديل على الخطة.");
  }

  const intro =
    audience === "parent"
      ? `مسودة إرشادات منزلية مبسطة لأسرة ${patient.fullName}:`
      : `مسودة نقاط متابعة للمختص حول حالة ${patient.fullName}:`;

  return [
    intro,
    ...suggestions.map((item, index) => `${index + 1}. ${item}`),
    "",
    "لا تُعد هذه النقاط توصية طبية، ولا يجوز تغيير الخطة العلاجية بناءً عليها تلقائياً.",
  ].join("\n");
}

function progressDraft(
  data: DemoData,
  patient: Patient,
  audience: AIAudience,
): string {
  const plan = data.treatmentPlans.find(
    (item) => item.patientId === patient.id && item.status === "active",
  );
  const sessions = data.sessions.filter((item) => item.patientId === patient.id);
  const attended = sessions.filter((item) => item.attendance === "attended").length;
  const attendanceRate =
    sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;
  const goalText = plan?.goals.length
    ? plan.goals
        .map((goal) => `• ${goal.text}: ${formatPercent(goal.progress)}`)
        .join("\n")
    : "• لا توجد أهداف نشطة مسجلة.";

  if (audience === "parent") {
    return [
      `تحليل تقدم تجريبي مبسط لـ${patient.fullName}:`,
      `مؤشر التقدم الحالي ${formatPercent(patient.progress)}، ومعدل الحضور ${formatPercent(attendanceRate)}.`,
      goalText,
      "هذه النسب وصف للبيانات التجريبية الحالية وليست توقعاً طبياً لمستوى التحسن.",
    ].join("\n\n");
  }

  return [
    `تحليل تقدم تجريبي للمستفيد ${patient.fullName}:`,
    `المؤشر الحالي ${formatPercent(patient.progress)}، وتقدم الخطة ${formatPercent(plan?.progress ?? 0)}، ومعدل الحضور ${formatPercent(attendanceRate)}.`,
    "تفصيل الأهداف:",
    goalText,
    "لا تتوفر في النموذج الحالي سلسلة زمنية كافية لحساب تغير سببي أو توقع مستقبلي موثوق.",
  ].join("\n\n");
}

function centerSummary(data: DemoData): { content: string; evidence: AIEvidence[] } {
  const activePatients = data.patients.filter((item) => item.status === "active");
  const completedSessions = data.sessions.filter((item) => item.status === "completed");
  const attended = completedSessions.filter((item) => item.attendance === "attended").length;
  const attendanceRate =
    completedSessions.length > 0
      ? Math.round((attended / completedSessions.length) * 100)
      : 0;
  const averageProgress =
    activePatients.length > 0
      ? Math.round(
          activePatients.reduce((sum, item) => sum + item.progress, 0) /
            activePatients.length,
        )
      : 0;
  const missingDocuments = data.documents.filter((item) => item.status === "missing").length;

  return {
    content: [
      "ملخص إداري تجريبي لأداء المركز:",
      `يوجد ${activePatients.length} مستفيدين نشطين، و${completedSessions.length} جلسة مكتملة مسجلة.`,
      `معدل الحضور الإجمالي ${formatPercent(attendanceRate)}، ومتوسط مؤشر التقدم ${formatPercent(averageProgress)}.`,
      `يوجد ${missingDocuments} مستندات ناقصة و${data.requests.filter((item) => item.status === "pending").length} طلبات تفعيل معلقة.`,
      "هذا الملخص إداري مجمع ولا يعرض ملاحظات علاجية أو تفاصيل سريرية فردية.",
    ].join("\n\n"),
    evidence: [
      {
        id: makeId("ev"),
        label: "المستفيدون النشطون",
        value: String(activePatients.length),
        sourceType: "aggregate",
      },
      {
        id: makeId("ev"),
        label: "الجلسات المكتملة",
        value: String(completedSessions.length),
        sourceType: "aggregate",
      },
      {
        id: makeId("ev"),
        label: "معدل الحضور",
        value: formatPercent(attendanceRate),
        sourceType: "aggregate",
      },
      {
        id: makeId("ev"),
        label: "متوسط مؤشر التقدم",
        value: formatPercent(averageProgress),
        sourceType: "aggregate",
      },
      {
        id: makeId("ev"),
        label: "المستندات الناقصة",
        value: String(missingDocuments),
        sourceType: "aggregate",
      },
    ],
  };
}

function titleFor(input: AIProviderInput, patientName: string | null): string {
  if (input.request.scope === "center") return "الملخص الإداري الذكي للمركز";
  if (input.request.agent === "case-summary") return `ملخص حالة ${patientName ?? ""}`;
  if (input.request.agent === "recommendation") return `مسودة توصيات ${patientName ?? ""}`;
  return `تحليل تطور ${patientName ?? ""}`;
}

const urgentTerms = [
  "انتحار",
  "أؤذي نفسي",
  "أذي نفسي",
  "خطر",
  "نزيف",
  "لا أتنفس",
  "ما بتنفس",
  "فاقد الوعي",
  "طوارئ",
];

const clinicalTerms = [
  "دواء",
  "جرعة",
  "تشخيص",
  "أوقف العلاج",
  "أغير العلاج",
  "ألم شديد",
  "هل عندي",
];

export class MockAIProvider implements AIProvider {
  readonly id = AI_PROVIDER_CONFIG.id;
  readonly version = AI_PROVIDER_CONFIG.version;

  async generate(input: AIProviderInput): Promise<AIResult> {
    await wait(AI_PROVIDER_CONFIG.simulatedLatencyMs);

    let patient: Patient | undefined;
    let content: string;
    let evidence: AIEvidence[];

    if (input.request.scope === "center") {
      const center = centerSummary(input.data);
      content = center.content;
      evidence = center.evidence;
    } else {
      patient = input.data.patients.find(
        (item) => item.id === input.request.patientId,
      );
      if (!patient) throw new Error("لم يتم العثور على ملف المستفيد.");
      evidence = caseEvidence(input.data, patient);

      if (input.request.agent === "case-summary") {
        content = caseSummary(input.data, patient, input.request.audience);
      } else if (input.request.agent === "recommendation") {
        content = recommendationDraft(
          input.data,
          patient,
          input.request.audience,
        );
      } else {
        content = progressDraft(input.data, patient, input.request.audience);
      }
    }

    return {
      id: makeId("ai"),
      patientId: patient?.id ?? null,
      patientName: patient?.fullName ?? null,
      agent: input.request.agent,
      scope: input.request.scope,
      audience: input.request.audience,
      title: titleFor(input, patient?.fullName ?? null),
      content,
      evidence,
      confidence: null,
      status: "draft",
      limitations: [...AI_LIMITATIONS],
      requiresHumanReview: true,
      modelVersion: this.version,
      generatedAt: new Date().toISOString(),
      generatedBy: input.actorName,
    };
  }

  async companionReply(message: string) {
    await wait(AI_PROVIDER_CONFIG.simulatedLatencyMs);
    const normalized = message.trim().toLowerCase();

    if (urgentTerms.some((term) => normalized.includes(term))) {
      return {
        text: "قد تكون هذه حالة طارئة. لا تعتمد على المرافق التجريبي. اطلب مساعدة شخص قريب واتصل بخدمات الطوارئ المحلية أو بالمركز فوراً.",
        safetyAction: "emergency" as const,
      };
    }

    if (clinicalTerms.some((term) => normalized.includes(term))) {
      return {
        text: "لا أستطيع تشخيص الحالة أو اقتراح دواء أو تغيير الخطة العلاجية. تواصل مع المختص في المركز ليراجع حالتك بشكل آمن.",
        safetyAction: "refer-to-center" as const,
      };
    }

    if (normalized.includes("تشجيع")) {
      return {
        text: "أنت تبذل جهداً مهماً في رحلة التأهيل. ركّز اليوم على خطوة واحدة من برنامجك المعتمد واحتفل بإنجازها، فالتقدم يتكوّن من خطوات صغيرة ومتكررة.",
        safetyAction: "none" as const,
      };
    }

    if (normalized.includes("برنامجي") || normalized.includes("برنامج اليوم")) {
      return {
        text: "راجع تمارينك ومواعيدك الظاهرة في التطبيق، وابدأ فقط بالأنشطة التي اعتمدها مختص المركز. المرافق التجريبي لا يضيف تمارين جديدة ولا يغيّر الخطة.",
        safetyAction: "none" as const,
      };
    }

    if (normalized.includes("استرخاء")) {
      return {
        text: "جرّب تهدئة عامة: اجلس بوضع مريح وخذ أنفاساً هادئة دون إجهاد. إذا شعرت بألم أو دوخة فتوقف وتواصل مع المختص. هذا دعم عام وليس تمريناً علاجياً.",
        safetyAction: "none" as const,
      };
    }

    if (normalized.includes("التواصل مع المركز")) {
      return {
        text: "يمكنك الانتقال إلى صفحة المواعيد لطلب التواصل مع فريق المركز. في حالة الطوارئ اتصل بالرقم 911 فوراً.",
        safetyAction: "refer-to-center" as const,
      };
    }

    return {
      text: "شكراً لمشاركتك. أنا مرافق تجريبي للدعم العام والتذكير فقط. واصل خطوات برنامجك المعتمد، وإذا كان سؤالك صحياً أو علاجياً فتواصل مع مختص المركز.",
      safetyAction: "none" as const,
    };
  }
}
