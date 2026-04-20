// Helpers para envelope padrão de resposta de API.
import type { ApiResponse } from "@/types/api";

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null, meta: { request_id: crypto.randomUUID() } };
}

export function fail<T>(code: string, message: string): ApiResponse<T> {
  return { success: false, data: null, error: { code, message }, meta: { request_id: crypto.randomUUID() } };
}

export function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
