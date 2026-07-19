import { mapVoterByCandidatesToNames, phaseTransition, tallyVotes, winningCondition } from "@/lib/pure/game";

describe('pure func in game.ts', () => {

    describe('phaseTransition()', () => {

        const baseDuration = { voteDuration: 30, discussDuration: 60 };
        describe('round 0', () => {
            test.each([
                ['starting', 'night', 60],
                ['night', 'day', 60],
                ['day', 'hangVote', 30],
                ['hangVote', 'hangVoteCount', 8],
                ['hangVoteCount', 'hangVoteResult', 8],
                ['hangVoteResult', 'night', 60],
            ])('%s -> %s (duration %i)', (phase, expectedNextPhase, expectedDuration) => {
                const result = phaseTransition({ ...baseDuration, round: 0, phase });
                expect(result.nextPhase).toBe(expectedNextPhase);
                expect(result.phaseEndAtDuration).toBe(expectedDuration);
            });
        });

        describe('round 1', () => {
            test.each([
                ['night', 'killVote', 30],
                ['killVote', 'killVoteCount', 8],
                ['killVoteCount', 'killVoteResult', 8],
                ['killVoteResult', 'day', 60],
                ['day', 'hangVote', 30],
                ['hangVote', 'hangVoteCount', 8],
                ['hangVoteCount', 'hangVoteResult', 8],
                ['hangVoteResult', 'night', 60],
            ])('%s -> %s (duration %i)', (phase, expectedNextPhase, expectedDuration) => {
                const result = phaseTransition({ ...baseDuration, round: 1, phase });
                expect(result.nextPhase).toBe(expectedNextPhase);
                expect(result.phaseEndAtDuration).toBe(expectedDuration);
            });
        });

        // lua return strings
        it("coerce duration string to number", () => {
            const result = phaseTransition({ phase: 'day', round: 1, voteDuration: '30', discussDuration: '60' })
            expect(result.phaseEndAtDuration).toBe(30);
        })
    });

    describe('tallyingVotes()', () => {
        const voterData = {
            'p:s4vL6o0dmAn:vote': 'H0w4rDh4ml1N',
            'p:k1mB3rL1w3XleR:vote': 'H0w4rDh4ml1N',
            'p:H0w4rDh4ml1N:vote': 's4vL6o0dmAn',
            'p:l4L054laM4nCa:vote': 'H0w4rDh4ml1N',
        }
        const votedIds = ['s4vL6o0dmAn', 'H0w4rDh4ml1N', 'H0w4rDh4ml1N', 'H0w4rDh4ml1N']

        it('resolve normal votes', () => {
            const result = tallyVotes(voterData, votedIds)
            expect(result.votedPlayerIds).toEqual(['H0w4rDh4ml1N']);
            expect(result.voterByCandidate).toEqual({
                'H0w4rDh4ml1N': expect.arrayContaining([
                    'p:s4vL6o0dmAn:vote',
                    'p:k1mB3rL1w3XleR:vote',
                    'p:l4L054laM4nCa:vote'
                ]),
                's4vL6o0dmAn': ['p:H0w4rDh4ml1N:vote'],
            });
            expect(result.voterByCandidate['H0w4rDh4ml1N'].length).toBe(3)
        })

        const tiedVoterData = {
            'p:s4vL6o0dmAn:vote': 'k1mB3rL1w3XleR',
            'p:k1mB3rL1w3XleR:vote': 's4vL6o0dmAn',
            'p:H0w4rDh4ml1N:vote': 'k1mB3rL1w3XleR',
            'p:l4L054laM4nCa:vote': 's4vL6o0dmAn',
        }
        const tiedVotedIds = ['s4vL6o0dmAn', 's4vL6o0dmAn', 'k1mB3rL1w3XleR', 'k1mB3rL1w3XleR']

        it("resolve tied votes", () => {
            const result = tallyVotes(tiedVoterData, tiedVotedIds)
            expect(result.votedPlayerIds).toEqual(expect.arrayContaining(['s4vL6o0dmAn', 'k1mB3rL1w3XleR']))
            expect(result.votedPlayerIds.length).toBe(2);
            expect(result.voterByCandidate).toEqual({
                'k1mB3rL1w3XleR': expect.arrayContaining([
                    'p:s4vL6o0dmAn:vote',
                    'p:H0w4rDh4ml1N:vote'
                ]),
                's4vL6o0dmAn': expect.arrayContaining([
                    'p:k1mB3rL1w3XleR:vote',
                    'p:l4L054laM4nCa:vote',
                ]),
            });
            expect(result.voterByCandidate['s4vL6o0dmAn'].length).toBe(2);
            expect(result.voterByCandidate['k1mB3rL1w3XleR'].length).toBe(2);
        })
    })

    describe('winningCondition()', () => {
        it("good won during the day", () => {
            const result = winningCondition({ goodSide: 2, badSide: 0 }, "day");
            expect(result).toBe("goodEnd")
        });
        it("bad won during the night", () => {
            const result = winningCondition({ goodSide: 0, badSide: 1 }, "night");
            expect(result).toBe("badEnd")
        });
        it("wait for day or night before changing endGame", () => {
            const result = winningCondition({ goodSide: 0, badSide: 1 }, "killVoteCount");
            expect(result).toBe("inProgress")
        });
    });

    describe('mapVoterByCandidatesToNames()', () => {
        const completeVoteJson = '{ "H0w4rDh4ml1N": ["p:s4vL6o0dmAn:vote", "p:k1mB3rL1w3XleR:vote", "p:l4L054laM4nCa:vote"], "s4vL6o0dmAn": ["p:H0w4rDh4ml1N:vote"]}';
        const voteWithNoneJson = '{ "none": ["p:s4vL6o0dmAn:vote", "p:k1mB3rL1w3XleR:vote", "p:H0w4rDh4ml1N:vote"], "H0w4rDh4ml1N": ["p:l4L054laM4nCa:vote"]}';

        const mockGameData = {
            'p:H0w4rDh4ml1N:name': 'Howard Hamlin',
            'p:s4vL6o0dmAn:name': 'Saul Goodman',
            'p:k1mB3rL1w3XleR:name': 'Kimberly Wexler',
            'p:l4L054laM4nCa:name': 'Lalo Salamanca',
        }

        it("full vote json", () => {
            const result = mapVoterByCandidatesToNames({ voterByCandidateJson: completeVoteJson, ...mockGameData })
            expect(result).toEqual({
                'Howard Hamlin': expect.arrayContaining([
                    'Saul Goodman',
                    'Kimberly Wexler',
                    'Lalo Salamanca'
                ]),
                'Saul Goodman': ['Howard Hamlin'],
            });
            expect(result['Howard Hamlin'].length).toBe(3);
        })
        it("vote with none json", () => {
            const result = mapVoterByCandidatesToNames({ voterByCandidateJson: voteWithNoneJson, ...mockGameData })
            expect(result).toEqual({
                'none': expect.arrayContaining([
                    'Saul Goodman',
                    'Kimberly Wexler',
                    'Howard Hamlin'
                ]),
                'Howard Hamlin': ['Lalo Salamanca'],
            });
            expect(result['none'].length).toBe(3);
        })
    });
});