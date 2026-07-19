import { DynamicFields } from "@/lib/definitions";

interface phaseTransition {
    round: number;
    phase: string;
    voteDuration: number | string;
    discussDuration: number | string;
}

export function phaseTransition(data: phaseTransition) {
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
    return { nextPhase, phaseEndAtDuration };
}

export function tallyVotes(voterData: Record<string, string>, votedIds: string[]) {
    let maxCount = 0;

    const occ: Record<string, number> = {};
    for (const id of votedIds) {
        occ[id] = (occ[id] || 0) + 1;
    }

    let votedPlayerIds: string[] = [];
    for (const [key, val] of Object.entries(occ)) {
        if (val > maxCount) {
            maxCount = val;
            votedPlayerIds = [key]
        } else if (maxCount === val) {
            votedPlayerIds.push(key)
        }
    }

    const voterByCandidate: Record<string, string[]> = {};
    for (const [voter, candidate] of Object.entries(voterData)) {
        if (voterByCandidate[candidate]) {
            voterByCandidate[candidate].push(voter);
        } else {
            voterByCandidate[candidate] = [voter];
        }
    }

    return { votedPlayerIds, voterByCandidate }
}

interface winningCondition {
    goodSide: number;
    badSide: number;
}

export function winningCondition(data: winningCondition, nextPhase: string) {
    const isGoodWon = data.badSide === 0 && data.goodSide > 0;
    const isBadWon = data.goodSide === 0 && data.badSide > 0;
    const isGameEnd = (isBadWon || isGoodWon) && (nextPhase === "night" || nextPhase === "day");

    if (isGameEnd) {
        if (isGoodWon) return "goodEnd";
        if (isBadWon) return "badEnd";
    }
    return "inProgress"
}

interface mapVoterByCandidatesToNames extends DynamicFields {
    voterByCandidateJson: string;
}

export function mapVoterByCandidatesToNames(gameData: mapVoterByCandidatesToNames) {
    const parsedVoterByCandidate: Record<string, string[]> = JSON.parse(gameData.voterByCandidateJson);
    const entriesVoterByCandidate = Object.entries(parsedVoterByCandidate);

    const validVoterByCandidate: Record<string, string[]> = entriesVoterByCandidate.length
        ? Object.fromEntries(
            entriesVoterByCandidate.map(([candidate, voters]) => [
                candidate === "none" ? "none" : gameData[`p:${candidate}:name`],
                voters.map((voter) => String(gameData[voter.replace(':vote', ':name')]))
            ])
        )
        : {};

    return validVoterByCandidate;
}