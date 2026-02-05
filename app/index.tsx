import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../mobile/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + "15" }]}>
            <Ionicons name="videocam" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.appTitle, { color: colors.text }]}>CineGame</Text>
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
  heroSection: {
    alignItems: "center",
    marginBottom: Spacing.xxxl,
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
});
