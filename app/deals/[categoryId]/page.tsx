// C:\sawa-web\app\deals\[categoryId]\page.tsx

"use client";

import { use } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function DealsPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = use(params);

  return <DashboardLayout initialCategoryId={categoryId} />;
}