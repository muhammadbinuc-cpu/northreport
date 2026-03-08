'use client';

import {
  CityScrollScene,
  PhoneReveal,
  HowItWorks,
  FinalCTA,
} from '@/northreport/components/landing';
import '@/northreport/components/landing/animations.css';

export default function LandingPage() {
  return (
    <main>
      {/* Sections 1+2 — Cinematic city scroll story */}
      <CityScrollScene />

      {/* Section 3 — Phone Reveal: sticky phone, scroll-driven crossfade */}
      <PhoneReveal />

      {/* Section 4 — How It Works: step stagger, animated numbers, connecting line */}
      <HowItWorks />

      {/* Section 5 — CTA: scale-up headline, delayed button */}
      <FinalCTA />
    </main>
  );
}
