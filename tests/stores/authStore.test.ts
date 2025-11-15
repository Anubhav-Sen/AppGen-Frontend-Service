import { useAuthStore } from "@/stores/authStore";

describe("authStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().clearAuth();
  });

  describe("rememberMe", () => {
    it("should default to false", () => {
      const state = useAuthStore.getState();
      expect(state.rememberMe).toBe(false);
    });

    it("should update rememberMe state", () => {
      useAuthStore.getState().setRememberMe(true);
      expect(useAuthStore.getState().rememberMe).toBe(true);
    });

    it("should reset rememberMe on clearAuth", () => {
      useAuthStore.getState().setRememberMe(true);
      useAuthStore.getState().clearAuth();
      expect(useAuthStore.getState().rememberMe).toBe(false);
    });
  });

  describe("authentication", () => {
    it("should set user and access token", () => {
      const user = { id: 1, email: "test@test.com", username: "testuser", isActive: true };
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAccessToken("test-token");

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.accessToken).toBe("test-token");
    });

    it("should clear all auth state on clearAuth", () => {
      const user = { id: 1, email: "test@test.com", username: "testuser", isActive: true };
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAccessToken("test-token");
      useAuthStore.getState().setRememberMe(true);

      useAuthStore.getState().clearAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.rememberMe).toBe(false);
    });
  });
});
