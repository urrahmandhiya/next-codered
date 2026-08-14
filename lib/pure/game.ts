import { DynamicFields } from "@/lib/definitions";
import { shuffleArray } from "@/lib/utils";

interface phaseTransition {
    round: number;
    phase: string;
    voteDuration: number | string;
    discussDuration: number | string;
}

export function phaseTransition(data: phaseTransition) {
    const ROUND_0_PHASE = {
        starting: "downtime",
        downtime: "uptime",
        uptime: "hangVote",
        hangVote: "hangVoteCount",
        hangVoteCount: "hangVoteResult",
        hangVoteResult: "downtime",
    }
    const ROUND_1_PHASE = {
        downtime: "killVote",
        killVote: "killVoteCount",
        killVoteCount: "killVoteResult",
        killVoteResult: "uptime",
        uptime: "hangVote",
        hangVote: "hangVoteCount",
        hangVoteCount: "hangVoteResult",
        hangVoteResult: "downtime",
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
    const isGameEnd = (isBadWon || isGoodWon) && (nextPhase === "downtime" || nextPhase === "uptime");

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

export function inactivityCheck(
    votedPlayerIds: string[],
    voterByCandidate: Record<string, string[]>,
    nextPhase: string,
    inactivityData: Record<string, number>,
    isInactivityHanging: boolean,
) {
    const threshold = 3;
    const isNotHanging = votedPlayerIds[0] === "none";
    const isTiedWithNotVoting = Object.keys(voterByCandidate).includes("none") && votedPlayerIds.length > 1;
    const isHangVoting = nextPhase === "hangVoteCount";
    const isInactivityExist = Object.keys(inactivityData).length;

    if ((isNotHanging || isTiedWithNotVoting) && isHangVoting && isInactivityExist) {
        let inactivities = Object.entries(inactivityData)
            .filter((entry) => Number(entry[1]) >= threshold)
            .map((entry) => entry[0].split(":")[1]);
        inactivities = inactivities.length > 1 ? shuffleArray(inactivities) : inactivities;
        if (inactivities.length) {
            votedPlayerIds = inactivities;
            isInactivityHanging = true;
        }
    }
    return { votedPlayerIds, isInactivityHanging };
}
