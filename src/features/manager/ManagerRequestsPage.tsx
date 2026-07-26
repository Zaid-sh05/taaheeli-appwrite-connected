import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDemoData } from "@/context/DemoDataContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFocusOnMount } from "@/hooks/useFocusOnMount";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchInput } from "@/components/manager/SearchInput";
import { StatusFilter } from "@/components/manager/StatusFilter";
import { RequestStatusBadge } from "@/components/manager/RequestStatusBadge";
import { DemoDataBadge } from "@/components/manager/DemoDataBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDateTime } from "@/lib/format";
import { UserPlus, Phone, Mail, Eye, Users } from "lucide-react";

export function ManagerRequestsPage() {
  useDocumentTitle("طلبات التفعيل");
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const { data } = useDemoData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const pendingCount = useMemo(() => data.requests.filter((r) => r.status === "pending").length, [data.requests]);

  const filtered = useMemo(() => {
    let list = [...data.requests];
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.fullName.toLowerCase().includes(q) || r.username.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [data.requests, search, statusFilter]);

  return (
    <PageContainer maxWidth="max-w-5xl" className="py-8">
      <PageHeader title="طلبات التفعيل" subtitle={`${pendingCount} طلب بانتظار التفعيل`} actions={<DemoDataBadge />} />
      <h2 ref={headingRef} className="sr-only">قائمة طلبات التفعيل</h2>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="ابحث بالاسم أو اسم المستخدم" />
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "كل الحالات" },
              { value: "pending", label: "بانتظار" },
              { value: "approved", label: "مقبول" },
              { value: "rejected", label: "مرفوض" },
              { value: "info-requested", label: "استكمال مطلوب" },
            ]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<UserPlus className="h-12 w-12" aria-hidden="true" />} title="لا توجد طلبات" description="لا توجد طلبات تطابق معايير البحث الحالية." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-neutral-200 text-start">
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">التاريخ</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">اسم المتقدم</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">بمساعدة مرافق</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الهاتف / البريد</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">الحالة</th>
                  <th scope="col" className="py-3 px-2 text-start font-semibold text-neutral-600">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-2 text-sm text-neutral-600">{formatDateTime(r.submittedAt)}</td>
                    <td className="py-3 px-2 font-semibold text-ink">{r.fullName}</td>
                    <td className="py-3 px-2">
                      {r.hasCaregiver ? (
                        <span className="inline-flex items-center gap-1 text-sm text-neutral-600"><Users className="h-4 w-4" aria-hidden="true" /> {r.caregiverRelation}</span>
                      ) : <span className="text-sm text-neutral-400">—</span>}
                    </td>
                    <td className="py-3 px-2 text-sm text-neutral-600">
                      {r.phone && <span className="block"><Phone className="inline h-4 w-4 ms-1" aria-hidden="true" />{r.phone}</span>}
                      {r.email && <span className="block"><Mail className="inline h-4 w-4 ms-1" aria-hidden="true" />{r.email}</span>}
                      {!r.phone && !r.email && <span className="text-neutral-400">—</span>}
                    </td>
                    <td className="py-3 px-2"><RequestStatusBadge status={r.status} /></td>
                    <td className="py-3 px-2">
                      <Link to={`/manager/requests/${r.id}`} className="inline-flex items-center gap-1 text-base font-semibold text-primary-700 hover:underline min-h-[48px]">
                        <Eye className="h-5 w-5" aria-hidden="true" /> عرض
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
