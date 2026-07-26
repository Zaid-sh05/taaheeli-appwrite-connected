import { useMemo, useState } from "react";
import { useDemoData } from "@/context/DemoDataContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DateRangeFilter } from "@/components/manager/DateRangeFilter";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { MonthlySessionsChart } from "@/components/charts/MonthlySessionsChart";
import { downloadCSV } from "@/lib/csv";
import { printReport } from "@/lib/print";
import { formatDate } from "@/lib/format";
import { Download, Printer, TrendingUp, Calendar, Users, Activity } from "lucide-react";
import type { EmployeeRole } from "@/types/demo";

const roleLabels: Record<EmployeeRole, string> = {
  doctor: "طبيب",
  therapist: "أخصائي علاج",
  admin: "إداري",
  nurse: "ممرض",
  coordinator: "منسق",
};

export function ManagerReportsPage() {
  useDocumentTitle("التقارير");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();
  const { showToast } = useToast();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportType, setReportType] = useState("attendance");

  const filteredSessions = useMemo(() => {
    let list = [...data.sessions];
    if (fromDate) list = list.filter((s) => s.date >= fromDate);
    if (toDate) list = list.filter((s) => s.date <= toDate);
    return list;
  }, [data.sessions, fromDate, toDate]);

  const summary = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const attended = filteredSessions.filter((s) => s.attendance === "attended").length;
    const missed = filteredSessions.filter((s) => s.attendance === "missed").length;
    const late = filteredSessions.filter((s) => s.attendance === "late").length;
    const attendanceRate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;
    const activePatients = data.patients.filter((p) => p.status === "active").length;
    const avgProgress = data.patients.length > 0 ? Math.round(data.patients.reduce((sum, p) => sum + p.progress, 0) / data.patients.length) : 0;

    const workload = data.employees.map((e) => ({
      employeeId: e.id,
      employeeName: e.fullName,
      role: roleLabels[e.role],
      sessions: filteredSessions.filter((s) => s.employeeId === e.id).length,
      patients: data.patients.filter((p) => p.assignedTherapistId === e.id).length,
    }));

    return { totalSessions, attended, missed, late, attendanceRate, activePatients, avgProgress, workload };
  }, [filteredSessions, data.patients, data.employees]);

  const attendanceData = useMemo(() => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"];
    return days.map((day, i) => {
      const daySessions = filteredSessions.filter((s) => {
        const d = new Date(s.date);
        return d.getDay() === (i === 6 ? 0 : i + 1);
      });
      return { day, attended: daySessions.filter((s) => s.attendance === "attended").length, missed: daySessions.filter((s) => s.attendance === "missed").length };
    });
  }, [filteredSessions]);

  const monthlyData = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
    return months.map((month, i) => ({ month, count: Math.floor(20 + i * 5 + Math.random() * 15) }));
  }, []);

  function handleExportCSV() {
    const dateRange = fromDate && toDate ? `${fromDate}_${toDate}` : "all";
    const filename = `taaheeli-report-${dateRange}.csv`;

    if (reportType === "attendance") {
      downloadCSV(filename, ["اليوم", "حضر", "غاب"], attendanceData.map((d) => [d.day, d.attended, d.missed]));
    } else if (reportType === "sessions") {
      downloadCSV(filename, ["اسم المستفيد", "النوع", "التاريخ", "الحضور", "الملاحظات"], filteredSessions.map((s) => {
        const p = data.patients.find((p) => p.id === s.patientId);
        return [p?.fullName ?? "", s.type, s.date, s.attendance === "attended" ? "حضر" : s.attendance === "missed" ? "غاب" : "تأخر", s.notes];
      }));
    } else if (reportType === "progress") {
      downloadCSV(filename, ["اسم المستفيد", "رقم الملف", "الحالة", "نسبة التقدم"], data.patients.map((p) => [p.fullName, p.fileNumber, p.status === "active" ? "نشط" : "غير نشط", `${p.progress}%`]));
    } else if (reportType === "workload") {
      downloadCSV(filename, ["اسم الموظف", "الدور", "عدد الجلسات", "عدد المستفيدين"], summary.workload.map((w) => [w.employeeName, w.role, w.sessions, w.patients]));
    }
    showToast("تم تصدير التقرير بنجاح", "success");
  }

  function handlePrint() {
    const bodyHTML = `
      <div class="summary-grid">
        <div class="summary-card"><div class="label">إجمالي الجلسات</div><div class="value">${summary.totalSessions}</div></div>
        <div class="summary-card"><div class="label">معدل الحضور</div><div class="value">${summary.attendanceRate}%</div></div>
        <div class="summary-card"><div class="label">المستفيدون النشطون</div><div class="value">${summary.activePatients}</div></div>
      </div>
      <p class="section-title">تفاصيل الحضور</p>
      <table><thead><tr><th>اليوم</th><th>حضر</th><th>غاب</th></tr></thead><tbody>
        ${attendanceData.map((d) => `<tr><td>${d.day}</td><td>${d.attended}</td><td>${d.missed}</td></tr>`).join("")}
      </tbody></table>
      <p class="section-title">عبء عمل الموظفين</p>
      <table><thead><tr><th>الموظف</th><th>الدور</th><th>الجلسات</th><th>المستفيدون</th></tr></thead><tbody>
        ${summary.workload.map((w) => `<tr><td>${w.employeeName}</td><td>${w.role}</td><td>${w.sessions}</td><td>${w.patients}</td></tr>`).join("")}
      </tbody></table>
    `;
    printReport({ title: `تقرير تأهيلي — ${fromDate ? formatDate(fromDate) : "كل الفترات"} إلى ${toDate ? formatDate(toDate) : "اليوم"}`, bodyHTML });
    showToast("تم فتح نافذة الطباعة", "info");
  }

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader title="التقارير" subtitle="تقارير النشاط والحضور والأداء" actions={<DemoDataBadge />} />
      <h2 ref={headingRef} className="sr-only">صفحة التقارير</h2>

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <DateRangeFilter from={fromDate} to={toDate} onFromChange={setFromDate} onToChange={setToDate} />
          <div>
            <label htmlFor="report-type" className="block text-sm font-semibold text-neutral-600 mb-1">نوع التقرير</label>
            <Select id="report-type" value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="attendance">تقرير الحضور</option>
              <option value="sessions">تقرير الجلسات</option>
              <option value="progress">تقرير تقدم المستفيدين</option>
              <option value="workload">تقرير عبء العمل</option>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={handleExportCSV} leftIcon={<Download className="h-5 w-5" aria-hidden="true" />}>تصدير CSV</Button>
          <Button variant="secondary" onClick={handlePrint} leftIcon={<Printer className="h-5 w-5" aria-hidden="true" />}>طباعة التقرير</Button>
        </div>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><div className="flex items-center gap-3"><Activity className="h-8 w-8 text-primary-600" aria-hidden="true" /><div><p className="text-sm text-neutral-600">إجمالي الجلسات</p><p className="text-2xl font-bold text-ink">{summary.totalSessions}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><TrendingUp className="h-8 w-8 text-success-600" aria-hidden="true" /><div><p className="text-sm text-neutral-600">معدل الحضور</p><p className="text-2xl font-bold text-ink">{summary.attendanceRate}%</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><Users className="h-8 w-8 text-accent-600" aria-hidden="true" /><div><p className="text-sm text-neutral-600">المستفيدون النشطون</p><p className="text-2xl font-bold text-ink">{summary.activePatients}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><Calendar className="h-8 w-8 text-secondary-600" aria-hidden="true" /><div><p className="text-sm text-neutral-600">متوسط التقدم</p><p className="text-2xl font-bold text-ink">{summary.avgProgress}%</p></div></div></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">الحضور الأسبوعي</h3>
          <AttendanceChart data={attendanceData} />
        </Card>
        <Card>
          <h3 className="text-xl font-bold text-ink mb-4">الجلسات الشهرية</h3>
          <MonthlySessionsChart data={monthlyData} />
        </Card>
      </div>

      {/* Tabular summaries */}
      {reportType === "attendance" && (
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-4">ملخص الحضور</h3>
          <div className="overflow-x-auto"><table className="w-full text-base"><thead><tr className="border-b border-neutral-200"><th className="py-2 px-2 text-start font-semibold text-neutral-600">اليوم</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">حضر</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">غاب</th></tr></thead><tbody>
            {attendanceData.map((d) => <tr key={d.day} className="border-b border-neutral-100"><td className="py-2 px-2">{d.day}</td><td className="py-2 px-2">{d.attended}</td><td className="py-2 px-2">{d.missed}</td></tr>)}
          </tbody></table></div>
        </Card>
      )}

      {reportType === "workload" && (
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-4">ملخص عبء العمل</h3>
          <div className="overflow-x-auto"><table className="w-full text-base"><thead><tr className="border-b border-neutral-200"><th className="py-2 px-2 text-start font-semibold text-neutral-600">الموظف</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">الدور</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">الجلسات</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">المستفيدون</th></tr></thead><tbody>
            {summary.workload.map((w) => <tr key={w.employeeId} className="border-b border-neutral-100"><td className="py-2 px-2 font-semibold">{w.employeeName}</td><td className="py-2 px-2">{w.role}</td><td className="py-2 px-2">{w.sessions}</td><td className="py-2 px-2">{w.patients}</td></tr>)}
          </tbody></table></div>
        </Card>
      )}

      {reportType === "sessions" && (
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-4">ملخص الجلسات</h3>
          <div className="overflow-x-auto"><table className="w-full text-base"><thead><tr className="border-b border-neutral-200"><th className="py-2 px-2 text-start font-semibold text-neutral-600">المستفيد</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">النوع</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">التاريخ</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">الحضور</th></tr></thead><tbody>
            {filteredSessions.slice(0, 20).map((s) => { const p = data.patients.find((p) => p.id === s.patientId); return <tr key={s.id} className="border-b border-neutral-100"><td className="py-2 px-2 font-semibold">{p?.fullName ?? "—"}</td><td className="py-2 px-2">{s.type}</td><td className="py-2 px-2">{formatDate(s.date)}</td><td className="py-2 px-2">{s.attendance === "attended" ? "حضر" : s.attendance === "missed" ? "غاب" : "تأخر"}</td></tr>; })}
          </tbody></table></div>
        </Card>
      )}

      {reportType === "progress" && (
        <Card className="mb-6">
          <h3 className="text-xl font-bold text-ink mb-4">ملخص تقدم المستفيدين</h3>
          <div className="overflow-x-auto"><table className="w-full text-base"><thead><tr className="border-b border-neutral-200"><th className="py-2 px-2 text-start font-semibold text-neutral-600">المستفيد</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">رقم الملف</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">الحالة</th><th className="py-2 px-2 text-start font-semibold text-neutral-600">التقدم</th></tr></thead><tbody>
            {data.patients.map((p) => <tr key={p.id} className="border-b border-neutral-100"><td className="py-2 px-2 font-semibold">{p.fullName}</td><td className="py-2 px-2">{p.fileNumber}</td><td className="py-2 px-2">{p.status === "active" ? "نشط" : "غير نشط"}</td><td className="py-2 px-2">{p.progress}%</td></tr>)}
          </tbody></table></div>
        </Card>
      )}
    </PageContainer>
  );
}
