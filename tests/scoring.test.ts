import { describe, it, expect } from "vitest";
import { calculateWeightedScore, calculateTeamScore } from "../server/routes";
import type { MovieAthlete } from "@shared/schema";

function makeAthlete(overrides: Partial<MovieAthlete> = {}): MovieAthlete {
  return {
    id: "test-1",
    name: "Rocky Balboa",
    movie: "Rocky",
    movieYear: 1976,
    sport: "Boxing",
    actor: "Sylvester Stallone",
    archetype: "underdog",
    bio: null,
    quote: null,
    athleticism: 50,
    clutch: 50,
    leadership: 50,
    heart: 50,
    skill: 50,
    intimidation: 50,
    teamwork: 50,
    charisma: 50,
    wildcardName: null,
    wildcardCategory: null,
    wildcardValue: 0,
    ...overrides,
  };
}

describe("calculateWeightedScore", () => {
  it("calculates the correct weighted score for default stats (no wildcard)", () => {
    const athlete = makeAthlete();
    const score = calculateWeightedScore(athlete);
    const expected =
      50 * 1.0 + // athleticism
      50 * 1.2 + // clutch
      50 * 1.1 + // leadership
      50 * 1.3 + // heart
      50 * 1.0 + // skill
      50 * 0.8 + // intimidation
      50 * 1.2 + // teamwork
      50 * 0.7 + // charisma
      0 * 0.5;   // wildcard (0)
    expect(score).toBe(expected);
  });

  it("includes wildcard value in the score", () => {
    const withoutWildcard = makeAthlete({ wildcardValue: 0 });
    const withWildcard = makeAthlete({ wildcardName: "Iron Chin", wildcardValue: 97 });
    const diff = calculateWeightedScore(withWildcard) - calculateWeightedScore(withoutWildcard);
    expect(diff).toBeCloseTo(97 * 0.5);
  });

  it("weights heart and clutch higher than charisma and intimidation", () => {
    const heartFocused = makeAthlete({ heart: 99, charisma: 1 });
    const charismaFocused = makeAthlete({ heart: 1, charisma: 99 });
    expect(calculateWeightedScore(heartFocused)).toBeGreaterThan(
      calculateWeightedScore(charismaFocused)
    );
  });

  it("handles zero stats", () => {
    const zeroAthlete = makeAthlete({
      athleticism: 0, clutch: 0, leadership: 0, heart: 0,
      skill: 0, intimidation: 0, teamwork: 0, charisma: 0,
      wildcardValue: 0,
    });
    expect(calculateWeightedScore(zeroAthlete)).toBe(0);
  });

  it("handles max stats with wildcard", () => {
    const maxAthlete = makeAthlete({
      athleticism: 99, clutch: 99, leadership: 99, heart: 99,
      skill: 99, intimidation: 99, teamwork: 99, charisma: 99,
      wildcardValue: 99,
    });
    const score = calculateWeightedScore(maxAthlete);
    const expectedBase = 99 * (1.0 + 1.2 + 1.1 + 1.3 + 1.0 + 0.8 + 1.2 + 0.7);
    const expectedWildcard = 99 * 0.5;
    expect(score).toBe(expectedBase + expectedWildcard);
  });

  it("wildcard value of null treated as 0", () => {
    const athlete = makeAthlete({ wildcardValue: null as any });
    const baseOnly = makeAthlete({ wildcardValue: 0 });
    expect(calculateWeightedScore(athlete)).toBe(calculateWeightedScore(baseOnly));
  });
});

describe("calculateTeamScore", () => {
  it("returns 0 for an empty team", () => {
    expect(calculateTeamScore([])).toBe(0);
  });

  it("returns the individual score plus captain bonus for a single captain", () => {
    const captain = makeAthlete({ archetype: "captain" });
    const individualScore = calculateWeightedScore(captain);
    const teamScore = calculateTeamScore([captain]);
    expect(teamScore).toBe(individualScore + 50);
  });

  it("awards synergy bonus for veteran + underdog combo", () => {
    const veteran = makeAthlete({ id: "v1", archetype: "veteran" });
    const underdog = makeAthlete({ id: "u1", archetype: "underdog" });
    const withoutCombo = calculateWeightedScore(veteran) + calculateWeightedScore(underdog);
    const teamScore = calculateTeamScore([veteran, underdog]);
    expect(teamScore).toBe(withoutCombo + 30);
  });

  it("awards synergy bonus for natural + teammate combo", () => {
    const natural = makeAthlete({ id: "n1", archetype: "natural" });
    const teammate = makeAthlete({ id: "t1", archetype: "teammate" });
    const withoutCombo = calculateWeightedScore(natural) + calculateWeightedScore(teammate);
    const teamScore = calculateTeamScore([natural, teammate]);
    expect(teamScore).toBe(withoutCombo + 25);
  });

  it("awards diversity bonus for 4+ unique archetypes", () => {
    const team = [
      makeAthlete({ id: "1", archetype: "captain" }),
      makeAthlete({ id: "2", archetype: "natural" }),
      makeAthlete({ id: "3", archetype: "underdog" }),
      makeAthlete({ id: "4", archetype: "villain" }),
    ];
    const rawTotal = team.reduce((sum, a) => sum + calculateWeightedScore(a), 0);
    const teamScore = calculateTeamScore(team);
    expect(teamScore).toBe(rawTotal + 50 + 40);
  });

  it("stacks multiple synergy bonuses correctly", () => {
    const team = [
      makeAthlete({ id: "1", archetype: "captain" }),
      makeAthlete({ id: "2", archetype: "veteran" }),
      makeAthlete({ id: "3", archetype: "underdog" }),
      makeAthlete({ id: "4", archetype: "natural" }),
      makeAthlete({ id: "5", archetype: "teammate" }),
    ];
    const rawTotal = team.reduce((sum, a) => sum + calculateWeightedScore(a), 0);
    const expectedBonus = 50 + 30 + 25 + 40;
    const teamScore = calculateTeamScore(team);
    expect(teamScore).toBe(rawTotal + expectedBonus);
  });

  it("includes wildcard values in team score", () => {
    const teamWithWildcards = [
      makeAthlete({ id: "1", archetype: "underdog", wildcardName: "Iron Chin", wildcardValue: 97 }),
      makeAthlete({ id: "2", archetype: "underdog", wildcardName: "Crane Kick", wildcardValue: 98 }),
    ];
    const teamWithout = [
      makeAthlete({ id: "1", archetype: "underdog", wildcardValue: 0 }),
      makeAthlete({ id: "2", archetype: "underdog", wildcardValue: 0 }),
    ];
    const diff = calculateTeamScore(teamWithWildcards) - calculateTeamScore(teamWithout);
    expect(diff).toBeCloseTo((97 + 98) * 0.5);
  });
});
