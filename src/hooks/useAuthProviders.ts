import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { useAuth } from "@/context/AuthContext";

const GITHUB_DISCOVERY = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint:
    "https://github.com/settings/connections/applications/TU_CLIENT_ID",
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const GOOGLE_REDIRECT_URI =
  process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI ||
  "https://auth.expo.io/@janydev/documind";
const GITHUB_REDIRECT = makeRedirectUri({ scheme: "documind" });

export function useAuthProviders(onSuccess: () => void) {
  const { signIn } = useAuth();
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  // Configuración Google - IMPORTANTE: devuelve un array
  const [requestGoogle, responseGoogle, promptAsyncGoogle] =
    Google.useAuthRequest({
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
    });

  // Configuración GitHub - IMPORTANTE: devuelve un array
  const [requestGithub, responseGithub, promptAsyncGithub] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
      scopes: ["read:user", "user:email"],
      redirectUri: GITHUB_REDIRECT,
    },
    GITHUB_DISCOVERY
  );

  // Función centralizada para autenticar con el backend
  const handleAuthWithBackend = async (
    code: string,
    provider: "google" | "github",
    redirectUri?: string,
    codeVerifier?: string
  ) => {
    const setLoading =
      provider === "google" ? setIsLoadingGoogle : setIsLoadingGithub;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          provider,
          redirectUri,
          codeVerifier,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error en autenticación");

      await signIn(data.token, data.user);
      onSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Listeners de respuestas
  useEffect(() => {
    if (responseGoogle?.type === "success") {
      const { code } = responseGoogle.params;
      handleAuthWithBackend(code, "google", GOOGLE_REDIRECT_URI);
    }
  }, [responseGoogle]);

  useEffect(() => {
    if (responseGithub?.type === "success") {
      const { code } = responseGithub.params;
      const verifier = requestGithub?.codeVerifier;
      handleAuthWithBackend(code, "github", GITHUB_REDIRECT, verifier);
    }
  }, [responseGithub]);

  return {
    google: {
      request: requestGoogle,
      isLoading: isLoadingGoogle,
      prompt: () => promptAsyncGoogle(),
    },
    github: {
      request: requestGithub,
      isLoading: isLoadingGithub,
      prompt: () => promptAsyncGithub(),
    },
    isAnyLoading: isLoadingGoogle || isLoadingGithub,
  };
}
