"use client"

import { createContext, ReactNode, useContext } from "react";

const CookieContext = createContext<string | null >(null)

export default function CookieProvider({ cookieValue, children }: {cookieValue: string | null, children: ReactNode}) {
    return(
        <CookieContext.Provider value={cookieValue}>
            {children}
        </CookieContext.Provider>
    )
}

export function useUserCookies() {
    return useContext(CookieContext);
}