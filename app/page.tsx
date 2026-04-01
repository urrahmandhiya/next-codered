import RoomEntry from "@/components/home/room-entry";
export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
        <div className="flex items-center flex-col gap-2">
          <h1 className="scroll-m-20 border-b pb-2 text-4xl font-extrabold tracking-tight text-balance">
            CODE <span className="text-red-600">RED</span>
          </h1>
          <h2 className="text-gray-600 scroll-m-20 text-center text-xs font-semibold text-balance">
            CYBER SECURITY THEMED DEDUCTION
          </h2>
        </div>
        <RoomEntry />
      </main>
    </div>
  );
}
