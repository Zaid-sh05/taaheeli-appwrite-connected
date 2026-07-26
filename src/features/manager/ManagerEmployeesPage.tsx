import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput } from "@/components/manager/SearchInput";
import { StatusFilter } from "@/components/manager/StatusFilter";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Briefcase, Eye } from "lucide-react";
import type { EmployeeRole } from "@/types/demo";

const roleLabels: Record<EmployeeRole, string> = {
  doctor: "طبيب",
  therapist: "أخصائي علاج",
  admin: "إداري",
  nurse: "ممرض",
  coordinator: "منسق",
};

export function ManagerEmployeesPage() {
  useDocumentTitle("الموظفون");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = [...data.employees];
    if (roleFilter !== "all") list = list.filter((e) => e.role === roleFilter);
    if (statusFilter !== "all") list = list.filter((e) => e.employmentStatus === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => e.fullName.toLowerCase().includes(q));
    }
    return list;
  }, [data.employees, search, roleFilter, statusFilter]);

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader title="الموظفون" subtitle={`${data.employees.length} موظف`} actions={<DemoDataBadge />} />
      <h2 ref={headingRef} className="sr-only">قائمة الموظفين</h2>

      <Card>
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالاسم" />
          <StatusFilter
            value={roleFilter}
            onChange={setRoleFilter}
            label="تصفية حسب الدور"
            options={[
              { value: "all", label: "كل الأدوار" },
              { value: "doctor", label: "طبيب" },
              { value: "therapist", label: "أخصائي علاج" },
              { value: "admin", label: "إداري" },
              { value: "nurse", label: "ممرض" },
              { value: "coordinator", label: "منسق" },
            ]}
          />
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            label="تصفية حسب الحالة"
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "active", label: "نشط" },
              { value: "on-leave", label: "في إجازة" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Briefcase className="h-12 w-12" aria-hidden="true" />} title="لا يوجد موظفون" description="لا يوجد موظفون يطابقون معايير البحث الحالية." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الاسم</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الدور</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">التخصص</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الحالة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الحالات المسندة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">مواعيد اليوم</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-2 font-semibold text-ink">{e.fullName}</td>
                    <td className="py-3 px-2 text-neutral-600">{roleLabels[e.role]}</td>
                    <td className="py-3 px-2 text-sm text-neutral-600">{e.specialty}</td>
                    <td className="py-3 px-2"><Badge tone={e.employmentStatus === "active" ? "success" : "warning"}>{e.employmentStatus === "active" ? "نشط" : "في إجازة"}</Badge></td>
                    <td className="py-3 px-2 text-neutral-600">{e.assignedCaseCount}</td>
                    <td className="py-3 px-2 text-neutral-600">{e.todayAppointmentCount}</td>
                    <td className="py-3 px-2">
                      <Link to={`/manager/employees/${e.id}`} className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline min-h-[48px]">
                        <Eye className="h-5 w-5" aria-hidden="true" /> تفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
