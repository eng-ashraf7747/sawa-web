// C:\sawa-web\types\transaction.ts

export type TransactionStatus = "completed" | "pending" | "cancelled";

export interface Transaction {
  id: string;
  vendorId: string;
  dealId: string;
  dealTitle: string;
  timestamp: Date;
  status: TransactionStatus;
}

export type CreateTransactionInput = Omit<Transaction, "id">;