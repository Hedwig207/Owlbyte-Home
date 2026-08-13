// 后端 DTO 的 TypeScript 类型（与后端 API 契约对齐）
// 后端无论 TS (Cloudflare Functions) 还是 Java (Spring Boot)，前端调用接口不变

// ============ 认证 ============
export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

// ============ 订阅 ============
export type SubscriberStatus = 'active' | 'unsubscribed';

export interface Subscriber {
  email: string;
  status: SubscriberStatus;
  subscribedAt: string;
}

// ============ 开发日志 ============
export interface LogOverride {
  titleOverride: string | null;
  bodySupplement: string | null;
  hidden: boolean;
  updatedAt: string;
}

export interface DevLog {
  sha: string;
  shortSha: string;
  title: string;
  body: string | null;
  authorName: string;
  authorLogin: string | null;
  committedAt: string;
  override?: LogOverride | null;
}

export interface DevLogListResponse {
  items: DevLog[];
  page: number;
  total: number;
}

// ============ 访客 ============
export interface VisitorOnline {
  sessionId: string;
  country: string | null;
  uaSummary: string | null;
  path: string | null;
  lastPingAt: string;
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl'> | null;
}

export interface VisitorStats {
  today: number;
  onlineNow: number;
  total: number;
  last7Days: Array<{ date: string; count: number }>;
}

// ============ API 错误 ============
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
