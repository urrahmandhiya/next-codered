import CookieProvider from "@/components/room/cookie-provider";
import RoomManager from "@/components/room/room-manager";
import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user_id")?.value || null;

    return (
        <CookieProvider cookieValue={userCookie}>
            <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
                <RoomManager />
            </div>
        </CookieProvider>
    );
}