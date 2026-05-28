"use client";

import { useEffect, useState } from "react";

export default function PermissionGate({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  if (!user) return null;

  const userPermissions = user.permissions || [];

  if (!userPermissions.includes(permission)) return null;

  return <>{children}</>;
}
