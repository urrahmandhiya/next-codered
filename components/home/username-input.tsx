import { Dices } from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const randomNames = [
    "badger-pentester",
    "hawk-phisher",
    "snake-cracker",
    "wolf-phreaker",
    "rhino-sysadmin",
    "owl-cryptanalyst",
    "fox-hacktivist",
    "bear-netrunner",
    "raven-cipher",
    "shark-skiddie",
    "spider-botmaster",
    "mantis-reverser",
    "rat-carder",
    "viper-defacer",
    "jackal-scraper",
    "leopard-sniffer",
    "cobra-spoofer",
    "panther-dumper",
    "lynx-exploiter",
    "crow-hunter"
];

const shuffledRandomNames = randomNames
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => {
        const randomNumber = Math.floor(Math.random() * 90) + 10;
        return value + randomNumber;
    });


export default function UsernameInput() {
    const [count, setCount] = useState(0)
    const [username, setUsername] = useState(shuffledRandomNames[0])

    const handleShuffleName = () => {
        if (count < randomNames.length - 1) {
            setCount(count + 1);
        } else {
            setCount(0);
        }
        setUsername(shuffledRandomNames[count])
    }
    return (
        <div className="flex w-full justify-between gap-3">
            <Label htmlFor="username" className="sr-only">
                Username
            </Label>
            <Input
                className="h-11 bg-black/50 border-[#1e293b] text-white focus-visible:ring-[#4b6b9e] font-mono text-sm tracking-wide"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                spellCheck="false"
            />
            <Button 
                variant="outline" 
                type="button"
                className="h-11 w-11 shrink-0 bg-[#111827] border-[#1e293b] text-[#4b6b9e] hover:bg-[#1e293b] hover:text-white transition-colors"
                onClick={handleShuffleName}
                title="Shuffle Identity"
            >
                <Dices className="w-5 h-5" />
            </Button>
        </div>
    );
}