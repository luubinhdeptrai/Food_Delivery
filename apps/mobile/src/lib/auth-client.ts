import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { phoneNumberClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Get the local IP address for the backend when running in development
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0] || "localhost";
  return `http://${localhost}:3000`;
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [
    expoClient({
      scheme: "uitfood",
      storagePrefix: "uitfood",
      storage: SecureStore,
    }),
    phoneNumberClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
