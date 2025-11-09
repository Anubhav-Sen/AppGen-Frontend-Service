import { describe, it, expect, beforeEach } from "@jest/globals";
import { useConfigStore } from "@/stores/configStore";
import { DBProvider } from "@/types/fastapiSpec";

describe("configStore", () => {
  beforeEach(() => {
    useConfigStore.getState().resetToDefaults();
  });

  it("should have default values", () => {
    const store = useConfigStore.getState();

    expect(store.project.title).toBe("My FastAPI Project");
    expect(store.git.branch).toBe("main");
    expect(store.database.db_provider).toBe(DBProvider.POSTGRESQL);
    expect(store.security.algorithm).toBe("HS256");
    expect(store.token.access_token_expire_minutes).toBe(30);
  });

  it("should update project config", () => {
    const store = useConfigStore.getState();

    store.setProject({ title: "New Project", author: "John Doe" });

    const updated = useConfigStore.getState();
    expect(updated.project.title).toBe("New Project");
    expect(updated.project.author).toBe("John Doe");
  });

  it("should update git config", () => {
    const store = useConfigStore.getState();

    store.setGit({ username: "testuser", repository: "test-repo" });

    const updated = useConfigStore.getState();
    expect(updated.git.username).toBe("testuser");
    expect(updated.git.repository).toBe("test-repo");
  });

  it("should update database config", () => {
    const store = useConfigStore.getState();

    store.setDatabase({
      db_provider: DBProvider.SQLITE,
      db_name: "test.db",
    });

    const updated = useConfigStore.getState();
    expect(updated.database.db_provider).toBe(DBProvider.SQLITE);
    expect(updated.database.db_name).toBe("test.db");
  });

  it("should update security config", () => {
    const store = useConfigStore.getState();

    store.setSecurity({
      secret_key: "my-secret-key-with-at-least-32-chars",
      algorithm: "RS256",
    });

    const updated = useConfigStore.getState();
    expect(updated.security.secret_key).toBe("my-secret-key-with-at-least-32-chars");
    expect(updated.security.algorithm).toBe("RS256");
  });

  it("should update token config", () => {
    const store = useConfigStore.getState();

    store.setToken({
      access_token_expire_minutes: 60,
      refresh_token_expire_days: 14,
    });

    const updated = useConfigStore.getState();
    expect(updated.token.access_token_expire_minutes).toBe(60);
    expect(updated.token.refresh_token_expire_days).toBe(14);
  });

  it("should reset to defaults", () => {
    const store = useConfigStore.getState();

    store.setProject({ title: "Changed" });
    store.setDatabase({ db_name: "changed" });

    store.resetToDefaults();

    const updated = useConfigStore.getState();
    expect(updated.project.title).toBe("My FastAPI Project");
    expect(updated.database.db_name).toBe("myapp");
  });
});
