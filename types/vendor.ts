// C:\sawa-web\types\vendor.ts

export interface DealStat {
  dealId: string;
  dealTitle: string;
  transactionCount: number;
}

export interface VendorStats {
  totalTransactions: number;
  dealStats: DealStat[];
}