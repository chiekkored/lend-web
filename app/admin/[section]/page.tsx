import { notFound } from "next/navigation";

import { BookingsPage } from "@/components/admin/bookings";
import { ListingsPage } from "@/components/admin/listings";
import { ManagementSection } from "@/components/admin/management-section";
import { isAdminSection } from "@/lib/admin-data";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isAdminSection(section)) {
    notFound();
  }

  if (section === "listings") {
    return <ListingsPage />;
  }

  if (section === "bookings") {
    return <BookingsPage />;
  }

  return <ManagementSection section={section} />;
}
