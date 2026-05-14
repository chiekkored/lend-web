import { notFound } from "next/navigation";

import { UserDirectoryPage } from "@/components/admin/users/user-directory-page";
import { isUserDirectorySection } from "@/lib/admin-users";

export default async function AdminUsersSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isUserDirectorySection(section)) {
    notFound();
  }

  return <UserDirectoryPage section={section} />;
}
