// app/api/users/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { api } from "../../api";
import { isAxiosError, logErrorResponse } from "@/lib/utils/errorHandling";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await api.get("/users/me");

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { error: "Failed to get user data" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to get user data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await api.patch("/users/me", body);

    return NextResponse.json(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      logErrorResponse(error);
      return NextResponse.json(
        error.response?.data || { error: "Failed to update user data" },
        { status: error.response?.status || 500 }
      );
    }

    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}
