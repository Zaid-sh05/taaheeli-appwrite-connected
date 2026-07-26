import { Account, Client, Storage, TablesDB } from "appwrite";

const env = import.meta.env;

export const appwriteConfig = {
  endpoint:
    env.VITE_APPWRITE_ENDPOINT ?? "https://fra.cloud.appwrite.io/v1",
  projectId:
    env.VITE_APPWRITE_PROJECT_ID ?? "6a63a421002012bff3da",
  databaseId:
    env.VITE_APPWRITE_DATABASE_ID ?? "6a63a8f7000dad3594df",

  tables: {
    profiles: env.VITE_APPWRITE_PROFILES_TABLE_ID ?? "profiles",
    patients: env.VITE_APPWRITE_PATIENTS_TABLE_ID ?? "patients",
    registrationRequests:
      env.VITE_APPWRITE_REGISTRATION_REQUESTS_TABLE_ID ??
      "registration_requests",
    employees: env.VITE_APPWRITE_EMPLOYEES_TABLE_ID ?? "employees",
    appointments:
      env.VITE_APPWRITE_APPOINTMENTS_TABLE_ID ?? "appointments",
    sessions: env.VITE_APPWRITE_SESSIONS_TABLE_ID ?? "sessions",
    treatmentPlans:
      env.VITE_APPWRITE_TREATMENT_PLANS_TABLE_ID ?? "treatment_plans",
    caregiverPatients:
      env.VITE_APPWRITE_CAREGIVER_PATIENTS_TABLE_ID ??
      "caregiver_patients",
  },

  buckets: {
    profileAvatars:
      env.VITE_APPWRITE_PROFILE_AVATARS_BUCKET_ID ?? "",
    patientFiles:
      env.VITE_APPWRITE_PATIENT_FILES_BUCKET_ID ?? "",
  },
};

export const appwriteClient = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(appwriteClient);
export const tablesDB = new TablesDB(appwriteClient);
export const storage = new Storage(appwriteClient);
