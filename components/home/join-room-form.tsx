import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export default function JoinRoomForm({ onBack }: { onBack: () => void }) {
    return (
        <>
            <Card>
                <CardContent className="text-xs text-center">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        alert("not yet");
                    }}>
                        <Field>
                            <FieldLabel htmlFor="room-input">
                                Room Code
                            </FieldLabel>
                            <Input
                                className="text-xs"
                                id="room-input"
                                type="text"
                                placeholder="Enter Room Code"
                            />
                            <Button variant="outline" type="submit">Submit</Button>
                        </Field>
                    </form>
                </CardContent>
            </Card>
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
                <Button variant="outline" onClick={onBack}>Back</Button>
            </div>
        </>
    );
}