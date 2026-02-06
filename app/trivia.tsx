import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, Share, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../mobile/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, apiPost } from "../mobile/constants/api";
import { useProfile } from "../mobile/hooks/useProfile";
import * as Haptics from "expo-haptics";

interface TriviaQuestion {
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

function shuffleAnswers(q: TriviaQuestion): string[] {
  return [q.correctAnswer, q.wrongAnswer1, q.wrongAnswer2, q.wrongAnswer3].sort(() => Math.random() - 0.5);
}

export default function TriviaScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profileId } = useProfile();

  const isDaily = params.daily === "true";
  const seed = params.seed as string | undefined;
  const paramTier = params.tier as string | undefined;

  const [tier, setTier] = useState<"popular" | "all">(paramTier === "all" ? "all" : "popular");
  const [started, setStarted] = useState(isDaily);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let url = seed
        ? `/api/trivia/questions?limit=10&seed=${seed}`
        : `/api/trivia/questions?limit=10&tier=${tier}`;
      const data = await apiFetch<TriviaQuestion[]>(url);
      setQuestions(data);
      if (data.length > 0) setShuffled(shuffleAnswers(data[0]));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [seed, tier]);

  useEffect(() => {
    if (started) loadQuestions();
  }, [started, loadQuestions]);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length || 10;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (answer: string) => {
    if (answered || !currentQ) return;
    const correct = answer === currentQ.correctAnswer;
    setAnswered(true);
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  const handleNext = () => {
    if (currentIndex >= totalQuestions - 1) {
      const finalScore = isCorrect ? score : score;
      setGameOver(true);
      if (isDaily && profileId) {
        apiPost("/api/daily-challenge/complete", {
          profileId,
          score: finalScore,
          totalQuestions,
        }).catch(() => {});
      } else {
        apiPost("/api/games", {
          profileId: profileId || undefined,
          gameType: "trivia",
          score: finalScore,
          totalQuestions,
        }).catch(() => {});
      }
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setAnswered(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowHint(false);
      setShuffled(shuffleAnswers(questions[nextIndex]));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameOver(false);
    setShowHint(false);
    setHintsUsed(0);
    setStarted(false);
  };

  const handleShare = async () => {
    const percentage = Math.round((score / totalQuestions) * 100);
    const stars = score >= 8 ? "***" : score >= 5 ? "**" : "*";
    const msg = isDaily
      ? `CineGame Daily Challenge ${stars}\nI scored ${score}/${totalQuestions} (${percentage}%) on today's daily trivia!\nCan you beat my score?`
      : `CineGame Trivia ${stars}\nI scored ${score}/${totalQuestions} (${percentage}%)!\nThink you know movies better?`;
    try {
      await Share.share({ message: msg });
    } catch (e) {}
  };

  const getAnswerStyle = (answer: string) => {
    if (!answered) return { bg: colors.surface, border: colors.border, text: colors.text };
    if (answer === currentQ?.correctAnswer) return { bg: "#16a34a20", border: "#16a34a", text: "#16a34a" };
    if (answer === selectedAnswer && !isCorrect) return { bg: "#dc262620", border: "#dc2626", text: "#dc2626" };
    return { bg: colors.surface, border: colors.border, text: colors.textTertiary };
  };

  if (!started && !isDaily) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.setupHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Trivia Quiz</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.setupContent}>
          <View style={[styles.setupIconCircle, { backgroundColor: "#ef4444" }]}>
            <Ionicons name="film" size={40} color="#ffffff" />
          </View>
          <Text style={[styles.setupTitle, { color: colors.text }]}>Movie Trivia</Text>
          <Text style={[styles.setupSubtitle, { color: colors.textSecondary }]}>Choose your question pool</Text>

          <TouchableOpacity
            onPress={() => setTier("popular")}
            style={[
              styles.tierOption,
              { backgroundColor: colors.surface, borderColor: tier === "popular" ? colors.primary : colors.border },
              tier === "popular" && { borderWidth: 2 },
            ]}
          >
            <View style={[styles.tierIcon, { backgroundColor: "#f59e0b" }]}>
              <Ionicons name="star" size={22} color="#ffffff" />
            </View>
            <View style={styles.tierTextContainer}>
              <Text style={[styles.tierTitle, { color: colors.text }]}>Popular Movies</Text>
              <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>Blockbusters, classics, and fan favorites</Text>
            </View>
            {tier === "popular" && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTier("all")}
            style={[
              styles.tierOption,
              { backgroundColor: colors.surface, borderColor: tier === "all" ? colors.primary : colors.border },
              tier === "all" && { borderWidth: 2 },
            ]}
          >
            <View style={[styles.tierIcon, { backgroundColor: "#8b5cf6" }]}>
              <Ionicons name="globe" size={22} color="#ffffff" />
            </View>
            <View style={styles.tierTextContainer}>
              <Text style={[styles.tierTitle, { color: colors.text }]}>All Movies</Text>
              <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>Including indie, international, and deep cuts</Text>
            </View>
            {tier === "all" && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStarted(true)}
            style={[styles.startButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="play" size={20} color="#ffffff" />
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {isDaily ? "Loading daily challenge..." : "Loading trivia questions..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (gameOver) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <View style={[styles.trophyCircle, { backgroundColor: isDaily ? "#8b5cf6" : "#f59e0b" }]}>
              <Ionicons name={isDaily ? "calendar" : "trophy"} size={44} color="#ffffff" />
            </View>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              {isDaily ? "Daily Complete!" : "Game Over!"}
            </Text>
            <Text style={[styles.resultsSubtitle, { color: colors.textSecondary }]}>
              {isDaily ? "Great job on today's challenge" : "You've completed the trivia challenge"}
            </Text>
            <View style={[styles.scoreBox, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.scoreNumber, { color: colors.primary }]}>{score}/{totalQuestions}</Text>
              <Text style={[styles.scorePercent, { color: colors.textSecondary }]}>{percentage}% correct</Text>
              {hintsUsed > 0 && (
                <Text style={[styles.hintsText, { color: colors.textTertiary }]}>
                  {hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used
                </Text>
              )}
              <Text style={[styles.ratingText, { color: percentage >= 80 ? colors.accent : colors.textSecondary }]}>
                {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep practicing!"}
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.outlineButton, { borderColor: colors.border }]}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={18} color={colors.text} />
                <Text style={[styles.outlineButtonText, { color: colors.text }]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.surfaceVariant }]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={18} color={colors.text} />
                <Text style={[styles.outlineButtonText, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
              {!isDaily && (
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                  onPress={handleRestart}
                >
                  <Ionicons name="refresh" size={18} color={colors.primaryForeground} />
                  <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Ionicons name={isDaily ? "calendar" : "film"} size={18} color={isDaily ? "#8b5cf6" : colors.primary} />
          <Text style={[styles.topBarTitle, { color: colors.text }]}>
            {isDaily ? "Daily Challenge" : "Trivia Quiz"}
          </Text>
        </View>
        <View style={[styles.scorePill, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="trophy" size={14} color={colors.accent} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              Question {currentIndex + 1} of {totalQuestions}
            </Text>
            {currentQ?.movieTitle && (
              <Text style={[styles.movieText, { color: colors.textTertiary }]} numberOfLines={1}>
                {currentQ.movieTitle}
              </Text>
            )}
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: isDaily ? "#8b5cf6" : colors.primary }]} />
          </View>
        </View>

        <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, {
              backgroundColor: currentQ?.difficulty === "hard" ? "#dc262620" : currentQ?.difficulty === "medium" ? colors.surfaceVariant : "transparent",
              borderColor: currentQ?.difficulty === "hard" ? "#dc2626" : currentQ?.difficulty === "medium" ? colors.border : colors.border,
            }]}>
              <Text style={[styles.badgeText, {
                color: currentQ?.difficulty === "hard" ? "#dc2626" : colors.textSecondary,
              }]}>{currentQ?.difficulty}</Text>
            </View>
            {currentQ?.movieTitle && (
              <View style={[styles.badge, { borderColor: colors.border }]}>
                <Ionicons name="film-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.badgeText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {currentQ.movieTitle}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.questionText, { color: colors.text }]}>{currentQ?.question}</Text>
          {currentQ?.hint && !answered && (
            showHint ? (
              <View style={[styles.hintBox, { backgroundColor: colors.surfaceVariant }]}>
                <Ionicons name="bulb" size={16} color="#f59e0b" />
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>{currentQ.hint}</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setShowHint(true); setHintsUsed((h) => h + 1); }}
                style={styles.hintButton}
              >
                <Ionicons name="bulb-outline" size={16} color={colors.textTertiary} />
                <Text style={[styles.hintButtonText, { color: colors.textTertiary }]}>Show Hint</Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.answersContainer}>
          {shuffled.map((answer, index) => {
            const style = getAnswerStyle(answer);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.answerButton, { backgroundColor: style.bg, borderColor: style.border }]}
                onPress={() => handleAnswer(answer)}
                disabled={answered}
                activeOpacity={0.7}
              >
                <View style={[styles.answerLetter, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[styles.answerLetterText, { color: colors.textSecondary }]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[styles.answerText, { color: style.text }]} numberOfLines={3}>{answer}</Text>
                {answered && answer === currentQ?.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
                )}
                {answered && answer === selectedAnswer && !isCorrect && (
                  <Ionicons name="close-circle" size={22} color="#dc2626" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {answered && (
          <View style={[styles.resultBar, {
            backgroundColor: isCorrect ? "#16a34a10" : "#dc262610",
            borderColor: isCorrect ? "#16a34a40" : "#dc262640",
          }]}>
            <View style={styles.resultContent}>
              <Ionicons
                name={isCorrect ? "checkmark-circle" : "close-circle"}
                size={24}
                color={isCorrect ? "#16a34a" : "#dc2626"}
              />
              <Text style={[styles.resultText, { color: isCorrect ? "#16a34a" : "#dc2626" }]}>
                {isCorrect ? "Correct!" : "Incorrect!"}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
            >
              <Text style={[styles.nextButtonText, { color: colors.primaryForeground }]}>
                {currentIndex >= totalQuestions - 1 ? "See Results" : "Next"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primaryForeground} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg },
  loadingText: { fontSize: FontSize.md },
  setupHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: "transparent" },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: "700", textAlign: "center" },
  setupContent: { alignItems: "center", padding: Spacing.lg, paddingTop: Spacing.xxxl },
  setupIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  setupTitle: { fontSize: FontSize.xxxl, fontWeight: "800", marginBottom: Spacing.xs },
  setupSubtitle: { fontSize: FontSize.md, marginBottom: Spacing.xxl },
  tierOption: { flexDirection: "row", alignItems: "center", gap: Spacing.md, borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, width: "100%" },
  tierIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center" },
  tierTextContainer: { flex: 1 },
  tierTitle: { fontSize: FontSize.md, fontWeight: "700" },
  tierDesc: { fontSize: FontSize.sm, marginTop: 2 },
  startButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, width: "100%", paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, marginTop: Spacing.lg },
  startButtonText: { fontSize: FontSize.md, fontWeight: "700", color: "#ffffff" },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, gap: Spacing.md },
  backButton: { padding: Spacing.xs },
  topBarCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  topBarTitle: { fontSize: FontSize.lg, fontWeight: "700" },
  scorePill: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.md },
  scoreText: { fontSize: FontSize.md, fontWeight: "700" },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  progressSection: { marginBottom: Spacing.lg },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.sm },
  progressText: { fontSize: FontSize.sm },
  movieText: { fontSize: FontSize.sm, maxWidth: 180 },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  questionCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  badgeText: { fontSize: FontSize.xs, fontWeight: "600", textTransform: "capitalize" },
  questionText: { fontSize: FontSize.lg, fontWeight: "600", lineHeight: 26 },
  hintBox: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderRadius: BorderRadius.md, padding: Spacing.md },
  hintText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },
  hintButton: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  hintButtonText: { fontSize: FontSize.sm },
  answersContainer: { gap: Spacing.md, marginBottom: Spacing.lg },
  answerButton: { flexDirection: "row", alignItems: "center", gap: Spacing.md, borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.lg },
  answerLetter: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  answerLetterText: { fontSize: FontSize.sm, fontWeight: "600" },
  answerText: { flex: 1, fontSize: FontSize.md, lineHeight: 22 },
  resultBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  resultContent: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  resultText: { fontSize: FontSize.md, fontWeight: "700" },
  nextButton: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  nextButtonText: { fontSize: FontSize.md, fontWeight: "700" },
  resultsContainer: { alignItems: "center", paddingTop: Spacing.xxxl, gap: Spacing.md },
  trophyCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  resultsTitle: { fontSize: FontSize.xxxl, fontWeight: "800" },
  resultsSubtitle: { fontSize: FontSize.md },
  scoreBox: { borderRadius: BorderRadius.lg, padding: Spacing.xxl, alignItems: "center", marginTop: Spacing.lg, marginBottom: Spacing.lg, width: "100%", gap: Spacing.xs },
  scoreNumber: { fontSize: 48, fontWeight: "800" },
  scorePercent: { fontSize: FontSize.md },
  hintsText: { fontSize: FontSize.xs },
  ratingText: { fontSize: FontSize.md, fontWeight: "600", marginTop: Spacing.sm },
  buttonRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg, flexWrap: "wrap" },
  outlineButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  outlineButtonText: { fontSize: FontSize.md, fontWeight: "600" },
  shareButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  primaryButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  primaryButtonText: { fontSize: FontSize.md, fontWeight: "600" },
});
