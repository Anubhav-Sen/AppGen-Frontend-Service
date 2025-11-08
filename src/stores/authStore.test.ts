import { renderHook, act } from "@testing-library/react";
import { useAuthStore } from "./authStore";
import type { User } from "../types/user";

describe("authStore", () => {
    beforeEach(() => {
        // Reset store state before each test
        const { result } = renderHook(() => useAuthStore());
        act(() => {
            result.current.setUser(null);
        });
    });

    it("should have initial state with null user", () => {
        const { result } = renderHook(() => useAuthStore());

        expect(result.current.user).toBeNull();
    });

    it("should set user data", () => {
        const { result } = renderHook(() => useAuthStore());

        const mockUser: User = {
            id: 1,
            username: "testuser",
            email: "test@example.com",
        };

        act(() => {
            result.current.setUser(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);
    });

    it("should clear user data by setting to null", () => {
        const { result } = renderHook(() => useAuthStore());

        const mockUser: User = {
            id: 1,
            username: "testuser",
            email: "test@example.com",
        };

        act(() => {
            result.current.setUser(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);

        act(() => {
            result.current.setUser(null);
        });

        expect(result.current.user).toBeNull();
    });

    it("should update user data", () => {
        const { result } = renderHook(() => useAuthStore());

        const user1: User = {
            id: 1,
            username: "user1",
            email: "user1@example.com",
        };

        const user2: User = {
            id: 2,
            username: "user2",
            email: "user2@example.com",
        };

        act(() => {
            result.current.setUser(user1);
        });

        expect(result.current.user).toEqual(user1);

        act(() => {
            result.current.setUser(user2);
        });

        expect(result.current.user).toEqual(user2);
    });

    it("should persist user state across multiple hook instances", () => {
        const { result: result1 } = renderHook(() => useAuthStore());
        const { result: result2 } = renderHook(() => useAuthStore());

        const mockUser: User = {
            id: 1,
            username: "testuser",
            email: "test@example.com",
        };

        act(() => {
            result1.current.setUser(mockUser);
        });

        // Both instances should see the same state
        expect(result1.current.user).toEqual(mockUser);
        expect(result2.current.user).toEqual(mockUser);
    });

    it("should have setUser function available", () => {
        const { result } = renderHook(() => useAuthStore());

        expect(result.current.setUser).toBeDefined();
        expect(typeof result.current.setUser).toBe("function");
    });
});
