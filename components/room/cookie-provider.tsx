"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const CookieContext = createContext<string | null >(null)

export default function CookieProvider({ cookieValue, children }: {cookieValue: string | null, children: ReactNode}) {
    const [value, setValue] = useState<string | null>(cookieValue);

    useEffect(() => {
        if (!value) {
            const getCookie = (name: string) => {
                const parts = `; ${document.cookie}`.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
                return null;
            };
            const val = getCookie("user_id");
            if (val) {
                setValue(val);
            }
        }
    }, [value]);

    return (
        <CookieContext.Provider value={value}>
            {children}
        </CookieContext.Provider>
    );
}

export function useUserCookies() {
    return useContext(CookieContext);
}