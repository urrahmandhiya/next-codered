import { InGamePlayer } from "@/lib/definitions";
import { Card, CardContent } from "../ui/card";
import { Field, FieldContent, FieldLabel, FieldTitle } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import clsx from "clsx";
import { useEffect } from "react";

export default function VotePlayerList({
    players,
    voteType,
    onVote,
    voteValue }:
    {
        players: InGamePlayer[],
        voteType: string,
        onVote: (voteValue: string) => void,
        voteValue: string
    }) {

    useEffect(() => {
        onVote("none")
    }, [onVote])

    return (
        <Card>
            <CardContent>
                <div className="flex flex-wrap gap-4 md:gap-6 justify-center w-full">
                    <RadioGroup className="max-w-sm" value={voteValue} onValueChange={onVote}>
                        {(voteType === "hangVote") && players?.map((player) => {
                            return (
                                <FieldLabel htmlFor={player.id} key={player.id}>
                                    <Field orientation="horizontal">
                                        <FieldContent>
                                            <FieldTitle className={clsx({
                                                'text-red-500': player.side === 'bad',
                                            })}>
                                                {player.name}
                                                {player.status === "dead" && <span>DEAD</span>}
                                                {player.role !== "unknown" && player.role}
                                            </FieldTitle>
                                        </FieldContent>
                                        <RadioGroupItem value={player.id} id={player.id} disabled={player.status === "dead"} />
                                    </Field>
                                </FieldLabel>
                            )
                        })}
                        {(voteType === "killVote") && players?.filter((player) => player.side !== "bad")
                            .map((player) => {
                                return (
                                    <FieldLabel htmlFor={player.id} key={player.id}>
                                        <Field orientation="horizontal">
                                            <FieldContent>
                                                <FieldTitle>
                                                    {player.name}
                                                    {player.status === "dead" && <span>DEAD</span>}
                                                    {player.role !== "unknown" && player.role}
                                                </FieldTitle>
                                            </FieldContent>
                                            <RadioGroupItem value={player.id} id={player.id} disabled={player.status === "dead"} />
                                        </Field>
                                    </FieldLabel>
                                )
                            })}
                        <FieldLabel htmlFor={"none"} >
                            <Field orientation="horizontal">
                                <FieldContent>
                                    <FieldTitle>
                                        Not Voting
                                    </FieldTitle>
                                </FieldContent>
                                <RadioGroupItem value={"none"} id={"none"} />
                            </Field>
                        </FieldLabel>
                    </RadioGroup>
                </div>
            </CardContent>
        </Card>
    );
}