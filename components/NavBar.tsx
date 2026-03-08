'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

const navItems = [
  { href: '/feed', label: 'Feed', icon: '📡' },
  { href: '/map', label: 'Map', icon: '🗺️' },
  { href: '/report', label: 'Report', icon: '📋' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass-card rounded-t-2xl rounded-b-none border-b-0">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-[#6366f1]' : 'text-[#888] hover:text-[#ccc]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        {user && (
          <Link
            href="/api/auth/logout"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-[#888] hover:text-[#ccc]"
          >
            <span className="text-lg">👤</span>
            <span className="text-[10px] font-medium">Logout</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
