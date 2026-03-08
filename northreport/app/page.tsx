"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import CityFlythrough from "@/components/landing/CityFlythrough";

export default function LandingPage() {
  const { user, isLoading } = useUser();

  return (
    <main>
      <CityFlythrough />
    </main>
  );
}
