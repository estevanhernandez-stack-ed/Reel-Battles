import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../mobile/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, apiPost } from "../mobile/constants/api";

interface Movie {
  id: string;
  title: string;
  year: number;
  posterUrl: string | null;
  openingWeekend: number;
  genre: string;
  director: string | null;
  rating: string | null;
  synopsis: string | null;
}

const TOTAL_ROUNDS = 10;

function formatMoney(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  return `$${(amount / 1_000).toFixed(0)}K`;
}

export default function BoxOfficeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [movieA, setMovieA] = useState<Movie | null>(null);
  const [movieB, setMovieB] = useState<Movie | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Movie[]>("/api/movies/random?limit=2");
      if (data.length >= 2) {
        setMovieA(data[0]);
        setMovieB(data[1]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadMovies(); }, [loadMovies]);

  const handleGuess = (selectedId: string) => {
    if (showResult || !movieA || !movieB) return;
    const aWins = movieA.openingWeekend >= movieB.openingWeekend;
    const correct = (selectedId === movieA.id && aWins) || (selectedId === movieB.id && !aWins);
    const newStreak = correct ? streak + 1 : 0;

    setSelected(selectedId);
    setShowResult(true);
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
    setStreak(newStreak);
    setBestStreak(Math.max(bestStreak, newStreak));
  };

  const handleNext = () => {
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      apiPost("/api/games", { gameType: "boxoffice", score: score, totalQuestions: TOTAL_ROUNDS }).catch(() => {});
    } else {
      setRound((r) => r + 1);
      setSelected(null);
      setShowResult(false);
      setIsCorrect(null);
      loadMovies();
    }
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setShowResult(false);
    setIsCorrect(null);
    setGameOver(false);
    loadMovies();
  };

  const progress = (round / TOTAL_ROUNDS) * 100;

  if (loading && !movieA) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading box office data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (gameOver) {
    const percentage = Math.round((score / TOTAL_ROUNDS) * 100);
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <View style={[styles.trophyCircle, { backgroundColor: "#10b981" }]}>
              <Ionicons name="trending-up" size={44} color="#ffffff" />
            </View>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>Game Complete!</Text>
            <Text style={[styles.resultsSubtitle, { color: colors.textSecondary }]}>
              You've finished all {TOTAL_ROUNDS} rounds
            </Text>
            <View style={styles.scoreCompare}>
              <View style={[styles.scoreColumn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Text style={[styles.scoreLarge, { color: colors.primary }]}>{score}/{TOTAL_ROUNDS}</Text>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Correct ({percentage}%)</Text>
              </View>
              <View style={[styles.scoreColumn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Text style={[styles.scoreLarge, { color: colors.accent }]}>{bestStreak}</Text>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Best Streak</Text>
              </View>
            </View>
            <Text style={[styles.ratingText, { color: percentage >= 80 ? colors.accent : colors.textSecondary }]}>
              {percentage >= 80 ? "Box Office Guru!" : percentage >= 60 ? "Nice work, movie mogul!" : "The box office is unpredictable!"}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.outlineButton, { borderColor: colors.border }]} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={18} color={colors.text} />
                <Text style={[styles.outlineButtonText, { color: colors.text }]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleRestart}>
                <Ionicons name="refresh" size={18} color={colors.primaryForeground} />
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const renderMovieCard = (movie: Movie | null, index: number) => {
    if (!movie) return null;
    const otherMovie = index === 0 ? movieB : movieA;
    const isWinner = otherMovie && movie.openingWeekend >= otherMovie.openingWeekend;
    const isSelected = selected === movie.id;

    return (
      <TouchableOpacity
        key={movie.id}
        style={[styles.movieCard, {
          backgroundColor: colors.card,
          borderColor: showResult && isWinner ? "#16a34a" : showResult && isSelected && !isWinner ? "#dc2626" : colors.cardBorder,
          borderWidth: showResult && (isWinner || (isSelected && !isWinner)) ? 2 : 1,
        }]}
        onPress={() => handleGuess(movie.id)}
        activeOpacity={0.7}
        disabled={showResult}
      >
        <View style={[styles.posterArea, { backgroundColor: colors.surfaceVariant }]}>
          {movie.posterUrl ? (
            <Image source={{ uri: movie.posterUrl }} style={styles.posterImage} resizeMode="cover" />
          ) : (
            <Ionicons name="film" size={40} color={colors.textTertiary} />
          )}
          {showResult && (
            <View style={[styles.resultIcon, { backgroundColor: isWinner ? "#16a34a" : colors.muted }]}>
              <Ionicons
                name={isWinner ? "chevron-up" : "chevron-down"}
                size={18}
                color={isWinner ? "#fff" : colors.textSecondary}
              />
            </View>
          )}
        </View>
        <Text style={[styles.movieTitle, { color: colors.text }]} numberOfLines={2}>{movie.title}</Text>
        <View style={styles.movieMeta}>
          <View style={[styles.yearBadge, { backgroundColor: colors.surfaceVariant }]}>
            <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
            <Text style={[styles.yearText, { color: colors.textSecondary }]}>{movie.year}</Text>
          </View>
          <View style={[styles.genreBadge, { borderColor: colors.border }]}>
            <Text style={[styles.genreText, { color: colors.textSecondary }]}>{movie.genre}</Text>
          </View>
        </View>
        {showResult && (
          <View style={[styles.revealBox, { borderTopColor: colors.border }]}>
            <Text style={[styles.revealLabel, { color: colors.textSecondary }]}>Opening Weekend</Text>
            <Text style={[styles.revealAmount, { color: isWinner ? "#16a34a" : colors.textSecondary }]}>
              {formatMoney(movie.openingWeekend)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Ionicons name="cash" size={18} color={colors.primary} />
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Box Office</Text>
        </View>
        <View style={[styles.scorePill, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="trophy" size={14} color={colors.accent} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{score}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>Round {round} of {TOTAL_ROUNDS}</Text>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>Streak: {streak}</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        <View style={styles.promptSection}>
          <Text style={[styles.promptTitle, { color: colors.text }]}>Which movie had the bigger opening weekend?</Text>
          <Text style={[styles.promptSubtitle, { color: colors.textSecondary }]}>Tap the movie you think earned more</Text>
        </View>

        <View style={styles.moviesContainer}>
          {renderMovieCard(movieA, 0)}
          {renderMovieCard(movieB, 1)}
        </View>

        {showResult && (
          <View style={[styles.resultBar, {
            backgroundColor: isCorrect ? "#16a34a10" : "#dc262610",
            borderColor: isCorrect ? "#16a34a40" : "#dc262640",
          }]}>
            <View style={styles.resultContent}>
              <Ionicons name={isCorrect ? "trending-up" : "close-circle"} size={22} color={isCorrect ? "#16a34a" : "#dc2626"} />
              <Text style={[styles.resultText, { color: isCorrect ? "#16a34a" : "#dc2626" }]}>
                {isCorrect ? "Correct!" : "Not quite!"}
              </Text>
            </View>
            <TouchableOpacity style={[styles.nextButton, { backgroundColor: colors.primary }]} onPress={handleNext}>
              <Text style={[styles.nextButtonText, { color: colors.primaryForeground }]}>
                {round >= TOTAL_ROUNDS ? "Results" : "Next"}
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
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  promptSection: { alignItems: "center", marginBottom: Spacing.xl },
  promptTitle: { fontSize: FontSize.xl, fontWeight: "700", textAlign: "center", marginBottom: Spacing.xs },
  promptSubtitle: { fontSize: FontSize.sm, textAlign: "center" },
  moviesContainer: { gap: Spacing.lg, marginBottom: Spacing.lg },
  movieCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md },
  posterArea: { height: 160, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  posterImage: { width: "100%", height: "100%" },
  resultIcon: { position: "absolute", top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  movieTitle: { fontSize: FontSize.lg, fontWeight: "700" },
  movieMeta: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  yearBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  yearText: { fontSize: FontSize.xs, fontWeight: "600" },
  genreBadge: { borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  genreText: { fontSize: FontSize.xs },
  revealBox: { borderTopWidth: 1, paddingTop: Spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  revealLabel: { fontSize: FontSize.sm },
  revealAmount: { fontSize: FontSize.xl, fontWeight: "800" },
  resultBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  resultContent: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  resultText: { fontSize: FontSize.md, fontWeight: "700" },
  nextButton: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  nextButtonText: { fontSize: FontSize.md, fontWeight: "700" },
  resultsContainer: { alignItems: "center", paddingTop: Spacing.xxl, gap: Spacing.sm },
  trophyCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  resultsTitle: { fontSize: FontSize.xxxl, fontWeight: "800" },
  resultsSubtitle: { fontSize: FontSize.md },
  scoreCompare: { flexDirection: "row", gap: Spacing.lg, marginTop: Spacing.xl, width: "100%" },
  scoreColumn: { flex: 1, alignItems: "center", padding: Spacing.xl, borderRadius: BorderRadius.md, borderWidth: 1 },
  scoreLabel: { fontSize: FontSize.sm },
  scoreLarge: { fontSize: FontSize.xxxl, fontWeight: "800" },
  ratingText: { fontSize: FontSize.md, fontWeight: "600", marginTop: Spacing.md },
  buttonRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xxl },
  outlineButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  outlineButtonText: { fontSize: FontSize.md, fontWeight: "600" },
  primaryButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  primaryButtonText: { fontSize: FontSize.md, fontWeight: "600" },
});
