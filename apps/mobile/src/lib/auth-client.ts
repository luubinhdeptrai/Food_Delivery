import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { phoneNumberClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0] || "localhost";
  return `http://${localhost}:3000`.replace(/\/+$/, "");
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
