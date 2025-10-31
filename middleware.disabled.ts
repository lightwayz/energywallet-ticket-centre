// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
//
// export function middlewareDisabled(req: NextRequest) {
//     const path = req.nextUrl.pathname;
//     const isProtected =
//         path.startsWith("/admin") || path.startsWith("/dashboard");
//     const userRole = req.cookies.get("userRole")?.value;
//
//     if (isProtected && userRole !== "admin") {
//         return NextResponse.redirect(new URL("/admin/login", req.url));
//     }
//
//     return NextResponse.next();
// }
