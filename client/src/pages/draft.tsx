import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  ArrowLeft, 
  RotateCcw,
  Swords,
  User,
  Film,
  Loader2,
  XCircle,
  Crown,
  Sparkles,
  Users,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Trophy,
  Star,
  Check,
  X,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MovieAthlete } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const ARCHETYPES_ORDER = ["captain", "natural", "underdog", "veteran", "villain", "teammate", "wildcard"];
const ARCHETYPE_LABELS: Record<string, string> = {
  captain: "Captains",
  natural: "Naturals",
  underdog: "Underdogs",
  veteran: "Veterans",
  villain: "Villains",
  teammate: "Teammates",
  wildcard: "Wildcards",
};

const ARCHETYPE_COLORS: Record<string, string> = {
  captain: "from-blue-500 to-indigo-600",
  natural: "from-emerald-500 to-green-600",
  underdog: "from-amber-500 to-yellow-600",
  veteran: "from-purple-500 to-violet-600",
  villain: "from-red-500 to-rose-600",
  teammate: "from-cyan-500 to-teal-600",
  wildcard: "from-pink-500 to-fuchsia-600",
};

const STAT_LABELS: Record<string, { label: string; weight: string }> = {
  Heart: { label: "HRT", weight: "1.3x" },
  Clutch: { label: "CLT", weight: "1.2x" },
  Teamwork: { label: "TMW", weight: "1.2x" },
  Leadership: { label: "LDR", weight: "1.1x" },
  Athleticism: { label: "ATH", weight: "1.0x" },
  Skill: { label: "SKL", weight: "1.0x" },
  Intimidation: { label: "INT", weight: "0.8x" },
  Charisma: { label: "CHR", weight: "0.7x" },
};

function StatBar({ name, value, max = 99 }: { name: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const info = STAT_LABELS[name] || { label: name.slice(0, 3).toUpperCase(), weight: "1.0x" };
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-7 shrink-0 font-mono">{info.label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold w-5 text-right">{value}</span>
    </div>
  );
}

function AthleteStatCard({ athlete, compact = false }: { athlete: MovieAthlete; compact?: boolean }) {
  const stats = [
    { name: "Heart", value: athlete.heart },
    { name: "Clutch", value: athlete.clutch },
    { name: "Teamwork", value: athlete.teamwork },
    { name: "Leadership", value: athlete.leadership },
    { name: "Athleticism", value: athlete.athleticism },
    { name: "Skill", value: athlete.skill },
    { name: "Intimidation", value: athlete.intimidation },
    { name: "Charisma", value: athlete.charisma },
  ];
  const totalRaw = stats.reduce((s, st) => s + st.value, 0);

  return (
    <div>
      <div className="flex items-start gap-3 mb-2">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ARCHETYPE_COLORS[athlete.archetype]} flex items-center justify-center shrink-0`}>
          <User className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate">{athlete.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{athlete.actor} - {athlete.movie}</p>
        </div>
        <div className="text-right shrink-0">
          <Badge variant="outline" className="capitalize text-[10px]">{athlete.archetype}</Badge>
          {!compact && <div className="text-[10px] text-muted-foreground mt-1">OVR {Math.round(totalRaw / 8)}</div>}
        </div>
      </div>
      {!compact && (
        <div className="space-y-0.5 mt-2">
          {stats.map(s => <StatBar key={s.name} name={s.name} value={s.value} />)}
        </div>
      )}
    </div>
  );
}

interface AthleteBreakdown {
  name: string;
  movie: string;
  archetype: string;
  score: number;
  stats: { name: string; value: number; weight: number; weighted: number }[];
  wildcardName: string | null;
  wildcardValue: number | null;
}

interface BattleResult {
  playerScore: number;
  opponentScore: number;
  winner: string;
  margin: number;
  playerBaseScore: number;
  opponentBaseScore: number;
  playerSynergyTotal: number;
  opponentSynergyTotal: number;
  playerSynergies: { name: string; description: string; bonus: number; active: boolean }[];
  opponentSynergies: { name: string; description: string; bonus: number; active: boolean }[];
  playerBreakdown: AthleteBreakdown[];
  opponentBreakdown: AthleteBreakdown[];
  playerMvp: { name: string; score: number; archetype: string };
  opponentMvp: { name: string; score: number; archetype: string };
  matchups: { player: { name: string; archetype: string; score: number }; opponent: { name: string; archetype: string; score: number }; winner: string; margin: number }[];
  playerTeamStats: { name: string; average: number }[];
  opponentTeamStats: { name: string; average: number }[];
}

interface DraftState {
  phase: "draft" | "battle" | "results";
  currentRound: number;
  playerTeam: MovieAthlete[];
  opponentTeam: MovieAthlete[];
  availablePool: MovieAthlete[];
  battleResult: BattleResult | null;
  currentBattle: number;
  battleLog: { playerCard: MovieAthlete; opponentCard: MovieAthlete; playerWon: boolean }[];
}

const TEAM_SIZE = 5;

export default function Draft() {
  const [draftState, setDraftState] = useState<DraftState>({
    phase: "draft",
    currentRound: 0,
    playerTeam: [],
    opponentTeam: [],
    availablePool: [],
    battleResult: null,
    currentBattle: 0,
    battleLog: [],
  });
  const [expandedAthlete, setExpandedAthlete] = useState<string | null>(null);
  const [resultsTab, setResultsTab] = useState<"overview" | "matchups" | "stats">("overview");

  const { data: allAthletes, isLoading, error, refetch } = useQuery<MovieAthlete[]>({
    queryKey: ["/api/athletes"],
  });

  const battleMutation = useMutation({
    mutationFn: async (data: { playerTeam: MovieAthlete[]; opponentTeam: MovieAthlete[] }) => {
      const res = await apiRequest("POST", "/api/athletes/battle", data);
      return await res.json();
    },
    onSuccess: (result: any) => {
      setDraftState(prev => ({ ...prev, battleResult: result, phase: "results" }));
      const won = result.winner === "player" ? 1 : 0;
      saveGameMutation.mutate({
        gameType: "draft",
        score: won,
        totalQuestions: 1,
      });
    },
  });

  const saveGameMutation = useMutation({
    mutationFn: async (data: { gameType: string; score: number; totalQuestions: number }) => {
      return apiRequest("POST", "/api/games", data);
    },
  });

  useEffect(() => {
    if (allAthletes && allAthletes.length > 0 && draftState.availablePool.length === 0) {
      const shuffled = [...allAthletes].sort(() => Math.random() - 0.5);
      setDraftState(prev => ({ ...prev, availablePool: shuffled }));
    }
  }, [allAthletes, draftState.availablePool.length]);

  const getCurrentArchetype = () => {
    return ARCHETYPES_ORDER[draftState.currentRound % ARCHETYPES_ORDER.length];
  };

  const getAvailableForRound = () => {
    const archetype = getCurrentArchetype();
    const archetypePool = draftState.availablePool.filter(a => a.archetype === archetype);
    if (archetypePool.length >= 2) {
      return archetypePool;
    }
    return draftState.availablePool.slice(0, 6);
  };

  const handleDraftPick = (athlete: MovieAthlete) => {
    const available = getAvailableForRound();
    const remaining = available.filter(a => a.id !== athlete.id);
    const opponentPick = remaining.length > 0 
      ? remaining[Math.floor(Math.random() * remaining.length)]
      : null;

    const newPlayerTeam = [...draftState.playerTeam, athlete];
    const newOpponentTeam = opponentPick 
      ? [...draftState.opponentTeam, opponentPick]
      : draftState.opponentTeam;

    const newPool = draftState.availablePool.filter(
      a => a.id !== athlete.id && (opponentPick ? a.id !== opponentPick.id : true)
    );

    const newRound = draftState.currentRound + 1;
    const draftComplete = newPlayerTeam.length >= TEAM_SIZE;

    setDraftState(prev => ({
      ...prev,
      playerTeam: newPlayerTeam,
      opponentTeam: newOpponentTeam,
      availablePool: newPool,
      currentRound: newRound,
      phase: draftComplete ? "battle" : "draft",
    }));
  };

  const handleStartBattle = () => {
    battleMutation.mutate({
      playerTeam: draftState.playerTeam,
      opponentTeam: draftState.opponentTeam,
    });
  };

  const handleRestart = () => {
    setDraftState({
      phase: "draft",
      currentRound: 0,
      playerTeam: [],
      opponentTeam: [],
      availablePool: [],
      battleResult: null,
      currentBattle: 0,
      battleLog: [],
    });
    setResultsTab("overview");
    setExpandedAthlete(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading movie athletes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't load the athletes. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button variant="outline" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back Home
                </Button>
              </Link>
              <Button onClick={() => refetch()} data-testid="button-try-again">Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (draftState.phase === "results" && draftState.battleResult) {
    const r = draftState.battleResult;
    const matchups = r.matchups || [];
    const playerBreakdown = r.playerBreakdown || [];
    const opponentBreakdown = r.opponentBreakdown || [];
    const playerSynergies = r.playerSynergies || [];
    const opponentSynergies = r.opponentSynergies || [];
    const playerTeamStats = r.playerTeamStats || [];
    const opponentTeamStats = r.opponentTeamStats || [];
    const playerWon = r.winner === "player";
    const matchupsWon = matchups.filter((m: { winner: string }) => m.winner === "player").length;
    const matchupsLost = matchups.filter((m: { winner: string }) => m.winner === "opponent").length;
    const closestMatchup = matchups.length > 0 ? [...matchups].sort((a: { margin: number }, b: { margin: number }) => a.margin - b.margin)[0] : null;
    const biggestBlowout = matchups.length > 0 ? [...matchups].sort((a: { margin: number }, b: { margin: number }) => b.margin - a.margin)[0] : null;
    
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-primary" />
                <span className="font-semibold">Battle Report</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-full ${playerWon ? "bg-gradient-to-br from-amber-500 to-yellow-600" : r.winner === "tie" ? "bg-gradient-to-br from-gray-400 to-gray-500" : "bg-gradient-to-br from-red-500 to-red-700"} flex items-center justify-center mx-auto mb-4`}>
                {playerWon ? <Crown className="h-10 w-10 text-white" /> : r.winner === "tie" ? <Minus className="h-10 w-10 text-white" /> : <Shield className="h-10 w-10 text-white" />}
              </div>
              <h2 className="text-3xl font-bold font-serif mb-1" data-testid="text-result-title">
                {playerWon ? "Victory!" : r.winner === "tie" ? "Draw" : "Defeat"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {r.winner === "tie" ? "Both teams tied!" : `Won by ${r.margin} points`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className={playerWon ? "border-green-500/40" : ""}>
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Your Team</div>
                  <div className="text-3xl font-bold text-primary" data-testid="text-player-score">{r.playerScore}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {r.playerBaseScore} base + {r.playerSynergyTotal} synergy
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Head-to-Head</div>
                  <div className="text-xl font-bold mt-1" data-testid="text-matchup-record">
                    <span className="text-green-500">{matchupsWon}</span>
                    <span className="text-muted-foreground mx-1">-</span>
                    <span className="text-red-500">{matchupsLost}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Matchups W-L</div>
                </CardContent>
              </Card>
              <Card className={!playerWon && r.winner !== "tie" ? "border-red-500/40" : ""}>
                <CardContent className="p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Opponent</div>
                  <div className="text-3xl font-bold" data-testid="text-opponent-score">{r.opponentScore}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {r.opponentBaseScore} base + {r.opponentSynergyTotal} synergy
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-1 mb-4 bg-muted rounded-md p-1">
              {(["overview", "matchups", "stats"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setResultsTab(tab)}
                  className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${resultsTab === tab ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                  data-testid={`tab-${tab}`}
                >
                  {tab === "overview" ? "Overview" : tab === "matchups" ? "Matchups" : "Stats"}
                </button>
              ))}
            </div>

            {resultsTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold">Your MVP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${ARCHETYPE_COLORS[r.playerMvp.archetype]} flex items-center justify-center shrink-0`}>
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate" data-testid="text-player-mvp">{r.playerMvp.name}</div>
                          <div className="text-xs text-muted-foreground">{r.playerMvp.score} pts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">Their MVP</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${ARCHETYPE_COLORS[r.opponentMvp.archetype]} flex items-center justify-center shrink-0`}>
                          <Star className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate" data-testid="text-opponent-mvp">{r.opponentMvp.name}</div>
                          <div className="text-xs text-muted-foreground">{r.opponentMvp.score} pts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold">Synergy Bonuses</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Your Team (+{r.playerSynergyTotal})</div>
                        <div className="space-y-1.5">
                          {playerSynergies.map((s: { name: string; description: string; bonus: number; active: boolean }, i: number) => (
                            <div key={i} className={`flex items-center gap-2 text-xs ${s.active ? "" : "opacity-40"}`}>
                              {s.active ? <Check className="h-3 w-3 text-green-500 shrink-0" /> : <X className="h-3 w-3 text-muted-foreground shrink-0" />}
                              <span className="truncate">{s.name}</span>
                              <span className="ml-auto font-semibold shrink-0">+{s.bonus}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Opponent (+{r.opponentSynergyTotal})</div>
                        <div className="space-y-1.5">
                          {opponentSynergies.map((s: { name: string; description: string; bonus: number; active: boolean }, i: number) => (
                            <div key={i} className={`flex items-center gap-2 text-xs ${s.active ? "" : "opacity-40"}`}>
                              {s.active ? <Check className="h-3 w-3 text-green-500 shrink-0" /> : <X className="h-3 w-3 text-muted-foreground shrink-0" />}
                              <span className="truncate">{s.name}</span>
                              <span className="ml-auto font-semibold shrink-0">+{s.bonus}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Battle Insights</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {closestMatchup && (
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">
                            Closest matchup: <span className="text-foreground font-medium">{closestMatchup.player.name}</span> vs <span className="text-foreground font-medium">{closestMatchup.opponent.name}</span> (only {closestMatchup.margin} pts apart)
                          </span>
                        </div>
                      )}
                      {biggestBlowout && biggestBlowout !== closestMatchup && (
                        <div className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">
                            Biggest mismatch: <span className="text-foreground font-medium">{biggestBlowout.winner === "player" ? biggestBlowout.player.name : biggestBlowout.opponent.name}</span> dominated by {biggestBlowout.margin} pts
                          </span>
                        </div>
                      )}
                      {r.playerSynergyTotal > r.opponentSynergyTotal && (
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">Your team composition earned <span className="text-foreground font-medium">{r.playerSynergyTotal - r.opponentSynergyTotal} more synergy</span> points than the opponent</span>
                        </div>
                      )}
                      {r.opponentSynergyTotal > r.playerSynergyTotal && (
                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">The opponent's team comp earned <span className="text-foreground font-medium">{r.opponentSynergyTotal - r.playerSynergyTotal} more synergy</span> points</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {resultsTab === "matchups" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {matchups.map((m: { player: { name: string; archetype: string; score: number }; opponent: { name: string; archetype: string; score: number }; winner: string; margin: number }, i: number) => {
                  const pWon = m.winner === "player";
                  const tied = m.winner === "tie";
                  return (
                    <Card key={i} className={pWon ? "border-green-500/30" : tied ? "" : "border-red-500/30"}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-[10px]">Round {i + 1}</Badge>
                          {pWon && <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">WIN +{m.margin}</Badge>}
                          {!pWon && !tied && <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">LOSS -{m.margin}</Badge>}
                          {tied && <Badge variant="outline" className="text-[10px]">DRAW</Badge>}
                        </div>
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                          <div className="text-left">
                            <div className={`font-semibold text-sm ${pWon ? "text-green-500" : ""}`}>{m.player.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{m.player.archetype}</div>
                          </div>
                          <div className="text-center font-bold text-lg">
                            <span className={pWon ? "text-green-500" : ""}>{m.player.score}</span>
                            <span className="text-muted-foreground mx-1 text-sm">vs</span>
                            <span className={!pWon && !tied ? "text-red-500" : ""}>{m.opponent.score}</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold text-sm ${!pWon && !tied ? "text-red-500" : ""}`}>{m.opponent.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{m.opponent.archetype}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedAthlete(expandedAthlete === `matchup-${i}` ? null : `matchup-${i}`)}
                          className="flex items-center gap-1 text-xs text-muted-foreground mt-2 mx-auto"
                          data-testid={`button-expand-matchup-${i}`}
                        >
                          {expandedAthlete === `matchup-${i}` ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {expandedAthlete === `matchup-${i}` ? "Hide" : "Show"} stat comparison
                        </button>

                        {expandedAthlete === `matchup-${i}` && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 pt-3 border-t border-border">
                            <div className="space-y-1">
                              {playerBreakdown[i]?.stats.map((ps: { name: string; value: number; weight: number; weighted: number }, si: number) => {
                                const os = opponentBreakdown[i]?.stats[si];
                                if (!os) return null;
                                const pHigher = ps.weighted > os.weighted;
                                const info = STAT_LABELS[ps.name] || { label: ps.name.slice(0, 3), weight: "" };
                                return (
                                  <div key={si} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-[11px]">
                                    <div className="flex items-center gap-1 justify-end">
                                      <span className={`font-mono ${pHigher ? "font-bold text-green-500" : "text-muted-foreground"}`}>{ps.weighted}</span>
                                      <span className="text-muted-foreground">({ps.value})</span>
                                    </div>
                                    <div className="text-center font-medium text-muted-foreground w-8">
                                      {info.label}
                                      <div className="text-[9px] text-muted-foreground/60">{info.weight}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">({os.value})</span>
                                      <span className={`font-mono ${!pHigher && os.weighted !== ps.weighted ? "font-bold text-red-500" : "text-muted-foreground"}`}>{os.weighted}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            )}

            {resultsTab === "stats" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold mb-3">Team Stat Averages</div>
                    <div className="space-y-2">
                      {playerTeamStats.map((ps: { name: string; average: number }, i: number) => {
                        const os = opponentTeamStats[i];
                        if (!os) return null;
                        const info = STAT_LABELS[ps.name] || { label: ps.name, weight: "" };
                        const pHigher = ps.average > os.average;
                        const oHigher = os.average > ps.average;
                        return (
                          <div key={i} className="grid grid-cols-[50px_1fr_60px_1fr_50px] gap-2 items-center">
                            <span className={`text-xs text-right font-semibold ${pHigher ? "text-green-500" : ""}`}>{ps.average}</span>
                            <div className="h-2 bg-muted rounded-full flex justify-end">
                              <div className={`h-full rounded-full ${pHigher ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${ps.average}%` }} />
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] font-medium">{info.label}</div>
                              <div className="text-[9px] text-muted-foreground">{info.weight}</div>
                            </div>
                            <div className="h-2 bg-muted rounded-full">
                              <div className={`h-full rounded-full ${oHigher ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${os.average}%` }} />
                            </div>
                            <span className={`text-xs font-semibold ${oHigher ? "text-red-500" : ""}`}>{os.average}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-1">
                      <span>Your Team</span>
                      <span>Opponent</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" /> Your Roster
                    </div>
                    <div className="space-y-3">
                      {playerBreakdown.map((p: AthleteBreakdown, i: number) => (
                        <Card key={i}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="font-semibold text-sm">{p.name}</span>
                                {p.name === r.playerMvp?.name && <Star className="h-3 w-3 text-amber-500 inline ml-1" />}
                              </div>
                              <Badge variant="secondary" className="text-[10px]">{p.score}</Badge>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <Badge variant="outline" className="capitalize text-[9px]">{p.archetype}</Badge>
                              <span className="text-[10px] text-muted-foreground">{p.movie}</span>
                            </div>
                            <div className="space-y-0.5">
                              {p.stats.map((s, si) => (
                                <StatBar key={si} name={s.name} value={s.value} />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-destructive" /> Opponent Roster
                    </div>
                    <div className="space-y-3">
                      {opponentBreakdown.map((p: AthleteBreakdown, i: number) => (
                        <Card key={i}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <span className="font-semibold text-sm">{p.name}</span>
                                {p.name === r.opponentMvp?.name && <Star className="h-3 w-3 text-amber-500 inline ml-1" />}
                              </div>
                              <Badge variant="secondary" className="text-[10px]">{p.score}</Badge>
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              <Badge variant="outline" className="capitalize text-[9px]">{p.archetype}</Badge>
                              <span className="text-[10px] text-muted-foreground">{p.movie}</span>
                            </div>
                            <div className="space-y-0.5">
                              {p.stats.map((s, si) => (
                                <StatBar key={si} name={s.name} value={s.value} />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 justify-center mt-6 mb-8">
              <Link href="/">
                <Button variant="outline" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back Home
                </Button>
              </Link>
              <Button onClick={handleRestart} data-testid="button-play-again">
                <RotateCcw className="mr-2 h-4 w-4" />
                Draft Again
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (draftState.phase === "battle") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-primary" />
                <span className="font-semibold">Ready for Battle!</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif mb-2">Teams Assembled!</h2>
            <p className="text-muted-foreground">Review your lineups, then battle</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Your Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {draftState.playerTeam.map((athlete) => (
                  <div key={athlete.id} className="p-3 bg-muted/50 rounded-md">
                    <AthleteStatCard athlete={athlete} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-destructive" />
                  Opponent Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {draftState.opponentTeam.map((athlete) => (
                  <div key={athlete.id} className="p-3 bg-muted/50 rounded-md">
                    <AthleteStatCard athlete={athlete} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={handleStartBattle}
              disabled={battleMutation.isPending}
              data-testid="button-start-battle"
            >
              {battleMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Swords className="mr-2 h-5 w-5" />
              )}
              Start Battle!
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const availableAthletes = getAvailableForRound();
  const currentArchetype = getCurrentArchetype();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" />
              <span className="font-semibold">Movie Draft</span>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="secondary">Round {draftState.currentRound + 1}/{TEAM_SIZE}</Badge>
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
              <Users className="h-4 w-4 text-accent" />
              <span className="font-semibold" data-testid="text-team-size">{draftState.playerTeam.length}/{TEAM_SIZE}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 className="text-2xl font-bold font-serif">Draft Your Team</h2>
              <p className="text-muted-foreground">Pick {TEAM_SIZE} athletes to compete. Study their stats!</p>
            </div>
            <div className={`px-4 py-2 rounded-md bg-gradient-to-r ${ARCHETYPE_COLORS[currentArchetype]} text-white`}>
              <span className="font-semibold">{ARCHETYPE_LABELS[currentArchetype]} Round</span>
            </div>
          </div>

          {draftState.playerTeam.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {draftState.playerTeam.map((athlete) => (
                <Badge key={athlete.id} variant="secondary" className="py-1.5 px-3">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${ARCHETYPE_COLORS[athlete.archetype]} mr-1.5`} />
                  {athlete.name}
                </Badge>
              ))}
            </div>
          )}

          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                <span><strong>Strategy tip:</strong> Mix archetypes for synergy bonuses. Captain (+50), Veteran+Underdog (+30), Natural+Teammate (+25), 4+ unique types (+40).</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={draftState.currentRound}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {availableAthletes.slice(0, 6).map((athlete) => (
              <motion.div
                key={athlete.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer hover-elevate h-full"
                  onClick={() => handleDraftPick(athlete)}
                  data-testid={`card-athlete-${athlete.id}`}
                >
                  <CardContent className="p-4">
                    <AthleteStatCard athlete={athlete} />
                    
                    {athlete.wildcardName && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 rounded-md px-2 py-1">
                        <Zap className="h-3 w-3 shrink-0" />
                        <span className="font-medium">{athlete.wildcardName}</span>
                        {athlete.wildcardValue ? <span className="ml-auto">+{athlete.wildcardValue}</span> : null}
                      </div>
                    )}

                    {athlete.quote && (
                      <p className="text-[10px] italic text-muted-foreground border-l-2 border-primary/30 pl-2 mt-2 line-clamp-1">
                        "{athlete.quote}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
