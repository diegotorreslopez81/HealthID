import { initializeApp, applicationDefault } from "firebase-admin/app";

const admin  = initializeApp({
  credential: applicationDefault(),
});

export default admin;
