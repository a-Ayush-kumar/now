"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(screen-64px)] flex flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black px-6 transition-colors duration-200">
      <main className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-16 px-12 shadow-sm flex flex-col items-center text-center transition-all">
        
        {/* Brand Logomark Surface */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl mb-8">
          <Image
            className="dark:invert object-contain"
            src="/now.png"
            alt="noW. Logo"
            width={80}
            height={24}
            priority
          />
        </div>

        {/* Core Identity Block */}
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Welcome to noW.
          </h1>

          <p className="max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            An intelligent RAG agent engineered to transcribe, parse, and analyze short-form content across multiple video platforms simultaneously.
          </p>

          <Link
            href="/ask"
            className="mt-6 px-6 py-3 rounded-xl bg-black dark:bg-zinc-50 text-white dark:text-black font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            Launch Context Workspace
          </Link>
        </div>

      </main>
    </div>
  );
}