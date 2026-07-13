import {initializeApp} from "firebase-admin/app";

initializeApp();

export {onUserRegistered} from "./auth/onUserRegistered";
export {onFirstLogin} from "./auth/onFirstLogin";
export {onReferralRequest} from "./auth/onReferralRequest";
export {onAdminApprove} from "./auth/onAdminApprove";
export {scheduledExpiry} from "./auth/scheduledExpiry";
export {scheduledDealExpiry} from "./deals/scheduledDealExpiry";