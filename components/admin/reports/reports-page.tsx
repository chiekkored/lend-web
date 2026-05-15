"use client";

import type { AdminReportSection } from "@/lib/admin-reports";

import { ReportTable } from "./components";
import { useReports } from "./hooks/use-reports";

type ReportsPageProps = {
  section: AdminReportSection;
};

export function ReportsPage({ section }: ReportsPageProps) {
  const { content, data, error, loading } = useReports(section);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          {content.title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {content.description}
        </p>
      </div>
      <ReportTable data={data} error={error} loading={loading} />
    </div>
  );
}
