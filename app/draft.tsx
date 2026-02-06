import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, Share } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../mobile/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, apiPost } from "../mobile/constants/api";
import { useProfile } from "../mobile/hooks/useProfile";
import * as Haptics from "expo-haptics";

interface MovieAthlete {
  id: string;
  name: string;
  movie: string;
  movieYear: number;
  sport: string;
  actor: string;
  archetype: string;
  bio: string | null;
  quote: string | null;
  athleticism: number;
  clutch: number;
  leadership: number;
  heart: number;
  skill: number;
  intimidation: number;
  teamwork: number;
  charisma: number;
  wildcardName: string | null;
  wildcardCategory: string | null;
  wildcardValue: number | null;
}

const ARCHETYPES_ORDER = ["captain", "natural", "underdog", "veteran", "villain", "teammate", "wildcard"];
const ARCHETYPE_COLORS: Record<string, string> = {
  captain: "#4f46e5", natural: "#16a34a", underdog: "#d97706", veteran: "#7c3aed",
  villain: "#dc2626", teammate: "#0891b2", wildcard: "#db2777",
};
const ARCHETYPE_LABELS: Record<string, string> = {
  captain: "Captains", natural: "Naturals", underdog: "Underdogs", veteran: "Veterans",
  villain: "Villains", teammate: "Teammates", wildcard: "Wildcards",
};
const TEAM_SIZE = 5;

export default function DraftScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { profileId } = useProfile();

  const [allAthletes, setAllAthletes] = useState<MovieAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"draft" | "battle" | "results">("draft");
  const [currentRound, setCurrentRound] = useState(0);
  const [playerTeam, setPlayerTeam] = useState<MovieAthlete[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<MovieAthlete[]>([]);
  const [availablePool, setAvailablePool] = useState<MovieAthlete[]>([]);
  const [battleResult, setBattleResult] = useState<any>(null);
  const [battling, setBattling] = useState(false);

  const loadAthletes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<MovieAthlete[]>("/api/athletes");
      setAllAthletes(data);
      setAvailablePool([...data].sort(() => Math.random() - 0.5));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadAthletes(); }, [loadAthletes]);

  const currentArchetype = ARCHETYPES_ORDER[currentRound % ARCHETYPES_ORDER.length];
  const archetypeColor = ARCHETYPE_COLORS[currentArchetype] || colors.primary;

  const getAvailableForRound = () => {
    const pool = availablePool.filter(a => a.archetype === currentArchetype);
    return pool.length >= 2 ? pool : availablePool.slice(0, 6);
  };

  const handleDraftPick = (athlete: MovieAthlete) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const available = getAvailableForRound();
    const remaining = available.filter(a => a.id !== athlete.id);
    const opponentPick = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : null;

    const newPlayerTeam = [...playerTeam, athlete];
    const newOpponentTeam = opponentPick ? [...opponentTeam, opponentPick] : opponentTeam;
    const newPool = availablePool.filter(a => a.id !== athlete.id && (opponentPick ? a.id !== opponentPick.id : true));

    setPlayerTeam(newPlayerTeam);
    setOpponentTeam(newOpponentTeam);
    setAvailablePool(newPool);
    setCurrentRound(currentRound + 1);

    if (newPlayerTeam.length >= TEAM_SIZE) setPhase("battle");
  };

  const handleStartBattle = async () => {
    setBattling(true);
    try {
      const result = await apiPost<any>("/api/athletes/battle", { playerTeam, opponentTeam });
      setBattleResult(result);
      setPhase("results");
      const won = result.winner === "player" ? 1 : 0;
      if (result.winner === "player") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
      apiPost("/api/games", { profileId: profileId || undefined, gameType: "draft", score: won, totalQuestions: 1 }).catch(() => {});
    } catch (e) { console.error(e); }
    setBattling(false);
  };

  const handleRestart = () => {
    setPhase("draft");
    setCurrentRound(0);
    setPlayerTeam([]);
    setOpponentTeam([]);
    setBattleResult(null);
    setAvailablePool([...allAthletes].sort(() => Math.random() - 0.5));
  };

  const handleShare = async () => {
    if (!battleResult) return;
    const playerWon = battleResult.winner === "player";
    const msg = `CineGame Movie Draft\n${playerWon ? "Victory!" : "Defeat"} ${battleResult.playerScore} vs ${battleResult.opponentScore}\nMy team: ${playerTeam.map(a => a.name).join(", ")}\nThink you can draft better?`;
    try { await Share.share({ message: msg }); } catch (e) {}
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading movie athletes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "results" && battleResult) {
    const playerWon = battleResult.winner === "player";
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.resultsContainer}>
            <View style={[styles.trophyCircle, { backgroundColor: playerWon ? "#f59e0b" : "#6b7280" }]}>
              <Ionicons name={playerWon ? "trophy" : "shield"} size={44} color="#ffffff" />
            </View>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              {playerWon ? "Victory!" : battleResult.winner === "tie" ? "It's a Tie!" : "Defeat"}
            </Text>
            <Text style={[styles.resultsSubtitle, { color: colors.textSecondary }]}>
              {playerWon ? "Your team dominated!" : battleResult.winner === "tie" ? "Both teams matched evenly!" : "The opponent was stronger."}
            </Text>

            <View style={styles.scoreCompare}>
              <View style={[styles.scoreColumn, playerWon ? { backgroundColor: "#16a34a15", borderColor: "#16a34a40" } : { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Your Team</Text>
                <Text style={[styles.scoreLarge, { color: colors.primary }]}>{battleResult.playerScore}</Text>
              </View>
              <View style={[styles.scoreColumn, !playerWon && battleResult.winner !== "tie" ? { backgroundColor: "#dc262615", borderColor: "#dc262640" } : { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Opponent</Text>
                <Text style={[styles.scoreLarge, { color: colors.text }]}>{battleResult.opponentScore}</Text>
              </View>
            </View>

            <View style={styles.breakdownSection}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>Your Lineup</Text>
              {battleResult.playerBreakdown.map((p: any, i: number) => (
                <View key={i} style={[styles.breakdownRow, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[styles.breakdownName, { color: colors.text }]}>{p.name}</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.scoreBadgeText, { color: colors.textSecondary }]}>{p.score}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.breakdownSection}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>Opponent Lineup</Text>
              {battleResult.opponentBreakdown.map((p: any, i: number) => (
                <View key={i} style={[styles.breakdownRow, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[styles.breakdownName, { color: colors.text }]}>{p.name}</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.scoreBadgeText, { color: colors.textSecondary }]}>{p.score}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.outlineButton, { borderColor: colors.border }]} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={18} color={colors.text} />
                <Text style={[styles.outlineButtonText, { color: colors.text }]}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareButton, { backgroundColor: colors.surfaceVariant }]} onPress={handleShare}>
                <Ionicons name="share-outline" size={18} color={colors.text} />
                <Text style={[styles.outlineButtonText, { color: colors.text }]}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleRestart}>
                <Ionicons name="refresh" size={18} color={colors.primaryForeground} />
                <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (phase === "battle") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Ionicons name="flash" size={18} color={colors.primary} />
            <Text style={[styles.topBarTitle, { color: colors.text }]}>Ready for Battle!</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Teams Assembled!</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Review your lineup and start the battle</Text>

          <Text style={[styles.teamLabel, { color: colors.text }]}>Your Team</Text>
          {playerTeam.map((a) => (
            <View key={a.id} style={[styles.teamRow, { backgroundColor: colors.surfaceVariant }]}>
              <View style={[styles.athleteAvatar, { backgroundColor: ARCHETYPE_COLORS[a.archetype] }]}>
                <Ionicons name="person" size={18} color="#fff" />
              </View>
              <View style={styles.athleteInfo}>
                <Text style={[styles.athleteName, { color: colors.text }]}>{a.name}</Text>
                <Text style={[styles.athleteMovie, { color: colors.textTertiary }]}>{a.movie} ({a.movieYear})</Text>
              </View>
              <View style={[styles.archetypeBadge, { borderColor: colors.border }]}>
                <Text style={[styles.archetypeBadgeText, { color: colors.textSecondary }]}>{a.archetype}</Text>
              </View>
            </View>
          ))}

          <Text style={[styles.teamLabel, { color: colors.text, marginTop: Spacing.xl }]}>Opponent Team</Text>
          {opponentTeam.map((a) => (
            <View key={a.id} style={[styles.teamRow, { backgroundColor: colors.surfaceVariant }]}>
              <View style={[styles.athleteAvatar, { backgroundColor: ARCHETYPE_COLORS[a.archetype] }]}>
                <Ionicons name="person" size={18} color="#fff" />
              </View>
              <View style={styles.athleteInfo}>
                <Text style={[styles.athleteName, { color: colors.text }]}>{a.name}</Text>
                <Text style={[styles.athleteMovie, { color: colors.textTertiary }]}>{a.movie} ({a.movieYear})</Text>
              </View>
              <View style={[styles.archetypeBadge, { borderColor: colors.border }]}>
                <Text style={[styles.archetypeBadgeText, { color: colors.textSecondary }]}>{a.archetype}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.battleButton, { backgroundColor: colors.primary, opacity: battling ? 0.6 : 1 }]}
            onPress={handleStartBattle}
            disabled={battling}
          >
            {battling ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Ionicons name="flash" size={22} color={colors.primaryForeground} />
            )}
            <Text style={[styles.battleButtonText, { color: colors.primaryForeground }]}>Start Battle!</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const availableAthletes = getAvailableForRound().slice(0, 6);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Ionicons name="flash" size={18} color={colors.primary} />
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Movie Draft</Text>
        </View>
        <View style={[styles.scorePill, { backgroundColor: colors.surfaceVariant }]}>
          <Ionicons name="people" size={14} color={colors.accent} />
          <Text style={[styles.scoreText, { color: colors.text }]}>{playerTeam.length}/{TEAM_SIZE}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.draftHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Draft Your Team</Text>
          <View style={[styles.roundBadge, { backgroundColor: archetypeColor }]}>
            <Text style={styles.roundBadgeText}>{ARCHETYPE_LABELS[currentArchetype]} Round</Text>
          </View>
        </View>

        {playerTeam.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickedRow}>
            {playerTeam.map((a) => (
              <View key={a.id} style={[styles.pickedChip, { backgroundColor: colors.surfaceVariant }]}>
                <Text style={[styles.pickedChipText, { color: colors.text }]}>{a.name}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.athleteGrid}>
          {availableAthletes.map((athlete) => (
            <TouchableOpacity
              key={athlete.id}
              style={[styles.athleteCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => handleDraftPick(athlete)}
              activeOpacity={0.7}
            >
              <View style={styles.athleteCardHeader}>
                <View style={[styles.athleteAvatar, { backgroundColor: ARCHETYPE_COLORS[athlete.archetype] }]}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
                <View style={styles.athleteCardInfo}>
                  <Text style={[styles.athleteName, { color: colors.text }]} numberOfLines={1}>{athlete.name}</Text>
                  <Text style={[styles.athleteActor, { color: colors.textTertiary }]} numberOfLines={1}>{athlete.actor}</Text>
                </View>
              </View>
              <View style={styles.athleteCardMeta}>
                <View style={[styles.movieBadge, { borderColor: colors.border }]}>
                  <Ionicons name="film-outline" size={11} color={colors.textSecondary} />
                  <Text style={[styles.movieBadgeText, { color: colors.textSecondary }]} numberOfLines={1}>{athlete.movie}</Text>
                </View>
                <View style={[styles.sportBadge, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[styles.sportBadgeText, { color: colors.textSecondary }]}>{athlete.sport}</Text>
                </View>
              </View>
              {athlete.bio && (
                <Text style={[styles.athleteBio, { color: colors.textSecondary }]} numberOfLines={2}>{athlete.bio}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerNote}>
          <Ionicons name="sparkles" size={14} color={colors.textTertiary} />
          <Text style={[styles.footerNoteText, { color: colors.textTertiary }]}>Stats are hidden until the battle!</Text>
        </View>
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
  draftHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg, gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.xxl, fontWeight: "800" },
  sectionSubtitle: { fontSize: FontSize.md, marginBottom: Spacing.lg },
  roundBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  roundBadgeText: { color: "#fff", fontWeight: "700", fontSize: FontSize.sm },
  pickedRow: { marginBottom: Spacing.lg },
  pickedChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginRight: Spacing.sm },
  pickedChipText: { fontSize: FontSize.sm, fontWeight: "600" },
  athleteGrid: { gap: Spacing.md },
  athleteCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  athleteCardHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  athleteAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  athleteCardInfo: { flex: 1 },
  athleteName: { fontSize: FontSize.md, fontWeight: "700" },
  athleteActor: { fontSize: FontSize.sm },
  athleteMovie: { fontSize: FontSize.xs },
  athleteCardMeta: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  movieBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  movieBadgeText: { fontSize: FontSize.xs, maxWidth: 140 },
  sportBadge: { borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  sportBadgeText: { fontSize: FontSize.xs, fontWeight: "600" },
  athleteBio: { fontSize: FontSize.sm, lineHeight: 20 },
  footerNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, marginTop: Spacing.xl },
  footerNoteText: { fontSize: FontSize.sm },
  teamLabel: { fontSize: FontSize.lg, fontWeight: "700", marginBottom: Spacing.sm },
  teamRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
  athleteInfo: { flex: 1 },
  archetypeBadge: { borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  archetypeBadgeText: { fontSize: FontSize.xs, textTransform: "capitalize" },
  battleButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, marginTop: Spacing.xxl },
  battleButtonText: { fontSize: FontSize.lg, fontWeight: "700" },
  resultsContainer: { alignItems: "center", paddingTop: Spacing.xxl, gap: Spacing.sm },
  trophyCircle: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: Spacing.md },
  resultsTitle: { fontSize: FontSize.xxxl, fontWeight: "800" },
  resultsSubtitle: { fontSize: FontSize.md },
  scoreCompare: { flexDirection: "row", gap: Spacing.lg, marginTop: Spacing.xl, width: "100%" },
  scoreColumn: { flex: 1, alignItems: "center", padding: Spacing.xl, borderRadius: BorderRadius.md, borderWidth: 1 },
  scoreLabel: { fontSize: FontSize.sm, marginBottom: Spacing.xs },
  scoreLarge: { fontSize: FontSize.xxxl, fontWeight: "800" },
  breakdownSection: { width: "100%", marginTop: Spacing.xl },
  breakdownTitle: { fontSize: FontSize.md, fontWeight: "700", marginBottom: Spacing.sm },
  breakdownRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.xs },
  breakdownName: { fontSize: FontSize.sm },
  scoreBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  scoreBadgeText: { fontSize: FontSize.sm, fontWeight: "600" },
  buttonRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xxl, flexWrap: "wrap" },
  outlineButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  outlineButtonText: { fontSize: FontSize.md, fontWeight: "600" },
  shareButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  primaryButton: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  primaryButtonText: { fontSize: FontSize.md, fontWeight: "600" },
});
