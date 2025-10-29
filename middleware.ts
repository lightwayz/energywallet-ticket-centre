// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const adminPaths = ["/dashboard", "/admin"];
    const path = req.nextUrl.pathname;

    const isAdminRoute = adminPaths.some((p) => path.startsWith(p));
    const userRole = req.cookies.get("userRole")?.value;

    if (isAdminRoute && userRole !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}
