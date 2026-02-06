import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Clapperboard, 
  ArrowLeft, 
  Trophy, 
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
  Heart,
  Target,
  Brain,
  Star
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

interface DraftState {
  phase: "draft" | "battle" | "results";
  currentRound: number;
  playerTeam: MovieAthlete[];
  opponentTeam: MovieAthlete[];
  availablePool: MovieAthlete[];
  battleResult: {
    playerScore: number;
    opponentScore: number;
    winner: string;
    playerBreakdown: { name: string; score: number }[];
    opponentBreakdown: { name: string; score: number }[];
  } | null;
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
    const result = draftState.battleResult;
    const playerWon = result.winner === "player";
    
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
                <span className="font-semibold">Draft Battle Results</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <div className={`w-24 h-24 rounded-full ${playerWon ? "bg-gradient-to-br from-amber-500 to-yellow-600" : "bg-gradient-to-br from-gray-500 to-gray-600"} flex items-center justify-center mx-auto mb-6`}>
                  {playerWon ? (
                    <Crown className="h-12 w-12 text-white" />
                  ) : (
                    <Shield className="h-12 w-12 text-white" />
                  )}
                </div>
                <h2 className="text-3xl font-bold font-serif mb-2">
                  {playerWon ? "Victory!" : result.winner === "tie" ? "It's a Tie!" : "Defeat"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {playerWon ? "Your team dominated the competition!" : result.winner === "tie" ? "Both teams matched evenly!" : "The opponent's team was stronger this time."}
                </p>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className={`p-6 rounded-md ${playerWon ? "bg-green-500/10 border border-green-500/30" : "bg-muted"}`}>
                    <div className="text-sm text-muted-foreground mb-1">Your Team</div>
                    <div className="text-4xl font-bold text-primary">{result.playerScore}</div>
                  </div>
                  <div className={`p-6 rounded-md ${!playerWon && result.winner !== "tie" ? "bg-red-500/10 border border-red-500/30" : "bg-muted"}`}>
                    <div className="text-sm text-muted-foreground mb-1">Opponent</div>
                    <div className="text-4xl font-bold">{result.opponentScore}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="font-semibold mb-3 text-left">Your Lineup</h3>
                    <div className="space-y-2">
                      {result.playerBreakdown.map((p, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                          <span className="text-sm">{p.name}</span>
                          <Badge variant="secondary">{p.score}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 text-left">Opponent Lineup</h3>
                    <div className="space-y-2">
                      {result.opponentBreakdown.map((p, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                          <span className="text-sm">{p.name}</span>
                          <Badge variant="secondary">{p.score}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
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
              </CardContent>
            </Card>
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
            <p className="text-muted-foreground">Review your lineup and start the battle</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Your Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {draftState.playerTeam.map((athlete) => (
                  <div key={athlete.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ARCHETYPE_COLORS[athlete.archetype]} flex items-center justify-center`}>
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{athlete.name}</div>
                      <div className="text-xs text-muted-foreground">{athlete.movie} ({athlete.movieYear})</div>
                    </div>
                    <Badge variant="outline" className="capitalize">{athlete.archetype}</Badge>
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
              <CardContent className="space-y-3">
                {draftState.opponentTeam.map((athlete) => (
                  <div key={athlete.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ARCHETYPE_COLORS[athlete.archetype]} flex items-center justify-center`}>
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{athlete.name}</div>
                      <div className="text-xs text-muted-foreground">{athlete.movie} ({athlete.movieYear})</div>
                    </div>
                    <Badge variant="outline" className="capitalize">{athlete.archetype}</Badge>
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
          <div className="flex items-center gap-4">
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold font-serif">Draft Your Team</h2>
              <p className="text-muted-foreground">Pick {TEAM_SIZE} athletes to compete</p>
            </div>
            <div className={`px-4 py-2 rounded-md bg-gradient-to-r ${ARCHETYPE_COLORS[currentArchetype]} text-white`}>
              <span className="font-semibold">{ARCHETYPE_LABELS[currentArchetype]} Round</span>
            </div>
          </div>

          {draftState.playerTeam.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {draftState.playerTeam.map((athlete) => (
                <Badge key={athlete.id} variant="secondary" className="py-1.5 px-3">
                  {athlete.name}
                </Badge>
              ))}
            </div>
          )}
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
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${ARCHETYPE_COLORS[athlete.archetype]} flex items-center justify-center shrink-0`}>
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{athlete.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{athlete.actor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        <Film className="h-3 w-3 mr-1" />
                        {athlete.movie}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">{athlete.sport}</Badge>
                    </div>

                    {athlete.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {athlete.bio}
                      </p>
                    )}

                    {athlete.quote && (
                      <p className="text-xs italic text-muted-foreground border-l-2 border-primary/30 pl-2">
                        "{athlete.quote.length > 60 ? athlete.quote.slice(0, 60) + "..." : athlete.quote}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 inline mr-1" />
          Stats are hidden until the battle! Choose based on your movie knowledge.
        </div>
      </main>
    </div>
  );
}
