import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, useColorScheme, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../mobile/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch } from "../mobile/constants/api";

interface GameSession {
  id: string;
  gameType: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
}

const GAME_ICONS: Record<string, string> = {
  trivia: "film",
  draft: "trophy",
  boxoffice: "cash",
};

const GAME_COLORS: Record<string, string> = {
  trivia: "#ef4444",
  draft: "#f59e0b",
  boxoffice: "#10b981",
};

const GAME_LABELS: Record<string, string> = {
  trivia: "Trivia Quiz",
  draft: "Movie Draft",
  boxoffice: "Box Office",
};

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const data = await apiFetch<GameSession[]>("/api/games");
      setSessions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const onRefresh = () => { setRefreshing(true); loadSessions(); };

  const totalGames = sessions.length;
  const totalScore = sessions.reduce((s, g) => s + g.score, 0);
  const totalQuestions = sessions.reduce((s, g) => s + g.totalQuestions, 0);
  const overallPercent = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const triviaGames = sessions.filter(s => s.gameType === "trivia");
  const draftGames = sessions.filter(s => s.gameType === "draft");
  const boxOfficeGames = sessions.filter(s => s.gameType === "boxoffice");

  const triviaPercent = triviaGames.length > 0 ? Math.round((triviaGames.reduce((s, g) => s + g.score, 0) / triviaGames.reduce((s, g) => s + g.totalQuestions, 0)) * 100) : 0;
  const draftWins = draftGames.filter(g => g.score > 0).length;
  const boxOfficePercent = boxOfficeGames.length > 0 ? Math.round((boxOfficeGames.reduce((s, g) => s + g.score, 0) / boxOfficeGames.reduce((s, g) => s + g.totalQuestions, 0)) * 100) : 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Ionicons name="stats-chart" size={22} color={colors.primary} />
          <Text style={[styles.pageTitle, { color: colors.text }]}>Your Stats</Text>
        </View>

        <View style={styles.overviewGrid}>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.overviewNumber, { color: colors.primary }]}>{totalGames}</Text>
            <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Games Played</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.overviewNumber, { color: colors.accent }]}>{overallPercent}%</Text>
            <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Accuracy</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.overviewNumber, { color: colors.success }]}>{totalScore}</Text>
            <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Total Score</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Per Mode</Text>
        <View style={styles.modeCards}>
          <View style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modeIcon, { backgroundColor: "#ef444420" }]}>
              <Ionicons name="film" size={20} color="#ef4444" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeName, { color: colors.text }]}>Trivia Quiz</Text>
              <Text style={[styles.modeStat, { color: colors.textSecondary }]}>
                {triviaGames.length} games - {triviaPercent}% accuracy
              </Text>
            </View>
          </View>
          <View style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modeIcon, { backgroundColor: "#f59e0b20" }]}>
              <Ionicons name="trophy" size={20} color="#f59e0b" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeName, { color: colors.text }]}>Movie Draft</Text>
              <Text style={[styles.modeStat, { color: colors.textSecondary }]}>
                {draftGames.length} games - {draftWins} win{draftWins !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <View style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modeIcon, { backgroundColor: "#10b98120" }]}>
              <Ionicons name="cash" size={20} color="#10b981" />
            </View>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeName, { color: colors.text }]}>Box Office</Text>
              <Text style={[styles.modeStat, { color: colors.textSecondary }]}>
                {boxOfficeGames.length} games - {boxOfficePercent}% accuracy
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Games</Text>
        {sessions.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="game-controller-outline" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No games played yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Play a game to see your stats here</Text>
          </View>
        ) : (
          sessions.slice(0, 20).map((session) => (
            <View key={session.id} style={[styles.sessionRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.sessionIcon, { backgroundColor: (GAME_COLORS[session.gameType] || colors.primary) + "20" }]}>
                <Ionicons
                  name={(GAME_ICONS[session.gameType] || "game-controller") as any}
                  size={18}
                  color={GAME_COLORS[session.gameType] || colors.primary}
                />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionGame, { color: colors.text }]}>
                  {GAME_LABELS[session.gameType] || session.gameType}
                </Text>
                <Text style={[styles.sessionDate, { color: colors.textTertiary }]}>
                  {formatDate(session.createdAt)}
                </Text>
              </View>
              <View style={styles.sessionScoreContainer}>
                <Text style={[styles.sessionScore, { color: colors.text }]}>
                  {session.score}/{session.totalQuestions}
                </Text>
                <Text style={[styles.sessionPercent, { color: session.totalQuestions > 0 && (session.score / session.totalQuestions) >= 0.7 ? colors.success : colors.textSecondary }]}>
                  {session.totalQuestions > 0 ? Math.round((session.score / session.totalQuestions) * 100) : 0}%
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg },
  loadingText: { fontSize: FontSize.md },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.xxl },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: "800" },
  overviewGrid: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xxl },
  overviewCard: { flex: 1, alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
  overviewNumber: { fontSize: FontSize.xxl, fontWeight: "800", marginBottom: 2 },
  overviewLabel: { fontSize: FontSize.xs, fontWeight: "600" },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: "700", marginBottom: Spacing.md },
  modeCards: { gap: Spacing.sm, marginBottom: Spacing.xxl },
  modeCard: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
  modeIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center" },
  modeInfo: { flex: 1 },
  modeName: { fontSize: FontSize.md, fontWeight: "600" },
  modeStat: { fontSize: FontSize.sm },
  emptyState: { alignItems: "center", padding: Spacing.xxxl, borderRadius: BorderRadius.lg, borderWidth: 1, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.md, fontWeight: "600" },
  emptySubtext: { fontSize: FontSize.sm },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.sm },
  sessionIcon: { width: 36, height: 36, borderRadius: BorderRadius.md, alignItems: "center", justifyContent: "center" },
  sessionInfo: { flex: 1 },
  sessionGame: { fontSize: FontSize.sm, fontWeight: "600" },
  sessionDate: { fontSize: FontSize.xs },
  sessionScoreContainer: { alignItems: "flex-end" },
  sessionScore: { fontSize: FontSize.md, fontWeight: "700" },
  sessionPercent: { fontSize: FontSize.xs, fontWeight: "600" },
});
