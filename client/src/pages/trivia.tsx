import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Clapperboard, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RotateCcw,
  Sparkles,
  Loader2,
  Lightbulb,
  Film
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FirebaseQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  wrongAnswer1: string;
  wrongAnswer2: string;
  wrongAnswer3: string;
  category: string;
  difficulty: string;
  hint: string | null;
  movieTitle: string | null;
}

interface GameState {
  currentQuestion: number;
  score: number;
  answered: boolean;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  gameOver: boolean;
  shuffledAnswers: string[];
  showHint: boolean;
  hintsUsed: number;
}

function shuffleAnswers(question: FirebaseQuestion): string[] {
  const answers = [
    question.correctAnswer,
    question.wrongAnswer1,
    question.wrongAnswer2,
    question.wrongAnswer3,
  ];
  return answers.sort(() => Math.random() - 0.5);
}

export default function Trivia() {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
    isCorrect: null,
    gameOver: false,
    shuffledAnswers: [],
    showHint: false,
    hintsUsed: 0,
  });

  const { data: questions, isLoading, error, refetch } = useQuery<FirebaseQuestion[]>({
    queryKey: ["/api/trivia/questions"],
  });

  const saveGameMutation = useMutation({
    mutationFn: async (data: { gameType: string; score: number; totalQuestions: number }) => {
      return apiRequest("POST", "/api/games", data);
    },
  });

  useEffect(() => {
    if (questions && questions.length > 0 && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        shuffledAnswers: shuffleAnswers(questions[prev.currentQuestion]),
      }));
    }
  }, [questions, gameState.currentQuestion, gameState.gameOver]);

  const currentQ = questions?.[gameState.currentQuestion];
  const totalQuestions = questions?.length || 10;

  const handleAnswer = (answer: string) => {
    if (gameState.answered || !currentQ) return;

    const isCorrect = answer === currentQ.correctAnswer;
    setGameState(prev => ({
      ...prev,
      answered: true,
      selectedAnswer: answer,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const handleNext = () => {
    if (gameState.currentQuestion >= totalQuestions - 1) {
      setGameState(prev => ({ ...prev, gameOver: true }));
      saveGameMutation.mutate({
        gameType: "trivia",
        score: gameState.score + (gameState.isCorrect ? 0 : 0),
        totalQuestions,
      });
    } else {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
        showHint: false,
      }));
    }
  };

  const handleRestart = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
      isCorrect: null,
      gameOver: false,
      shuffledAnswers: [],
      showHint: false,
      hintsUsed: 0,
    });
    refetch();
  };

  const toggleHint = () => {
    if (!gameState.showHint && !gameState.answered) {
      setGameState(prev => ({
        ...prev,
        showHint: true,
        hintsUsed: prev.hintsUsed + 1,
      }));
    }
  };

  const getButtonVariant = (answer: string) => {
    if (!gameState.answered) return "outline";
    if (answer === currentQ?.correctAnswer) return "default";
    if (answer === gameState.selectedAnswer && !gameState.isCorrect) return "destructive";
    return "outline";
  };

  const progressPercent = ((gameState.currentQuestion + 1) / totalQuestions) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading trivia questions...</p>
        </div>
      </div>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't load the trivia questions. Please try again later.
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
    const percentage = Math.round((gameState.score / totalQuestions) * 100);
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Clapperboard className="h-5 w-5 text-primary" />
                <span className="font-semibold">Trivia Quiz</span>
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
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold font-serif mb-2">Game Over!</h2>
                <p className="text-muted-foreground mb-6">You've completed the trivia challenge</p>
                
                <div className="bg-muted rounded-md p-6 mb-6">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {gameState.score}/{totalQuestions}
                  </div>
                  <p className="text-muted-foreground">
                    {percentage}% correct
                  </p>
                  {gameState.hintsUsed > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Lightbulb className="h-3 w-3 inline mr-1" />
                      {gameState.hintsUsed} hint{gameState.hintsUsed > 1 ? "s" : ""} used
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-4">
                    {percentage >= 80 ? (
                      <>
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-accent">Excellent!</span>
                      </>
                    ) : percentage >= 60 ? (
                      <span className="text-sm font-medium text-muted-foreground">Good job!</span>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">Keep practicing!</span>
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-primary" />
              <span className="font-semibold">Trivia Quiz</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="font-semibold" data-testid="text-score">{gameState.score}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {gameState.currentQuestion + 1} of {totalQuestions}
            </span>
            {currentQ?.movieTitle && (
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {currentQ.movieTitle}
              </span>
            )}
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={gameState.currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <Badge 
                    variant={currentQ?.difficulty === "hard" ? "destructive" : currentQ?.difficulty === "medium" ? "secondary" : "outline"}
                  >
                    {currentQ?.difficulty}
                  </Badge>
                  {currentQ?.movieTitle && (
                    <Badge variant="outline">
                      <Film className="h-3 w-3 mr-1" />
                      {currentQ.movieTitle}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-serif leading-relaxed" data-testid="text-question">
                  {currentQ?.question}
                </CardTitle>
                {currentQ?.hint && !gameState.answered && (
                  <div className="mt-3">
                    {gameState.showHint ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded-md p-3"
                      >
                        <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                        <span>{currentQ.hint}</span>
                      </motion.div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleHint}
                        className="text-muted-foreground"
                        data-testid="button-hint"
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        Show Hint
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-3">
              {gameState.shuffledAnswers.map((answer, index) => (
                <Button
                  key={index}
                  variant={getButtonVariant(answer)}
                  className={`h-auto py-4 px-6 text-left justify-start whitespace-normal ${
                    gameState.answered && answer === currentQ?.correctAnswer
                      ? "bg-green-500 hover:bg-green-500 text-white border-green-500"
                      : ""
                  }`}
                  onClick={() => handleAnswer(answer)}
                  disabled={gameState.answered}
                  data-testid={`button-answer-${index}`}
                >
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 text-sm font-medium shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{answer}</span>
                  {gameState.answered && answer === currentQ?.correctAnswer && (
                    <CheckCircle2 className="h-5 w-5 ml-2 shrink-0" />
                  )}
                  {gameState.answered && answer === gameState.selectedAnswer && !gameState.isCorrect && (
                    <XCircle className="h-5 w-5 ml-2 shrink-0" />
                  )}
                </Button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {gameState.answered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className={gameState.isCorrect ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {gameState.isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                  <span className="font-medium">
                    {gameState.isCorrect ? "Correct!" : "Incorrect!"}
                  </span>
                </div>
                <Button onClick={handleNext} data-testid="button-next">
                  {gameState.currentQuestion >= totalQuestions - 1 ? "See Results" : "Next Question"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
