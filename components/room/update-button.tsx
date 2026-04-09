import { RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

export default function UpdateButton({onUpdate}: {onUpdate: () => void}) {
    return(
        <Button variant="outline" onClick={onUpdate}><RefreshCw /></Button>
    );
}