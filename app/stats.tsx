import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../mobile/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch } from "../mobile/constants/api";
import { useProfile } from "../mobile/hooks/useProfile";

interface GameSession {
  id: string;
  gameType: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
}

interface LeaderboardEntry {
  profileId: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
}

interface AchievementData {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  earned: boolean;
  earnedAt: string | null;
}

const GAME_ICONS: Record<string, string> = { trivia: "film", draft: "trophy", boxoffice: "cash", daily: "calendar" };
const GAME_COLORS: Record<string, string> = { trivia: "#ef4444", draft: "#f59e0b", boxoffice: "#10b981", daily: "#8b5cf6" };
const GAME_LABELS: Record<string, string> = { trivia: "Trivia Quiz", draft: "Movie Draft", boxoffice: "Box Office", daily: "Daily Challenge" };

const ACHIEVEMENT_ICONS: Record<string, string> = {
  star: "star", flame: "flame", medal: "medal", ribbon: "ribbon",
  flash: "flash", trophy: "trophy", shield: "shield", cash: "cash",
  "trending-up": "trending-up", calendar: "calendar", flag: "flag",
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "#6366f1", trivia: "#ef4444", draft: "#f59e0b", boxoffice: "#10b981", daily: "#8b5cf6",
};

type TabView = "stats" | "leaderboard" | "achievements";

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { profileId, profile, refreshProfile } = useProfile();

  const [activeTab, setActiveTab] = useState<TabView>("stats");
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbGameType, setLbGameType] = useState("trivia");
  const [lbPeriod, setLbPeriod] = useState<"weekly" | "alltime">("alltime");
  const [lbLoading, setLbLoading] = useState(false);

  const [achievements, setAchievements] = useState<AchievementData[]>([]);
  const [achLoading, setAchLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const url = profileId ? `/api/games?profileId=${profileId}` : "/api/games";
      const data = await apiFetch<GameSession[]>(url);
      setSessions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, [profileId]);

  const loadLeaderboard = useCallback(async () => {
    setLbLoading(true);
    try {
      const data = await apiFetch<LeaderboardEntry[]>(
        `/api/leaderboard?gameType=${lbGameType}&period=${lbPeriod}&limit=20`
      );
      setLeaderboard(data);
    } catch (e) { console.error(e); }
    setLbLoading(false);
  }, [lbGameType, lbPeriod]);

  const loadAchievements = useCallback(async () => {
    setAchLoading(true);
    try {
      const url = profileId ? `/api/achievements?profileId=${profileId}` : "/api/achievements";
      const data = await apiFetch<AchievementData[]>(url);
      setAchievements(data);
    } catch (e) { console.error(e); }
    setAchLoading(false);
  }, [profileId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);
  useEffect(() => { if (activeTab === "leaderboard") loadLeaderboard(); }, [activeTab, loadLeaderboard]);
  useEffect(() => { if (activeTab === "achievements") loadAchievements(); }, [activeTab, loadAchievements]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSessions();
    refreshProfile();
    if (activeTab === "leaderboard") loadLeaderboard();
    if (activeTab === "achievements") loadAchievements();
  };

  const totalGames = sessions.length;
  const totalScore = sessions.reduce((s, g) => s + g.score, 0);
  const totalQuestions = sessions.reduce((s, g) => s + g.totalQuestions, 0);
  const overallPercent = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const renderTabs = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
      {([
        { key: "stats" as const, label: "My Stats", icon: "stats-chart" },
        { key: "leaderboard" as const, label: "Leaderboard", icon: "podium" },
        { key: "achievements" as const, label: "Badges", icon: "ribbon" },
      ]).map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabItem, activeTab === tab.key && { backgroundColor: colors.card }]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? colors.primary : colors.textTertiary} />
          <Text style={[styles.tabLabel, { color: activeTab === tab.key ? colors.text : colors.textTertiary }]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatsView = () => (
    <>
      {profile && (
        <View style={[styles.profileBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{profile.username}</Text>
            <Text style={[styles.profileStat, { color: colors.textSecondary }]}>
              {profile.totalGamesPlayed} games played
            </Text>
          </View>
          {profile.currentStreak > 0 && (
            <View style={[styles.streakPill, { backgroundColor: "#f59e0b20" }]}>
              <Ionicons name="flame" size={14} color="#f59e0b" />
              <Text style={[styles.streakNum, { color: "#f59e0b" }]}>{profile.currentStreak}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.overviewGrid}>
        <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.overviewNumber, { color: colors.primary }]}>{totalGames}</Text>
          <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Games</Text>
        </View>
        <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.overviewNumber, { color: colors.accent }]}>{overallPercent}%</Text>
          <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Accuracy</Text>
        </View>
        <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.overviewNumber, { color: colors.success }]}>{profile?.longestStreak || 0}</Text>
          <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>Best Streak</Text>
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
            </View>
          </View>
        ))
      )}
    </>
  );

  const renderLeaderboard = () => (
    <>
      <View style={styles.lbFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lbFilterRow}>
          {(["trivia", "draft", "boxoffice"] as const).map((gt) => (
            <TouchableOpacity
              key={gt}
              style={[styles.filterChip, {
                backgroundColor: lbGameType === gt ? GAME_COLORS[gt] + "20" : colors.surfaceVariant,
                borderColor: lbGameType === gt ? GAME_COLORS[gt] : colors.border,
              }]}
              onPress={() => setLbGameType(gt)}
            >
              <Ionicons name={GAME_ICONS[gt] as any} size={14} color={lbGameType === gt ? GAME_COLORS[gt] : colors.textSecondary} />
              <Text style={[styles.filterChipText, { color: lbGameType === gt ? GAME_COLORS[gt] : colors.textSecondary }]}>
                {GAME_LABELS[gt]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={[styles.periodToggle, { backgroundColor: colors.surfaceVariant }]}>
          <TouchableOpacity
            style={[styles.periodOption, lbPeriod === "weekly" && { backgroundColor: colors.card }]}
            onPress={() => setLbPeriod("weekly")}
          >
            <Text style={[styles.periodText, { color: lbPeriod === "weekly" ? colors.text : colors.textTertiary }]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodOption, lbPeriod === "alltime" && { backgroundColor: colors.card }]}
            onPress={() => setLbPeriod("alltime")}
          >
            <Text style={[styles.periodText, { color: lbPeriod === "alltime" ? colors.text : colors.textTertiary }]}>All Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      {lbLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
      ) : leaderboard.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="podium-outline" size={40} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No scores yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Play some games to appear here</Text>
        </View>
      ) : (
        leaderboard.map((entry, index) => {
          const isMe = entry.profileId === profileId;
          const medalColors = ["#f59e0b", "#9ca3af", "#b45309"];
          return (
            <View key={`${entry.profileId}-${index}`} style={[styles.lbRow, {
              backgroundColor: isMe ? colors.primary + "10" : colors.card,
              borderColor: isMe ? colors.primary + "40" : colors.cardBorder,
            }]}>
              <View style={[styles.rankCircle, {
                backgroundColor: index < 3 ? medalColors[index] : colors.surfaceVariant,
              }]}>
                <Text style={[styles.rankText, { color: index < 3 ? "#fff" : colors.textSecondary }]}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.lbInfo}>
                <Text style={[styles.lbName, { color: colors.text }]}>
                  {entry.username} {isMe ? "(You)" : ""}
                </Text>
                <Text style={[styles.lbGames, { color: colors.textTertiary }]}>
                  {entry.gamesPlayed} game{Number(entry.gamesPlayed) !== 1 ? "s" : ""}
                </Text>
              </View>
              <Text style={[styles.lbScore, { color: colors.primary }]}>{Number(entry.totalScore).toLocaleString()}</Text>
            </View>
          );
        })
      )}
    </>
  );

  const renderAchievements = () => {
    const earned = achievements.filter(a => a.earned);
    const locked = achievements.filter(a => !a.earned);
    return (
      <>
        <View style={[styles.achSummary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="ribbon" size={24} color={colors.accent} />
          <Text style={[styles.achSummaryText, { color: colors.text }]}>
            {earned.length} / {achievements.length} unlocked
          </Text>
        </View>

        {achLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
        ) : (
          <>
            {earned.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Earned</Text>
                <View style={styles.achGrid}>
                  {earned.map((a) => (
                    <View key={a.id} style={[styles.achCard, { backgroundColor: colors.card, borderColor: (CATEGORY_COLORS[a.category] || colors.primary) + "40" }]}>
                      <View style={[styles.achIconCircle, { backgroundColor: (CATEGORY_COLORS[a.category] || colors.primary) + "20" }]}>
                        <Ionicons
                          name={(ACHIEVEMENT_ICONS[a.icon] || "ribbon") as any}
                          size={22}
                          color={CATEGORY_COLORS[a.category] || colors.primary}
                        />
                      </View>
                      <Text style={[styles.achName, { color: colors.text }]} numberOfLines={1}>{a.name}</Text>
                      <Text style={[styles.achDesc, { color: colors.textSecondary }]} numberOfLines={2}>{a.description}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {locked.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>Locked</Text>
                <View style={styles.achGrid}>
                  {locked.map((a) => (
                    <View key={a.id} style={[styles.achCard, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, opacity: 0.7 }]}>
                      <View style={[styles.achIconCircle, { backgroundColor: colors.muted }]}>
                        <Ionicons name="lock-closed" size={20} color={colors.textTertiary} />
                      </View>
                      <Text style={[styles.achName, { color: colors.textTertiary }]} numberOfLines={1}>{a.name}</Text>
                      <Text style={[styles.achDesc, { color: colors.textTertiary }]} numberOfLines={2}>{a.description}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </>
    );
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
          <Text style={[styles.pageTitle, { color: colors.text }]}>Stats & Rankings</Text>
        </View>

        {renderTabs()}

        {activeTab === "stats" && renderStatsView()}
        {activeTab === "leaderboard" && renderLeaderboard()}
        {activeTab === "achievements" && renderAchievements()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg },
  loadingText: { fontSize: FontSize.md },
  loadingIndicator: { marginTop: Spacing.xxxl },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.lg },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: "800" },

  tabBar: { flexDirection: "row", borderRadius: BorderRadius.md, borderWidth: 1, padding: 3, marginBottom: Spacing.xxl, gap: 3 },
  tabItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  tabLabel: { fontSize: FontSize.xs, fontWeight: "600" },

  profileBar: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.lg, fontWeight: "700" },
  profileStat: { fontSize: FontSize.sm },
  streakPill: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  streakNum: { fontSize: FontSize.md, fontWeight: "800" },

  overviewGrid: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xxl },
  overviewCard: { flex: 1, alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
  overviewNumber: { fontSize: FontSize.xxl, fontWeight: "800", marginBottom: 2 },
  overviewLabel: { fontSize: FontSize.xs, fontWeight: "600" },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: "700", marginBottom: Spacing.md },

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

  lbFilters: { gap: Spacing.md, marginBottom: Spacing.lg },
  lbFilterRow: { marginBottom: Spacing.sm },
  filterChip: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1, marginRight: Spacing.sm },
  filterChipText: { fontSize: FontSize.sm, fontWeight: "600" },
  periodToggle: { flexDirection: "row", borderRadius: BorderRadius.md, padding: 3, gap: 3 },
  periodOption: { flex: 1, alignItems: "center", paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  periodText: { fontSize: FontSize.sm, fontWeight: "600" },

  lbRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.sm },
  rankCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: FontSize.sm, fontWeight: "800" },
  lbInfo: { flex: 1 },
  lbName: { fontSize: FontSize.md, fontWeight: "600" },
  lbGames: { fontSize: FontSize.xs },
  lbScore: { fontSize: FontSize.lg, fontWeight: "800" },

  achSummary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, marginBottom: Spacing.lg },
  achSummaryText: { fontSize: FontSize.md, fontWeight: "700" },
  achGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  achCard: { width: "47%" as any, borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, alignItems: "center", gap: Spacing.sm },
  achIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  achName: { fontSize: FontSize.sm, fontWeight: "700", textAlign: "center" },
  achDesc: { fontSize: FontSize.xs, textAlign: "center", lineHeight: 16 },
});
