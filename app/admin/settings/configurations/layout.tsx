import type { ReactNode } from "react";

import { ConfigurationsLayout } from "@/components/admin/settings/configurations";

export default function AdminConfigurationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ConfigurationsLayout>{children}</ConfigurationsLayout>;
}
