export interface RegisterDto {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface VerifyResetCodeDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  new_password: string;
}

export interface UpdateUserDto {
  name?: string;
  display_name?: string;
  email?: string;
  metadata?: {
    username?: string;
    location?: string;
    website?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UserMetadata {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  username?: string;
  location?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  total_listens: number;
  total_likes: number;
  total_uploads: number;
  last_device?: string;
  last_ip?: string;
  last_location?: string;
  extra?: Record<string, any>;
}

export interface Role {
  id: number;
  name: string;
  is_active: boolean;
}

export interface User {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  display_name?: string;
  email: string;
  is_active: boolean;
  last_login?: string;
  roles?: Role[];
  role: string;
  metadata: UserMetadata;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  refresh_token?: string;
  metadata?: any;
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  id?: number;
  status?: string;
  url?: string;
  message?: string;
  metadata?: {
    original_name: string;
    file_type: string;
    file_size: number;
    upload_time: string;
  };
}

// ============================
// Generic starter-kit additions (starter kit)
// ============================

export interface TokensResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface MobileAuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: TokensResponse;
  };
  message: string;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  per_page: number;
  to: number;
  /** @deprecated Use total_items */
  total: number;
  /** @deprecated Use total_pages */
  last_page: number;
  total_items: number;
  total_pages: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T, S = any> {
  status?: string;
  success?: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
  links?: PaginationLinks;
  summary?: S;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
