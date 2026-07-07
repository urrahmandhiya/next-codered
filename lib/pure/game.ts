import { DynamicFields, GameRoomMetaData, RedisGameRoom } from "../definitions";

export function phaseTransition(data: Omit<GameRoomMetaData, 'lastDeadPlayerId' | 'voterByCandidate'>) {
    const ROUND_0_PHASE = {
        starting: "night",
        night: "day",
        day: "hangVote",
        hangVote: "hangVoteCount",
        hangVoteCount: "hangVoteResult",
        hangVoteResult: "night",
    }
    const ROUND_1_PHASE = {
        night: "killVote",
        killVote: "killVoteCount",
        killVoteCount: "killVoteResult",
        killVoteResult: "day",
        day: "hangVote",
        hangVote: "hangVoteCount",
        hangVoteCount: "hangVoteResult",
        hangVoteResult: "night",
    }
    const phaseState: DynamicFields = data.round > 0 ? ROUND_1_PHASE : ROUND_0_PHASE;
    const nextPhase = String(phaseState[data.phase]);

    const nextPhaseWords = nextPhase.split(/(?=[A-Z])/);
    const phaseType = nextPhaseWords[nextPhaseWords.length - 1];

    let phaseEndAtDuration: number;

    switch (phaseType) {
        case "Vote":
            phaseEndAtDuration = Number(data.voteDuration);
            break;
        case "Count":
            phaseEndAtDuration = 8;
            break;
        case "Result":
            phaseEndAtDuration = 8;
            break;
        default:
            phaseEndAtDuration = Number(data.discussDuration);
            break;
    }
    console.log("[Current Phase] ", nextPhase);
    console.log("[Duration] ", phaseEndAtDuration);
    return { nextPhase, phaseEndAtDuration };
}

export function tallyingVotes(voterData: Record<string, string>, votedIds: string[]) {
    let votedPlayerIds: string[] = [];
    const voterByCandidate: Record<string, string[]> = {};

    const cleanVotedIds = votedIds.filter((id) => (id !== "null") && (id !== null) && (id));
    console.log("[VoterData]", voterData)

    const cleanVoterData = Object.entries(voterData).filter(([key, val]) =>
        (key && val) &&
        (key !== null && val !== null) &&
        (key !== "null" && val !== "null")
    );
    console.log("[cleanVoterData]", cleanVoterData)

    let maxCount = 0;
    const occ: Record<string, number> = {};

    for (const id of cleanVotedIds) {
        occ[id] = (occ[id] || 0) + 1;
    }

    for (const key in occ) {
        if (occ[key] > maxCount) {
            maxCount = occ[key];
            votedPlayerIds = [key];
        } else if (occ[key] === maxCount) {
            votedPlayerIds.push(key);
        }
    }
    console.log("[Voted Ids]", votedPlayerIds)

    cleanVoterData.forEach(([key, val]) => {
        if (voterByCandidate[val]) {
            voterByCandidate[val].push(key);
        } else {
            voterByCandidate[val] = [key];
        }
    })

    return { votedPlayerIds, voterByCandidate }
}

export function winningCondition(data: Omit<GameRoomMetaData, 'lastDeadPlayerId' | 'voterByCandidate'>, nextPhase: string) {
    const isGoodWon = Number(data.badSide) === 0;
    const isBadWon = Number(data.goodSide) === 0;
    const isGameEnd = (isBadWon || isGoodWon) && (nextPhase === "night" || nextPhase === "day");

    console.log("[Game End]", isGameEnd)
    console.log("[Good Side]", data.goodSide, isGoodWon)
    console.log("[Bad Side]", data.badSide, isBadWon)

    if (isGameEnd) {
        if (isGoodWon) return "goodEnd";
        if (isBadWon) return "badEnd";
    }
    return "inProgress"
}

export function mapVoterByCandidatesToNames(gameData: RedisGameRoom) {
    const parsedVoterByCandidate = JSON.parse(gameData.voterByCandidate) as Record<string, string[]>;
    const entriesVoterByCandidate = Object.entries(parsedVoterByCandidate);

    const validVoterByCandidate: Record<string, string[]> = entriesVoterByCandidate.length
        ? Object.fromEntries(
            entriesVoterByCandidate.map(([voted, voters]) => [
                voted === "none" ? "none" : gameData[`p:${voted}:name`],
                voters.map((voter) => String(gameData[voter.replace(':vote', ':name')]))
            ])
        )
        : {};

    console.log("[voterByCandidate]", validVoterByCandidate)
    return validVoterByCandidate;
}