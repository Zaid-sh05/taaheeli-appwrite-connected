import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useSession } from "@/context/SessionContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/manager/SearchInput";
import { StatusFilter } from "@/components/manager/StatusFilter";
import { PatientProgressIndicator } from "@/components/manager/PatientProgressIndicator";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDate } from "@/lib/format";
import { Users, Eye } from "lucide-react";

export function TherapistPatientsPage() {
  useDocumentTitle("المستفيدون");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();
  const { session } = useSession();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  // Identify the current therapist. Fallback to employee "e2" (most assigned patients).
  const therapist = useMemo(() => {
    if (session?.username) {
      const match = data.employees.find(
        (e) =>
          (e.role === "doctor" || e.role === "therapist") &&
          (e.fullName === session.username || e.id === session.username),
      );
      if (match) return match;
    }
    return data.employees.find((e) => e.id === "e2") ?? data.employees.find((e) => e.role === "doctor" || e.role === "therapist");
  }, [data.employees, session]);

  const therapistId = therapist?.id ?? "e2";

  const myPatients = useMemo(
    () => data.patients.filter((p) => p.assignedTherapistId === therapistId),
    [data.patients, therapistId],
  );

  const filtered = useMemo(() => {
    let list = [...myPatients];
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);
    if (planFilter !== "all") {
      list = list.filter((p) => {
        const plan = data.treatmentPlans.find((tp) => tp.patientId === p.id && tp.employeeId === therapistId);
        if (!plan) return false;
        return plan.status === planFilter;
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.fullName.toLowerCase().includes(q) || p.fileNumber.toLowerCase().includes(q));
    }
    return list;
  }, [myPatients, data.treatmentPlans, therapistId, search, statusFilter, planFilter]);

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader title="المستفيدون" subtitle={`${myPatients.length} مستفيد مسند إليك`} actions={<DemoDataBadge />} />
      <h2 ref={headingRef} className="sr-only">قائمة المستفيدين المسند إليك</h2>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالاسم أو رقم الملف" />
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            label="تصفية حسب حالة المستفيد"
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "active", label: "نشط" },
              { value: "inactive", label: "غير نشط" },
            ]}
          />
          <StatusFilter
            value={planFilter}
            onChange={setPlanFilter}
            label="تصفية حسب حالة الخطة"
            options={[
              { value: "all", label: "كل الخطط" },
              { value: "active", label: "نشطة" },
              { value: "completed", label: "مكتملة" },
              { value: "paused", label: "متوقفة" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" aria-hidden="true" />}
            title="لا يوجد مستفيدون"
            description="لا يوجد مستفيدون يطابقون معايير البحث الحالية."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الاسم</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">رقم الملف</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الحالة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الخطة المسندة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">آخر جلسة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الموعد القادم</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">التقدم</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const plan = data.treatmentPlans.find((tp) => tp.patientId === p.id && tp.employeeId === therapistId);
                  return (
                    <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-2 font-semibold text-ink">{p.fullName}</td>
                      <td className="py-3 px-2 text-neutral-600">{p.fileNumber}</td>
                      <td className="py-3 px-2">
                        <Badge tone={p.status === "active" ? "success" : "neutral"}>
                          {p.status === "active" ? "نشط" : "غير نشط"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">
                        {plan ? (
                          <Link to={`/therapist/plans/${plan.id}`} className="text-primary-700 hover:underline">
                            {plan.title}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{p.lastSessionDate ? formatDate(p.lastSessionDate) : "—"}</td>
                      <td className="py-3 px-2 text-sm text-neutral-600">{p.nextAppointmentDate ? formatDate(p.nextAppointmentDate) : "—"}</td>
                      <td className="py-3 px-2 min-w-[120px]"><PatientProgressIndicator value={p.progress} /></td>
                      <td className="py-3 px-2">
                        <Link to={`/therapist/patients/${p.id}`} className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline min-h-[48px]">
                          <Eye className="h-5 w-5" aria-hidden="true" /> ملخص
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
