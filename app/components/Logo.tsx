"use client";

import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-end ml-[0.1in] select-none gap-3" title="Go to home">
      {/* Light mode logo - gradient */}
      <Image
        src="/images/windshift-wordmark-gradient.png"
        alt="WindShift"
        width={120}
        height={30}
        className="h-[1.9rem] w-auto dark:hidden"
        priority
      />
      {/* Dark mode logo - sky blue */}
      <Image
        src="/images/windshift-wordmark-sky-blue.png"
        alt="WindShift"
        width={120}
        height={30}
        className="h-[1.9rem] w-auto hidden dark:inline"
        priority
      />
      <span className="text-body font-medium text-primary-600/80 dark:text-primary-300/80 whitespace-nowrap pb-[1px]">
        Expert Networks Module
      </span>
    </Link>
  );
}


