import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import LinkButton from "./link-button";

const HOME_DESCRIPTION = `
  Removing physical boundaries. 
  By using your smartphone as the primary terminal, 
  gameplay is flexible and modern.
  The system acts as an automated Game Master, 
  allowing everyone to play without needing a dedicated judge.
`

export default function RoomActions({ onJoinRoom }: { onJoinRoom: () => void }) {
    return (
        <>
            <Card>
                <CardContent className="text-xs text-center">
                    {HOME_DESCRIPTION}
                </CardContent>
            </Card>
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                <LinkButton href="/room" title="Create Room" />
                <Button variant="outline" onClick={onJoinRoom}>Join Room</Button>
            </div>
        </>
    );
}