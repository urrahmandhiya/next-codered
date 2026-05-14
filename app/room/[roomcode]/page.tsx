import CookieProvider from "@/components/room/cookie-provider";
import RoomManager from "@/components/room/room-manager";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user_id")?.value || null;

    return (
        <CookieProvider cookieValue={userCookie}>
            <div className="flex flex-col h-[100dvh] w-full items-center justify-center bg-cyber-room font-sans overflow-hidden">
                <RoomManager />
            </div>
        </CookieProvider>
    );
}