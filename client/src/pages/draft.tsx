import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Clapperboard, 
  ArrowLeft, 
  Trophy, 
  RotateCcw,
  Swords,
  Star,
  Calendar,
  Film,
  Loader2,
  XCircle,
  Crown,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface MatchState {
  round: number;
  score: number;
  movieA: Movie | null;
  movieB: Movie | null;
  selectedMovie: Movie | null;
  winner: Movie | null;
  showResult: boolean;
  gameOver: boolean;
  totalRounds: number;
}

const TOTAL_ROUNDS = 5;

export default function Draft() {
  const [matchState, setMatchState] = useState<MatchState>({
    round: 1,
    score: 0,
    movieA: null,
    movieB: null,
    selectedMovie: null,
    winner: null,
    showResult: false,
    gameOver: false,
    totalRounds: TOTAL_ROUNDS,
  });

  const { data: movies, isLoading, error, refetch } = useQuery<Movie[]>({
    queryKey: ["/api/movies/random", matchState.round],
    enabled: !matchState.gameOver,
  });

  const saveGameMutation = useMutation({
    mutationFn: async (data: { gameType: string; score: number; totalQuestions: number }) => {
      return apiRequest("POST", "/api/games", data);
    },
  });

  useEffect(() => {
    if (movies && movies.length >= 2 && !matchState.showResult && !matchState.gameOver) {
      setMatchState(prev => ({
        ...prev,
        movieA: movies[0],
        movieB: movies[1],
      }));
    }
  }, [movies, matchState.showResult, matchState.gameOver]);

  const handleSelect = (movie: Movie) => {
    if (matchState.showResult || !matchState.movieA || !matchState.movieB) return;

    const winnerMovie = matchState.movieA.openingWeekend >= matchState.movieB.openingWeekend
      ? matchState.movieA
      : matchState.movieB;

    const isCorrect = movie.id === winnerMovie.id;

    setMatchState(prev => ({
      ...prev,
      selectedMovie: movie,
      winner: winnerMovie,
      showResult: true,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const handleNext = () => {
    if (matchState.round >= TOTAL_ROUNDS) {
      setMatchState(prev => ({ ...prev, gameOver: true }));
      saveGameMutation.mutate({
        gameType: "draft",
        score: matchState.score,
        totalQuestions: TOTAL_ROUNDS,
      });
    } else {
      setMatchState(prev => ({
        ...prev,
        round: prev.round + 1,
        movieA: null,
        movieB: null,
        selectedMovie: null,
        winner: null,
        showResult: false,
      }));
      refetch();
    }
  };

  const handleRestart = () => {
    setMatchState({
      round: 1,
      score: 0,
      movieA: null,
      movieB: null,
      selectedMovie: null,
      winner: null,
      showResult: false,
      gameOver: false,
      totalRounds: TOTAL_ROUNDS,
    });
    refetch();
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  if (isLoading && !matchState.movieA) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing your match...</p>
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
              We couldn't load the movies. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back Home
                </Button>
              </Link>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (matchState.gameOver) {
    const percentage = Math.round((matchState.score / TOTAL_ROUNDS) * 100);
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-primary" />
                <span className="font-semibold">Movie Draft</span>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold font-serif mb-2">Draft Complete!</h2>
                <p className="text-muted-foreground mb-6">You've finished all {TOTAL_ROUNDS} rounds</p>
                
                <div className="bg-muted rounded-md p-6 mb-6">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {matchState.score}/{TOTAL_ROUNDS}
                  </div>
                  <p className="text-muted-foreground">{percentage}% accuracy</p>
                  <div className="flex items-center justify-center gap-1 mt-4">
                    {percentage >= 80 ? (
                      <>
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-accent">Box Office Expert!</span>
                      </>
                    ) : percentage >= 60 ? (
                      <span className="text-sm font-medium text-muted-foreground">Solid picks!</span>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">Keep studying those numbers!</span>
                    )}
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
                    Play Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

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
            <Badge variant="secondary">Round {matchState.round}/{TOTAL_ROUNDS}</Badge>
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="font-semibold" data-testid="text-score">{matchState.score}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-serif mb-2">Which movie had the higher opening weekend?</h2>
          <p className="text-muted-foreground">Pick the box office champion</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={matchState.round}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {[matchState.movieA, matchState.movieB].map((movie, index) => {
              if (!movie) return null;
              const isSelected = matchState.selectedMovie?.id === movie.id;
              const isWinner = matchState.winner?.id === movie.id;
              const showWinner = matchState.showResult;

              return (
                <motion.div
                  key={movie.id}
                  whileHover={!matchState.showResult ? { scale: 1.02 } : {}}
                  whileTap={!matchState.showResult ? { scale: 0.98 } : {}}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 h-full ${
                      showWinner && isWinner
                        ? "ring-2 ring-green-500 bg-green-500/5"
                        : showWinner && isSelected && !isWinner
                        ? "ring-2 ring-destructive bg-destructive/5"
                        : !showWinner
                        ? "hover-elevate"
                        : ""
                    }`}
                    onClick={() => handleSelect(movie)}
                    data-testid={`card-movie-${index}`}
                  >
                    <CardContent className="p-6">
                      <div className="aspect-[2/3] bg-gradient-to-br from-muted to-muted/50 rounded-md mb-4 flex items-center justify-center relative overflow-hidden">
                        {movie.posterUrl ? (
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <Film className="h-16 w-16 text-muted-foreground/50" />
                        )}
                        {showWinner && isWinner && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <div className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2">
                              <Crown className="h-5 w-5" />
                              Winner!
                            </div>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold font-serif mb-2" data-testid={`text-movie-title-${index}`}>
                        {movie.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="secondary">
                          <Calendar className="h-3 w-3 mr-1" />
                          {movie.year}
                        </Badge>
                        <Badge variant="outline">{movie.genre}</Badge>
                        {movie.rating && <Badge variant="outline">{movie.rating}</Badge>}
                      </div>

                      {movie.director && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Directed by {movie.director}
                        </p>
                      )}

                      {showWinner && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-3 border-t border-border"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Opening Weekend</span>
                            <span className="text-lg font-bold text-primary">
                              {formatMoney(movie.openingWeekend)}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Swords className="h-6 w-6 text-muted-foreground" />
          <span className="text-lg font-semibold text-muted-foreground">VS</span>
        </div>

        {matchState.showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Button size="lg" onClick={handleNext} data-testid="button-next">
              {matchState.round >= TOTAL_ROUNDS ? "See Final Results" : "Next Round"}
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
