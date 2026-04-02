import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

const players = [
    { name: "John Smith" },
    { name: "Jane Doe" },
    { name: "Chupacabra Smitch" },
]

export default function Page() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
                <Tabs defaultValue="overview" className="min-w-64">
                    <TabsList>
                        <TabsTrigger value="overview">Players</TabsTrigger>
                        <TabsTrigger value="room-settings">Room Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                        <Card>
                            <CardContent className="text-sm text-muted-foreground">
                                <ItemGroup>
                                    {players.map((player) => (
                                        <Item key={player.name} variant="outline">
                                            <ItemContent>
                                                <ItemTitle>{player.name}</ItemTitle>
                                            </ItemContent>
                                        </Item>
                                    ))}
                                </ItemGroup>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="room-settings">
                        <Card>
                            <CardContent className="text-sm text-muted-foreground">
                                not yet.
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                    <Button variant="outline">Start Game</Button>
                </div>
            </main>
        </div>
    );
}