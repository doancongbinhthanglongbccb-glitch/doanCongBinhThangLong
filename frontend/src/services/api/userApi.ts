import type { CreateUserInput, UpdateUserInput, User } from "@/shared/types/user";

const USER_STORAGE_KEY = "tl293.users.v1";

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const defaultUsers: User[] = [
  {
    id: "user-admin-1",
    username: "admin293",
    displayName: "Quản trị viên",
    role: "admin",
    email: "admin@luduan293.vn",
    createdAt: "2026-01-01T00:00:00.000Z",
    active: true,
  },
];

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const loadUsers = (): User[] => {
  if (!canUseStorage()) {
    return clone(defaultUsers);
  }

  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUsers));
    return clone(defaultUsers);
  }

  try {
    return JSON.parse(raw) as User[];
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUsers));
    return clone(defaultUsers);
  }
};

const saveUsers = (users: User[]): User[] => {
  const next = clone(users);
  if (canUseStorage()) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
};

export const getUsers = async (): Promise<User[]> => {
  await wait();
  return clone(loadUsers());
};

export const getUserById = async (id: string): Promise<User | null> => {
  const users = await getUsers();
  return users.find((item) => item.id === id) ?? null;
};

export const createUser = async (payload: CreateUserInput): Promise<User> => {
  await wait();
  const users = loadUsers();
  const nextUser: User = {
    ...payload,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  saveUsers([nextUser, ...users]);
  return clone(nextUser);
};

export const updateUser = async (id: string, payload: UpdateUserInput): Promise<User | null> => {
  await wait();
  const users = loadUsers();
  let updated: User | null = null;

  const nextUsers = users.map((item) => {
    if (item.id !== id) {
      return item;
    }
    updated = {
      ...item,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  saveUsers(nextUsers);
  return updated ? clone(updated) : null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  await wait();
  const users = loadUsers();
  const nextUsers = users.filter((item) => item.id !== id);
  saveUsers(nextUsers);
  return nextUsers.length !== users.length;
};
