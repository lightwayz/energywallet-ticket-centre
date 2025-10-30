// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Allow access to the public admin login page
    if (path === "/admin/login") {
        return NextResponse.next();
    }

    const adminPaths = ["/dashboard", "/admin"];
    const isAdminRoute = adminPaths.some((p) => path.startsWith(p));
    const userRole = req.cookies.get("userRole")?.value;

    if (isAdminRoute && userRole !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
}
