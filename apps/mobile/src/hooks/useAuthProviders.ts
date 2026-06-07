import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import type { AuthProvider, LoginRequest, LoginResponse } from "@documind/types";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/api";

const GITHUB_DISCOVERY = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint:
    "https://github.com/settings/connections/applications/TU_CLIENT_ID",
};

const GOOGLE_REDIRECT_URI =
  process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI ||
  makeRedirectUri({ native: "documind:/oauthredirect" });
const GITHUB_REDIRECT = makeRedirectUri({ scheme: "documind" });
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_ID?.trim();
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_ID?.trim();
const GOOGLE_CLIENT_ID = Platform.select({
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_ID,
  ios: GOOGLE_IOS_CLIENT_ID,
  default: GOOGLE_WEB_CLIENT_ID,
});
const USE_NATIVE_GOOGLE_SIGN_IN = Platform.OS === "android";

export function useAuthProviders(onSuccess: () => void) {
  const { signIn } = useAuth();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  useEffect(() => {
    if (!USE_NATIVE_GOOGLE_SIGN_IN || !GOOGLE_WEB_CLIENT_ID) {
      return;
    }

    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  // Keep AuthSession only for non-Android Google flows.
  const [requestGoogle, responseGoogle, promptAsyncGoogle] =
    Google.useAuthRequest({
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
      shouldAutoExchangeCode: false,
    });

  // GitHub continues to use AuthSession.
  const [requestGithub, responseGithub, promptAsyncGithub] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
      scopes: ["read:user", "user:email"],
      redirectUri: GITHUB_REDIRECT,
    },
    GITHUB_DISCOVERY
  );

  // Shared backend exchange used by both providers.
  const handleAuthWithBackend = async (
    code: string,
    provider: AuthProvider,
    redirectUri?: string,
    codeVerifier?: string,
    clientId?: string,
    skipLoadingState = false,
  ) => {
    const setLoading =
      provider === "google" ? setIsLoadingGoogle : setIsLoadingGithub;

    if (!skipLoadingState) {
      setLoading(true);
    }

    try {
      const payload: LoginRequest = {
        code,
        provider,
        redirectUri,
        codeVerifier,
        clientId,
      };

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as LoginResponse & { error?: string };

      if (!response.ok) throw new Error(data.error || "Authentication failed");

      await signIn(data.token, data.user);
      onSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to sign in. Please try again.");
    } finally {
      if (!skipLoadingState) {
        setLoading(false);
      }
    }
  };

  const handleNativeGooglePrompt = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      Alert.alert("Error", "Google Sign-In is not configured for this build.");
      return;
    }

    setIsLoadingGoogle(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return;
      }

      const code = response.data.serverAuthCode;

      if (!code) {
        throw new Error("Google Sign-In did not return a server auth code.");
      }

      await handleAuthWithBackend(code, "google", undefined, undefined, undefined, true);
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        Alert.alert("Error", "Google Play Services are unavailable on this device.");
        return;
      }

      if (
        isErrorWithCode(error) &&
        (error.code === statusCodes.SIGN_IN_CANCELLED ||
          error.code === statusCodes.IN_PROGRESS)
      ) {
        return;
      }

      console.error(error);
      Alert.alert("Error", "Unable to sign in with Google. Please try again.");
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  useEffect(() => {
    if (!USE_NATIVE_GOOGLE_SIGN_IN && responseGoogle?.type === "success") {
      const { code } = responseGoogle.params;
      handleAuthWithBackend(
        code,
        "google",
        GOOGLE_REDIRECT_URI,
        requestGoogle?.codeVerifier,
        GOOGLE_CLIENT_ID,
      );
    }
  }, [responseGoogle, requestGoogle]);

  useEffect(() => {
    if (responseGithub?.type === "success") {
      const { code } = responseGithub.params;
      const verifier = requestGithub?.codeVerifier;
      handleAuthWithBackend(code, "github", GITHUB_REDIRECT, verifier);
    }
  }, [responseGithub]);

  return {
    google: {
      request: USE_NATIVE_GOOGLE_SIGN_IN ? Boolean(GOOGLE_WEB_CLIENT_ID) : requestGoogle,
      isLoading: isLoadingGoogle,
      prompt: USE_NATIVE_GOOGLE_SIGN_IN
        ? handleNativeGooglePrompt
        : () => promptAsyncGoogle(),
    },
    github: {
      request: requestGithub,
      isLoading: isLoadingGithub,
      prompt: () => promptAsyncGithub(),
    },
    isAnyLoading: isLoadingGoogle || isLoadingGithub,
  };
}
