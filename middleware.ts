import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifyJWT(token: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const [header, payload, signature] = token.split(".");
  const data = `${header}.${payload}`;

  const signatureBytes = Uint8Array.from(
    atob(signature.replace(/-/g, "+").replace(/_/g, "/")),
    c => c.charCodeAt(0)
  );

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(data)
  );

  if (!isValid) return null;

  return JSON.parse(atob(payload));
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decoded: any = await verifyJWT(token, process.env.JWT_SECRET!);

  if (!decoded) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const permissions: string[] = decoded.permissions || [];
  const pathname = req.nextUrl.pathname;

  // ⭐ Protect product pages
  if (pathname.startsWith("/products")) {
    if (!permissions.includes("manage_products")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // ⭐ Route → Permission Mapping
  const routePermissions: Record<string, string> = {
    "/agent/create-order": "create_order",
    "/admin/create-order": "create_order",
    "/admin/orders": "view_all_orders",
    "/admin/invoices": "generate_invoice",
    "/market/orders": "view_market_orders",
    "/market/stores": "view_market_stores",
    "/superadmin/users": "manage_users",
    "/superadmin/stores": "manage_stores",
    "/superadmin/products": "manage_products",
    "/superadmin/markets": "manage_markets",
    "/superadmin/orders": "view_all_orders",
    "/superadmin/invoices": "generate_invoice",
  };

  for (const route in routePermissions) {
    if (pathname.startsWith(route)) {
      const requiredPermission = routePermissions[route];

      if (!permissions.includes(requiredPermission)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/agent/:path*",
    "/market/:path*",
    "/superadmin/:path*",
    "/products/:path*",   // ⭐ added
  ],
};
