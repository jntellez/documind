import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

export const tokenStorage = {
  async save(token: string) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error guardando token", error);
    }
  },

  async get() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      return null;
    }
  },

  async remove() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error("Error borrando token", error);
    }
  },
};
