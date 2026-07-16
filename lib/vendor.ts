// C:\sawa-web\lib\vendor.ts

import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VendorStats } from "@/types";

// ملاحظة معمارية (16 يوليو 2026): هذا الملف كان يعتمد على مجموعة "transactions"
// عبر streamVendorTransactions() و addTransaction()، لكن الفحص الشامل أثبت
// عدم وجود أي مكان في المشروع بأكمله ينادي addTransaction() فعلياً — كانت
// دالة ميتة تماماً. البيانات الحقيقية لعمليات البيع تُسجَّل في
// "commission_ledger" (عبر lib/commissionLedger.ts، عند تسليم كل حجز فعلياً
// في lib/bookings.ts::markDelivered). الدالتان القديمتان حُذفتا نهائياً،
// واستُبدلتا بدالة واحدة تقرأ من المصدر الحقيقي مباشرة.
export const streamVendorCommissionStats = (
  vendorId: string,
  callback: (stats: VendorStats) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, "commission_ledger"),
    where("vendorId", "==", vendorId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const dealMap = new Map<string, { dealTitle: string; count: number }>();

      snapshot.docs.forEach((d) => {
        const data = d.data();
        const dealId: string = data.dealId ?? "";
        const dealTitle: string = data.dealTitle ?? "";

        if (dealMap.has(dealId)) {
          dealMap.get(dealId)!.count++;
        } else {
          dealMap.set(dealId, { dealTitle, count: 1 });
        }
      });

      const stats: VendorStats = {
        totalTransactions: snapshot.size,
        dealStats: Array.from(dealMap.entries()).map(([dealId, { dealTitle, count }]) => ({
          dealId,
          dealTitle,
          transactionCount: count,
        })),
      };

      callback(stats);
    },
    onError
  );
};