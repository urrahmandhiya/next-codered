import { getPlayerCookies } from "@/lib/actions";
import { Card, CardContent } from "../ui/card";
import { useEffect, useState } from "react";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { Player } from "@/lib/definitions";


export default function GameRoom({players}: {players: Player[]}) {
    const [userId, setUserId] = useState<RequestCookie | undefined | null>(null);
    
    useEffect(() => {
        const loadCookies = async () => {
            try {
                const userId = await getPlayerCookies();
                setUserId(userId);
            } catch (error) {
                console.log(error)
            }
        }
        loadCookies()
    }, [])
    const player = players.filter(player => player.id == String(userId?.value))[0];
    return (
        <Card>
            <CardContent>
                <p>You are: {player && player.name}</p>
                <p>This is the game room</p>
            </CardContent>
        </Card>
    );
}