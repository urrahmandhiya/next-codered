"use client"

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useEffect, useState } from "react";

const players = [
    { name: "John Smith" },
    { name: "Jane Doe" },
    { name: "Chupacabra Smitch" },
]

export default function Page() {
    // find better way to open modal on page load
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOpen(true)
    },[]);

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Username</DialogTitle>
                            <DialogDescription>
                                Input your username
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="username" className="sr-only">
                                    Username
                                </Label>
                                <Input
                                    className="text-xs"
                                    placeholder="Enter Username"
                                    id="username"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose render={<Button>Submit</Button>}></DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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