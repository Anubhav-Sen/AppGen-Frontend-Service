import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ProjectConfig,
  type GitConfig,
  type DatabaseConfig,
  type SecurityConfig,
  type TokenConfig,
  DBProvider,
} from "@/types/fastapiSpec";

interface ConfigState {
  project: ProjectConfig;
  git: GitConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  token: TokenConfig;

  setProject: (config: Partial<ProjectConfig>) => void;
  setGit: (config: Partial<GitConfig>) => void;
  setDatabase: (config: Partial<DatabaseConfig>) => void;
  setSecurity: (config: Partial<SecurityConfig>) => void;
  setToken: (config: Partial<TokenConfig>) => void;

  resetToDefaults: () => void;
}

const defaultProject: ProjectConfig = {
  title: "My FastAPI Project",
  author: "",
  description: "",
};

const defaultGit: GitConfig = {
  username: "",
  repository: "",
  branch: "main",
};

const defaultDatabase: DatabaseConfig = {
  db_provider: DBProvider.POSTGRESQL,
  db_name: "myapp",
  db_host: "localhost",
  db_port: 5432,
  db_username: "",
  db_password: "",
};

const defaultSecurity: SecurityConfig = {
  secret_key: "",
  algorithm: "HS256",
};

const defaultToken: TokenConfig = {
  access_token_expire_minutes: 30,
  refresh_token_expire_days: 7,
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      project: defaultProject,
      git: defaultGit,
      database: defaultDatabase,
      security: defaultSecurity,
      token: defaultToken,

  setProject: (config) => {
    set((state) => ({
      project: { ...state.project, ...config },
    }));
  },

  setGit: (config) => {
    set((state) => ({
      git: { ...state.git, ...config },
    }));
  },

  setDatabase: (config) => {
    set((state) => ({
      database: { ...state.database, ...config },
    }));
  },

  setSecurity: (config) => {
    set((state) => ({
      security: { ...state.security, ...config },
    }));
  },

  setToken: (config) => {
    set((state) => ({
      token: { ...state.token, ...config },
    }));
  },

  resetToDefaults: () => {
    set({
      project: defaultProject,
      git: defaultGit,
      database: defaultDatabase,
      security: defaultSecurity,
      token: defaultToken,
    });
  },
}),
    {
      name: "config-storage",
    }
  )
);
