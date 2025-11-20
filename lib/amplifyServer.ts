import { cookies, headers } from "next/headers";
import { runWithAmplifyServerContext } from "aws-amplify/adapter-core";
import { getCurrentUser } from "aws-amplify/auth/server";

// Sem outputs aqui — Gen1/Gen2 server não aceita amplify_outputs.json

export async function getUserServerSide() {
  return runWithAmplifyServerContext(
    // 1️⃣ amplifyConfig (vazio ou {})
    {},

    // 2️⃣ libraryOptions
    {
      cookies,
      headers,
    },

    // 3️⃣ operation
    async (contextSpec) => {
      try {
        return await getCurrentUser(contextSpec);
      } catch {
        return null;
      }
    }
  );
}
