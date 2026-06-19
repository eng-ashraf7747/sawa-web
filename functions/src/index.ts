import {initializeApp} from "firebase-admin/app";

initializeApp();

export {onUserRegistered} from "./auth/onUserRegistered";
export {onFirstLogin} from "./auth/onFirstLogin";