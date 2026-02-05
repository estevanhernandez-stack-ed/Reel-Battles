import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Clapperboard, 
  ArrowLeft, 
  Trophy, 
  RotateCcw,
  DollarSign,
  Calendar,
  Film,
  Loader2,
  XCircle,
  TrendingUp,
  Sparkles,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface GameState {
  currentRound: number;
  score: number;
  streak: number;
  bestStreak: number;
  movieA: Movie | null;
  movieB: Movie | null;
  selectedMovie: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
  gameOver: boolean;
}

const TOTAL_ROUNDS = 10;

export default function BoxOffice() {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    score: 0,
    streak: 0,
    bestStreak: 0,
    movieA: null,
    movieB: null,
    selectedMovie: null,
    showResult: false,
    isCorrect: null,
    gameOver: false,
  });

  const { data: movies, isLoading, error, refetch } = useQuery<Movie[]>({
    queryKey: ["/api/movies/random", gameState.currentRound],
    enabled: !gameState.gameOver,
  });

  const saveGameMutation = useMutation({
    mutationFn: async (data: { gameType: string; score: number; totalQuestions: number }) => {
      return apiRequest("POST", "/api/games", data);
    },
  });

  useEffect(() => {
    if (movies && movies.length >= 2 && !gameState.showResult && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        movieA: movies[0],
        movieB: movies[1],
      }));
    }
  }, [movies, gameState.showResult, gameState.gameOver]);

  const handleGuess = (selectedId: string) => {
    if (gameState.showResult || !gameState.movieA || !gameState.movieB) return;

    const movieAWins = gameState.movieA.openingWeekend >= gameState.movieB.openingWeekend;
    const correct = (selectedId === gameState.movieA.id && movieAWins) ||
                    (selectedId === gameState.movieB.id && !movieAWins);

    const newStreak = correct ? gameState.streak + 1 : 0;
    const newBestStreak = Math.max(gameState.bestStreak, newStreak);

    setGameState(prev => ({
      ...prev,
      selectedMovie: selectedId,
      showResult: true,
      isCorrect: correct,
      score: correct ? prev.score + 1 : prev.score,
      streak: newStreak,
      bestStreak: newBestStreak,
    }));
  };

  const handleNext = () => {
    if (gameState.currentRound >= TOTAL_ROUNDS) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      saveGameMutation.mutate({
        gameType: "boxoffice",
        score: gameState.score,
        totalQuestions: TOTAL_ROUNDS,
      });
    } else {
      setGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        movieA: null,
        movieB: null,
        selectedMovie: null,
        showResult: false,
        isCorrect: null,
      }));
      refetch();
    }
  };

  const handleRestart = () => {
    setGameState({
      currentRound: 1,
      score: 0,
      streak: 0,
      bestStreak: 0,
      movieA: null,
      movieB: null,
      selectedMovie: null,
      showResult: false,
      isCorrect: null,
      gameOver: false,
    });
    refetch();
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const progressPercent = (gameState.currentRound / TOTAL_ROUNDS) * 100;

  if (isLoading && !gameState.movieA) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading box office data...</p>
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

  if (gameState.gameOver) {
    const percentage = Math.round((gameState.score / TOTAL_ROUNDS) * 100);
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
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-semibold">Box Office Heads Up</span>
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold font-serif mb-2">Game Complete!</h2>
                <p className="text-muted-foreground mb-6">You've finished all {TOTAL_ROUNDS} rounds</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted rounded-md p-4">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {gameState.score}/{TOTAL_ROUNDS}
                    </div>
                    <p className="text-sm text-muted-foreground">Correct ({percentage}%)</p>
                  </div>
                  <div className="bg-muted rounded-md p-4">
                    <div className="text-3xl font-bold text-accent mb-1">
                      {gameState.bestStreak}
                    </div>
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1 mb-6">
                  {percentage >= 80 ? (
                    <>
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-accent">Box Office Guru!</span>
                    </>
                  ) : percentage >= 60 ? (
                    <span className="text-sm font-medium text-muted-foreground">Nice work, movie mogul!</span>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">The box office is unpredictable!</span>
                  )}
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
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-semibold">Box Office Heads Up</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Streak: {gameState.streak}</span>
            </div>
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="font-semibold" data-testid="text-score">{gameState.score}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Round {gameState.currentRound} of {TOTAL_ROUNDS}
            </span>
            <span className="text-sm text-muted-foreground">
              Best Streak: {gameState.bestStreak}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-serif mb-2">
            Which movie had the bigger opening weekend?
          </h2>
          <p className="text-muted-foreground">
            Tap the movie you think earned more on opening weekend
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={gameState.currentRound}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[gameState.movieA, gameState.movieB].map((movie, index) => {
              if (!movie) return null;

              const isSelected = gameState.selectedMovie === movie.id;
              const otherMovie = index === 0 ? gameState.movieB : gameState.movieA;
              const isWinner = otherMovie && movie.openingWeekend >= otherMovie.openingWeekend;
              const showResult = gameState.showResult;

              return (
                <motion.div
                  key={movie.id}
                  whileHover={!showResult ? { y: -4 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 h-full ${
                      showResult && isWinner
                        ? "ring-2 ring-green-500"
                        : showResult && isSelected && !isWinner
                        ? "ring-2 ring-destructive"
                        : !showResult
                        ? "hover-elevate"
                        : ""
                    }`}
                    onClick={() => handleGuess(movie.id)}
                    data-testid={`card-movie-${index}`}
                  >
                    <CardContent className="p-6">
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                          {movie.posterUrl ? (
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Film className="h-12 w-12 text-muted-foreground/50" />
                          )}
                        </div>

                        {showResult && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`absolute top-2 right-2 p-2 rounded-full ${
                              isWinner ? "bg-green-500" : "bg-muted"
                            }`}
                          >
                            {isWinner ? (
                              <ChevronUp className="h-5 w-5 text-white" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </motion.div>
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
                      </div>

                      {movie.synopsis && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {movie.synopsis}
                        </p>
                      )}

                      {showResult && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="pt-4 border-t border-border"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Opening Weekend</span>
                            <span className={`text-xl font-bold ${isWinner ? "text-green-500" : "text-muted-foreground"}`}>
                              {formatMoney(movie.openingWeekend)}
                            </span>
                          </div>
                          {movie.director && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Directed by {movie.director}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {gameState.showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className={gameState.isCorrect ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}>
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md mb-4 ${
                  gameState.isCorrect ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"
                }`}>
                  {gameState.isCorrect ? (
                    <>
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-semibold">Correct! You know your box office!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      <span className="font-semibold">Not quite! The numbers don't lie.</span>
                    </>
                  )}
                </div>
                <Button size="lg" onClick={handleNext} data-testid="button-next">
                  {gameState.currentRound >= TOTAL_ROUNDS ? "See Final Results" : "Next Round"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
