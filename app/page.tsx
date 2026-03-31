import LinkButton from "@/components/home/link-button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const HOME_DESCRIPTION = `
  Removing physical boundaries. 
  By using your smartphone as the primary terminal, 
  gameplay is flexible and modern.
  The system acts as an automated Game Master, 
  allowing everyone to play without needing a dedicated judge.
`

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <Card>
          <CardContent className="text-xs text-center">{HOME_DESCRIPTION}</CardContent>
        </Card>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <LinkButton href="/" title="New Game" />
          <LinkButton href="/" title="Join Game" />
        </div>
      </main>
    </div>
  );
}
