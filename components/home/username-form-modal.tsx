import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function UsernameFormModal({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) {
    return (
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
    );
}