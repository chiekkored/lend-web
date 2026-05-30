import { notFound } from "next/navigation";

import { AdminRegisterForm } from "@/components/admin/admin-register-form";

export default function AdminRegisterPage() {
  if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATORS !== "true") {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <AdminRegisterForm />
    </main>
  );
}
