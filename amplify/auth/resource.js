import { defineAuth } from "@aws-amplify/backend";

export const auth = defineAuth({
  loginWith: {
    preferredUsername: false,
    email: true
  },
  socialProviders: {
    google: {
      scopes: ["openid", "email", "profile"],
    },
  },
});

