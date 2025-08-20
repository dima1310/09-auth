// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "../../api";
import { isAxiosError, logErrorResponse } from "@/lib/utils/errorHandling";

interface CookieOptions {
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge?: number;
  expires?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await api.post("/auth/register", body);
    const cookieStore = await cookies();

    // Встановлюємо куки з відповіді
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      setCookieHeader.forEach((cookie: string) => {
        const [nameValue, ...attributes] = cookie.split(";");
        const [name, value] = nameValue.split("=");

        if (name && value) {
          const cookieOptions: CookieOptions = {
            value: value.trim(),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          };
          // Парсимо додаткові атрибути cookie
          attributes.forEach((attr) => {
            const [key, val] = attr.trim().split("=");
            if (key.toLowerCase() === "max-age" && val) {
              cookieOptions.maxAge = parseInt(val);
            } else if (key.toLowerCase() === "expires" && val) {
              cookieOptions.expires = new Date(val);
            } else if (key.toLowerCase() === "path" && val) {
              cookieOptions.path = val;
            }
          });
          cookieStore.set(name.trim(), cookieOptions.value, cookieOptions);
        }
      });
    }
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    logErrorResponse(error);
    if (isAxiosError(error)) {
      return NextResponse.json(
        error.response?.data || { message: "Registration failed" },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
