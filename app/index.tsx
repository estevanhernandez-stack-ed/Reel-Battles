import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, TextInput, Modal, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../mobile/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfile } from "../mobile/hooks/useProfile";
import { apiFetch, apiPost } from "../mobile/constants/api";

interface DailyChallenge {
  id: string;
  challengeDate: string;
  gameType: string;
  seed: number;
  completed: boolean;
}

const gameModes = [
  {
    id: "trivia",
    title: "Trivia Quiz",
    description: "Test your movie knowledge with challenging questions across categories and difficulty levels.",
    icon: "film" as const,
    gradient: ["#ef4444", "#e11d48"],
    stats: "38K+ Questions",
    route: "/trivia" as const,
  },
  {
    id: "draft",
    title: "Movie Draft",
    description: "Draft movie characters by archetype, then battle it out War-style with weighted stats and synergy bonuses.",
    icon: "trophy" as const,
    gradient: ["#f59e0b", "#d97706"],
    stats: "Team Battle",
    route: "/draft" as const,
  },
  {
    id: "boxoffice",
    title: "Box Office Heads Up",
    description: "Which movie had the bigger opening weekend? Test your box office instincts!",
    icon: "cash" as const,
    gradient: ["#10b981", "#059669"],
    stats: "Opening Weekend",
    route: "/boxoffice" as const,
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const { profileId, username, profile, loading: profileLoading, createProfile, hasProfile, refreshProfile } = useProfile();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(true);

  useEffect(() => {
    if (!profileLoading && !hasProfile) {
      setShowProfileModal(true);
    }
  }, [profileLoading, hasProfile]);

  const loadDailyChallenge = useCallback(async () => {
    try {
      const url = profileId
        ? `/api/daily-challenge?profileId=${profileId}`
        : "/api/daily-challenge";
      const data = await apiFetch<DailyChallenge>(url);
      setDailyChallenge(data);
    } catch (e) {
      console.error(e);
    }
    setLoadingDaily(false);
  }, [profileId]);

  useEffect(() => {
    loadDailyChallenge();
  }, [loadDailyChallenge]);

  const handleCreateProfile = async () => {
    if (usernameInput.trim().length < 2) {
      setProfileError("Username must be at least 2 characters");
      return;
    }
    setCreating(true);
    setProfileError("");
    try {
      await createProfile(usernameInput.trim());
      setShowProfileModal(false);
    } catch (e: any) {
      setProfileError(e.message || "Failed to create profile");
    }
    setCreating(false);
  };

  const handleDailyChallenge = () => {
    if (dailyChallenge && !dailyChallenge.completed) {
      router.push(`/trivia?daily=true&seed=${dailyChallenge.seed}` as any);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: colors.primary + "15" }]}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Welcome to CineGame</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Choose a username to track your scores, compete on leaderboards, and earn achievements.
            </Text>
            <TextInput
              style={[styles.usernameInput, {
                backgroundColor: colors.surfaceVariant,
                color: colors.text,
                borderColor: profileError ? colors.destructive : colors.border,
              }]}
              placeholder="Enter username..."
              placeholderTextColor={colors.textTertiary}
              value={usernameInput}
              onChangeText={setUsernameInput}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            {profileError ? (
              <Text style={[styles.errorText, { color: colors.destructive }]}>{profileError}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary, opacity: creating ? 0.6 : 1 }]}
              onPress={handleCreateProfile}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <Text style={[styles.modalButtonText, { color: colors.primaryForeground }]}>Get Started</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Text style={[styles.skipText, { color: colors.textTertiary }]}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + "15" }]}>
            <Ionicons name="videocam" size={28} color={colors.primary} />
          </View>
          <View style={styles.headerRight}>
            <Text style={[styles.appTitle, { color: colors.text }]}>CineGame</Text>
            {username && (
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                Hi, {username}
              </Text>
            )}
          </View>
          {profile && profile.currentStreak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: "#f59e0b20" }]}>
              <Ionicons name="flame" size={16} color="#f59e0b" />
              <Text style={[styles.streakText, { color: "#f59e0b" }]}>{profile.currentStreak}</Text>
            </View>
          )}
        </View>

        <View style={styles.heroSection}>
          <Text style={[styles.heroLabel, { color: colors.textTertiary }]}>
            MOVIE GAMING EXPERIENCE
          </Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Test Your{" "}
            <Text style={{ color: colors.primary }}>Movie</Text>
            {" "}Knowledge
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Three game modes to challenge your inner film buff.
          </Text>
        </View>

        {dailyChallenge && (
          <TouchableOpacity
            style={[styles.dailyCard, {
              backgroundColor: dailyChallenge.completed ? colors.surfaceVariant : "#f59e0b15",
              borderColor: dailyChallenge.completed ? colors.border : "#f59e0b40",
            }]}
            onPress={handleDailyChallenge}
            disabled={dailyChallenge.completed}
            activeOpacity={0.7}
          >
            <View style={styles.dailyCardLeft}>
              <View style={[styles.dailyIconCircle, { backgroundColor: dailyChallenge.completed ? colors.muted : "#f59e0b" }]}>
                <Ionicons
                  name={dailyChallenge.completed ? "checkmark" : "calendar"}
                  size={20}
                  color={dailyChallenge.completed ? colors.textTertiary : "#fff"}
                />
              </View>
              <View style={styles.dailyInfo}>
                <Text style={[styles.dailyTitle, { color: colors.text }]}>Daily Challenge</Text>
                <Text style={[styles.dailySubtext, { color: colors.textSecondary }]}>
                  {dailyChallenge.completed ? "Completed today" : "10 trivia questions - same for everyone"}
                </Text>
              </View>
            </View>
            {!dailyChallenge.completed && (
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            )}
          </TouchableOpacity>
        )}

        <View style={styles.cardsContainer}>
          {gameModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.7}
              onPress={() => router.push(mode.route)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: mode.gradient[0] }]}>
                  <Ionicons name={mode.icon} size={26} color="#ffffff" />
                </View>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{mode.title}</Text>
                  <View style={[styles.statsBadge, { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={[styles.statsText, { color: colors.textSecondary }]}>{mode.stats}</Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                {mode.description}
              </Text>
              <View style={[styles.playButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="play" size={16} color={colors.primaryForeground} />
                <Text style={[styles.playButtonText, { color: colors.primaryForeground }]}>Play Now</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.statItem}>
            <Ionicons name="film" size={16} color={colors.primary} />
            <Text style={[styles.statItemText, { color: colors.textSecondary }]}>Thousands of movies</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={16} color={colors.accent} />
            <Text style={[styles.statItemText, { color: colors.textSecondary }]}>Track your scores</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  headerRight: {
    flex: 1,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: {
    fontSize: FontSize.xl,
    fontWeight: "800",
  },
  welcomeText: {
    fontSize: FontSize.sm,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  streakText: {
    fontSize: FontSize.md,
    fontWeight: "800",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  heroLabel: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: Spacing.sm,
    lineHeight: 44,
  },
  heroSubtitle: {
    fontSize: FontSize.md,
    textAlign: "center",
    lineHeight: 22,
  },
  dailyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  dailyCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  dailyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyInfo: {
    flex: 1,
  },
  dailyTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  dailySubtext: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  cardsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  gameCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleRow: {
    flex: 1,
    gap: Spacing.xs,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  statsBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statsText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  playButtonText: {
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statItemText: {
    fontSize: FontSize.xs,
  },
  statDivider: {
    width: 1,
    height: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxl,
  },
  modalContent: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.md,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.xxl,
    fontWeight: "800",
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  usernameInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
  errorText: {
    fontSize: FontSize.sm,
  },
  modalButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  modalButtonText: {
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  skipText: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
});
