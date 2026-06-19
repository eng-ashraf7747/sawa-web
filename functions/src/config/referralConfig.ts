export const COLLECTIONS = {
  USERS: "users",
  REFERRAL_CODES: "referralCodes",
  REFERRAL_CODE_REQUESTS: "referralCodeRequests",
  POINTS_LEDGER: "pointsLedger",
} as const;

export const POINTS = {
  SIGNUP_BONUS: 25,
  REFERRAL_JOINER_BONUS: 5,
  REFERRAL_OWNER_BONUS: 5,
} as const;

export const REFERRAL = {
  CODE_LENGTH: 6,
  CODE_VALIDITY_HOURS: 48,
  MAX_MONTHLY_REQUESTS: 3,
} as const;

export const REFERRAL_CODE_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  PENDING: "pending",
  REJECTED: "rejected",
} as const;

export const REFERRAL_REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const POINTS_LEDGER_TYPES = {
  SIGNUP_BONUS: "signup_bonus",
  REFERRAL_JOINER_BONUS: "referral_joiner_bonus",
  REFERRAL_OWNER_BONUS: "referral_owner_bonus",
  ADMIN_ADJUSTMENT: "admin_adjustment",
} as const;