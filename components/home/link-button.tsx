"use client"

import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export default function LinkButton({title, href}: {title: string, href: string}) {
    return(
        <Link href={href} className={cn(buttonVariants({ variant: "outline" }))}>
            {title}
        </Link>
    );
}