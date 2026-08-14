import { inactivityCheck, mapVoterByCandidatesToNames, phaseTransition, tallyVotes, winningCondition } from "@/lib/pure/game";

describe('pure func in game.ts', () => {

    describe('phaseTransition()', () => {

        const baseDuration = { voteDuration: 30, discussDuration: 60 };
        describe('round 0', () => {
            test.each([
                ['starting', 'downtime', 60],
                ['downtime', 'uptime', 60],
                ['uptime', 'hangVote', 30],
                ['hangVote', 'hangVoteCount', 8],
                ['hangVoteCount', 'hangVoteResult', 8],
                ['hangVoteResult', 'downtime', 60],
            ])('%s -> %s (duration %i)', (phase, expectedNextPhase, expectedDuration) => {
                const result = phaseTransition({ ...baseDuration, round: 0, phase });
                expect(result.nextPhase).toBe(expectedNextPhase);
                expect(result.phaseEndAtDuration).toBe(expectedDuration);
            });
        });

        describe('round 1', () => {
            test.each([
                ['downtime', 'killVote', 30],
                ['killVote', 'killVoteCount', 8],
                ['killVoteCount', 'killVoteResult', 8],
                ['killVoteResult', 'uptime', 60],
                ['uptime', 'hangVote', 30],
                ['hangVote', 'hangVoteCount', 8],
                ['hangVoteCount', 'hangVoteResult', 8],
                ['hangVoteResult', 'downtime', 60],
            ])('%s -> %s (duration %i)', (phase, expectedNextPhase, expectedDuration) => {
                const result = phaseTransition({ ...baseDuration, round: 1, phase });
                expect(result.nextPhase).toBe(expectedNextPhase);
                expect(result.phaseEndAtDuration).toBe(expectedDuration);
            });
        });

        // lua return strings
        it("coerce duration string to number", () => {
            const result = phaseTransition({ phase: 'uptime', round: 1, voteDuration: '30', discussDuration: '60' })
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
        it("good won during the uptime", () => {
            const result = winningCondition({ goodSide: 2, badSide: 0 }, "uptime");
            expect(result).toBe("goodEnd")
        });
        it("bad won during the downtime", () => {
            const result = winningCondition({ goodSide: 0, badSide: 1 }, "downtime");
            expect(result).toBe("badEnd")
        });
        it("wait for uptime or downtime before changing endGame", () => {
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

    describe('inactivityCheck()', () => {
        type inactivityTestCase = {
            description: string;
            votedPlayerIds: string[];
            voterByCandidate: Record<string, string[]>;
            expectedVotedPlayerIds: string[];
            expectedIsInactivityHanging: boolean;
        }
        const cases: inactivityTestCase[] = [
            {
                description: "1. no tie (clean sweep 'none'), no hang -> run inactivity hang",
                votedPlayerIds: ["none"],
                voterByCandidate: { "none": ["p:id1:vote", "p:id2:vote", "p:id3:vote", "p:id4:vote"] },
                expectedVotedPlayerIds: ["id4"],
                expectedIsInactivityHanging: true,
            },
            {
                description: "2. tie (four-way) with 'not voting', no hang -> run inactivity hang",
                votedPlayerIds: ["none", "id1", "id2", "id3"],
                voterByCandidate: { "none": ["p:id1:vote"], "id1": ["p:id2:vote"], "id2": ["p:id3:vote"], "id3": ["p:id4:vote"] },
                expectedVotedPlayerIds: ["id4"],
                expectedIsInactivityHanging: true,
            },
            {
                description: "3. no tie (plurality 'not voting'), no hang -> run inactivity hang",
                votedPlayerIds: ["none"],
                voterByCandidate: { "none": ["p:id1:vote", "p:id2:vote"], "id1": ["p:id3:vote"], "id2": ["p:id4:vote"] },
                expectedVotedPlayerIds: ["id4"],
                expectedIsInactivityHanging: true,
            },
            {
                description: "4. tie (two-way) with 'not voting', no hang -> run inactivity hang",
                votedPlayerIds: ["none", "id1"],
                voterByCandidate: { "none": ["p:id1:vote", "p:id2:vote"], "id1": ["p:id3:vote", "p:id4:vote"] },
                expectedVotedPlayerIds: ["id4"],
                expectedIsInactivityHanging: true
            },
            {
                description: "5. no tie (plurality hang) with 'not voting, hang -> no inactivity hang",
                votedPlayerIds: ["id1"],
                voterByCandidate: { "none": ["p:id1:vote"], "id1": ["p:id2:vote", "p:id3:vote"], "id2": ["p:id4:vote"] },
                expectedVotedPlayerIds: ["id1"],
                expectedIsInactivityHanging: false
            },
            {
                description: "6. tie (two-way), no hang -> no inactivity hang",
                votedPlayerIds: ["id1", "id2"],
                voterByCandidate: { "id1": ["p:id2:vote", "p:id3:vote"], "id2": ["p:id1:vote", "p:id4:vote"] },
                expectedVotedPlayerIds: ["id1", "id2"],
                expectedIsInactivityHanging: false
            },
            {
                description: "7. no tie (majority hang), hang -> no inactivity hang",
                votedPlayerIds: ["id2"],
                voterByCandidate: { "id1": ["p:id2:vote"], "id2": ["p:id1:vote", "p:id3:vote", "p:id4:vote"] },
                expectedVotedPlayerIds: ["id2"],
                expectedIsInactivityHanging: false
            },
            {
                description: "8. tie (four-way), no hang -> no inactivity hang",
                votedPlayerIds: ["id1", "id2", "id3", "id4"],
                voterByCandidate: { "id1": ["p:id2:vote"], "id2": ["p:id3:vote"], "id3": ["p:id4:vote"], "id4": ["p:id1:vote"] },
                expectedVotedPlayerIds: ["id1", "id2", "id3", "id4"],
                expectedIsInactivityHanging: false
            },

        ]

        const inactivityData = { "p:id1:inactivity": 0, "p:id2:inactivity": 1, "p:id3:inactivity": 2, "p:id4:inactivity": 3 };
        const nextPhase = "hangVoteCount";
        const isInactivityHanging = false;

        describe('4 player test with inactivity exist', () => {
            test.each(cases)('$description', ({ votedPlayerIds, voterByCandidate, expectedVotedPlayerIds, expectedIsInactivityHanging }) => {
                const result = inactivityCheck(votedPlayerIds, voterByCandidate, nextPhase, inactivityData, isInactivityHanging);
                expect(result.votedPlayerIds).toEqual(expectedVotedPlayerIds);
                expect(result.isInactivityHanging).toBe(expectedIsInactivityHanging);
            });
        });
    });
});
