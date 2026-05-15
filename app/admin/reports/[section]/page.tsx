import { notFound } from "next/navigation";

import { ReportsPage } from "@/components/admin/reports";
import { isAdminReportSection } from "@/lib/admin-reports";

export default async function AdminReportsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isAdminReportSection(section)) {
    notFound();
  }

  return <ReportsPage section={section} />;
}
