"use client";

import { useRouter } from "next/navigation";
import { loginAsGuest, loginWithGoogle, logout } from "@/app/lib/auth";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();

  const handleGuest = async () => {
    try {
      await loginAsGuest();
      router.push("/ask");
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      router.push("/ask");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logomark */}
        <Link href="/" className="hover:opacity-80 transition-opacity active:scale-[0.98]">
          <Image 
            src="/now.png" 
            className="dark:invert object-contain" 
            width={72} 
            height={20} 
            alt="noW app"
            priority
          />
        </Link>

        {/* Action Controls */}
        <div className="flex gap-4 items-center text-sm font-medium">
          <button 
            onClick={handleGuest}
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Guest
          </button>
          
          <button 
            onClick={handleGoogle}
            className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            Login
          </button>
          
          <button 
            onClick={handleLogout}
            className="bg-black dark:bg-zinc-50 text-white dark:text-black py-1.5 px-3.5 rounded-lg text-xs tracking-wide font-semibold shadow-sm hover:opacity-90 active:scale-[0.97] transition-all"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}