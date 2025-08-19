// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // Тимчасово відключаємо всю логіку
  return NextResponse.next();
}

export const config = {
  matcher: [], // Пустий matcher - відключає middleware
};
