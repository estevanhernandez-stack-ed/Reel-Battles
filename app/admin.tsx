import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, ActivityIndicator, TextInput, Alert, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../mobile/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch, apiPost } from "../mobile/constants/api";

type AdminTab = "overview" | "questions" | "movies" | "athletes";

export default function AdminScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [movieForm, setMovieForm] = useState({ title: "", year: "", genre: "", openingWeekend: "", director: "" });
  const [athleteForm, setAthleteForm] = useState({ name: "", movie: "", movieYear: "", sport: "", actor: "", archetype: "captain" });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [triviaStats, moviesData, athletesData] = await Promise.all([
        apiFetch<any>("/api/trivia/stats"),
        apiFetch<any[]>("/api/movies"),
        apiFetch<any[]>("/api/athletes"),
      ]);
      setStats(triviaStats);
      setMovies(moviesData);
      setAthletes(athletesData);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const handleAddMovie = async () => {
    if (!movieForm.title || !movieForm.year || !movieForm.genre || !movieForm.openingWeekend) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/admin/movies", {
        title: movieForm.title,
        year: parseInt(movieForm.year),
        genre: movieForm.genre,
        openingWeekend: parseInt(movieForm.openingWeekend),
        director: movieForm.director || null,
      });
      setMovieForm({ title: "", year: "", genre: "", openingWeekend: "", director: "" });
      setShowAddMovie(false);
      loadData();
      Alert.alert("Success", "Movie added successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to add movie");
    }
    setSaving(false);
  };

  const handleAddAthlete = async () => {
    if (!athleteForm.name || !athleteForm.movie || !athleteForm.movieYear || !athleteForm.sport || !athleteForm.actor) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await apiPost("/api/admin/athletes", {
        name: athleteForm.name,
        movie: athleteForm.movie,
        movieYear: parseInt(athleteForm.movieYear),
        sport: athleteForm.sport,
        actor: athleteForm.actor,
        archetype: athleteForm.archetype,
      });
      setAthleteForm({ name: "", movie: "", movieYear: "", sport: "", actor: "", archetype: "captain" });
      setShowAddAthlete(false);
      loadData();
      Alert.alert("Success", "Athlete added successfully!");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to add athlete");
    }
    setSaving(false);
  };

  const handleDeleteMovie = (id: string, title: string) => {
    Alert.alert("Delete Movie", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/admin/movies/${id}`, { method: "DELETE" });
            loadData();
          } catch (e: any) { Alert.alert("Error", e.message); }
        },
      },
    ]);
  };

  const handleDeleteAthlete = (id: string, name: string) => {
    Alert.alert("Delete Athlete", `Are you sure you want to delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/admin/athletes/${id}`, { method: "DELETE" });
            loadData();
          } catch (e: any) { Alert.alert("Error", e.message); }
        },
      },
    ]);
  };

  const tabs: { key: AdminTab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "grid" },
    { key: "questions", label: "Questions", icon: "help-circle" },
    { key: "movies", label: "Movies", icon: "film" },
    { key: "athletes", label: "Athletes", icon: "people" },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading admin data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Ionicons name="settings" size={22} color={colors.primary} />
        <Text style={[styles.pageTitle, { color: colors.text }]}>Admin</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? colors.primary : colors.textTertiary} />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.primary : colors.textTertiary }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {activeTab === "overview" && (
          <View style={styles.overviewGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="help-circle" size={28} color="#ef4444" />
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.totalQuestions?.toLocaleString() || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Questions</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="film" size={28} color="#f59e0b" />
              <Text style={[styles.statNumber, { color: colors.text }]}>{movies.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Movies</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="people" size={28} color="#10b981" />
              <Text style={[styles.statNumber, { color: colors.text }]}>{athletes.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Athletes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="server" size={28} color="#8b5cf6" />
              <Text style={[styles.statNumber, { color: colors.text }]}>PostgreSQL</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Database</Text>
            </View>
          </View>
        )}

        {activeTab === "questions" && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="information-circle" size={24} color={colors.accent} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {stats?.totalQuestions?.toLocaleString() || 0} trivia questions in the database. Questions are served randomly for each game session.
            </Text>
          </View>
        )}

        {activeTab === "movies" && (
          <>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddMovie(!showAddMovie)}
            >
              <Ionicons name={showAddMovie ? "close" : "add"} size={20} color={colors.primaryForeground} />
              <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>
                {showAddMovie ? "Cancel" : "Add Movie"}
              </Text>
            </TouchableOpacity>

            {showAddMovie && (
              <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Title *" placeholderTextColor={colors.textTertiary} value={movieForm.title} onChangeText={(t) => setMovieForm({ ...movieForm, title: t })} />
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Year *" placeholderTextColor={colors.textTertiary} value={movieForm.year} onChangeText={(t) => setMovieForm({ ...movieForm, year: t })} keyboardType="numeric" />
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Genre *" placeholderTextColor={colors.textTertiary} value={movieForm.genre} onChangeText={(t) => setMovieForm({ ...movieForm, genre: t })} />
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Opening Weekend $ *" placeholderTextColor={colors.textTertiary} value={movieForm.openingWeekend} onChangeText={(t) => setMovieForm({ ...movieForm, openingWeekend: t })} keyboardType="numeric" />
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Director" placeholderTextColor={colors.textTertiary} value={movieForm.director} onChangeText={(t) => setMovieForm({ ...movieForm, director: t })} />
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]} onPress={handleAddMovie} disabled={saving}>
                  {saving ? <ActivityIndicator color={colors.primaryForeground} size="small" /> : <Ionicons name="checkmark" size={18} color={colors.primaryForeground} />}
                  <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>Save Movie</Text>
                </TouchableOpacity>
              </View>
            )}

            {movies.map((movie) => (
              <View key={movie.id} style={[styles.listRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.listInfo}>
                  <Text style={[styles.listTitle, { color: colors.text }]}>{movie.title}</Text>
                  <Text style={[styles.listSub, { color: colors.textTertiary }]}>{movie.year} - {movie.genre}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteMovie(movie.id, movie.title)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {activeTab === "athletes" && (
          <>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddAthlete(!showAddAthlete)}
            >
              <Ionicons name={showAddAthlete ? "close" : "add"} size={20} color={colors.primaryForeground} />
              <Text style={[styles.addButtonText, { color: colors.primaryForeground }]}>
                {showAddAthlete ? "Cancel" : "Add Athlete"}
              </Text>
            </TouchableOpacity>

            {showAddAthlete && (
              <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Character Name *" placeholderTextColor={colors.textTertiary} value={athleteForm.name} onChangeText={(t) => setAthleteForm({ ...athleteForm, name: t })} />
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Movie *" placeholderTextColor={colors.textTertiary} value={athleteForm.movie} onChangeText={(t) => setAthleteForm({ ...athleteForm, movie: t })} />
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Movie Year *" placeholderTextColor={colors.textTertiary} value={athleteForm.movieYear} onChangeText={(t) => setAthleteForm({ ...athleteForm, movieYear: t })} keyboardType="numeric" />
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Sport *" placeholderTextColor={colors.textTertiary} value={athleteForm.sport} onChangeText={(t) => setAthleteForm({ ...athleteForm, sport: t })} />
                <TextInput style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]} placeholder="Actor *" placeholderTextColor={colors.textTertiary} value={athleteForm.actor} onChangeText={(t) => setAthleteForm({ ...athleteForm, actor: t })} />
                <View style={styles.archetypeRow}>
                  {["captain", "natural", "underdog", "veteran", "villain", "teammate", "wildcard"].map((arch) => (
                    <TouchableOpacity
                      key={arch}
                      style={[styles.archetypeChip, { backgroundColor: athleteForm.archetype === arch ? colors.primary : colors.surfaceVariant }]}
                      onPress={() => setAthleteForm({ ...athleteForm, archetype: arch })}
                    >
                      <Text style={[styles.archetypeChipText, { color: athleteForm.archetype === arch ? colors.primaryForeground : colors.textSecondary }]}>
                        {arch}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]} onPress={handleAddAthlete} disabled={saving}>
                  {saving ? <ActivityIndicator color={colors.primaryForeground} size="small" /> : <Ionicons name="checkmark" size={18} color={colors.primaryForeground} />}
                  <Text style={[styles.saveButtonText, { color: colors.primaryForeground }]}>Save Athlete</Text>
                </TouchableOpacity>
              </View>
            )}

            {athletes.map((athlete) => (
              <View key={athlete.id} style={[styles.listRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.listInfo}>
                  <Text style={[styles.listTitle, { color: colors.text }]}>{athlete.name}</Text>
                  <Text style={[styles.listSub, { color: colors.textTertiary }]}>{athlete.movie} - {athlete.archetype}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteAthlete(athlete.id, athlete.name)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg },
  loadingText: { fontSize: FontSize.md },
  header: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  pageTitle: { fontSize: FontSize.xxl, fontWeight: "800" },
  tabBar: { borderBottomWidth: 1, paddingHorizontal: Spacing.md, flexGrow: 0 },
  tab: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  tabText: { fontSize: FontSize.sm, fontWeight: "600" },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  overviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  statCard: { width: "47%", alignItems: "center", padding: Spacing.xl, borderRadius: BorderRadius.lg, borderWidth: 1, gap: Spacing.sm },
  statNumber: { fontSize: FontSize.xl, fontWeight: "800" },
  statLabel: { fontSize: FontSize.xs, fontWeight: "600" },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1 },
  infoText: { flex: 1, fontSize: FontSize.sm, lineHeight: 20 },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.lg },
  addButtonText: { fontSize: FontSize.md, fontWeight: "700" },
  formCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSize.md },
  archetypeRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  archetypeChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  archetypeChipText: { fontSize: FontSize.xs, fontWeight: "600", textTransform: "capitalize" },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  saveButtonText: { fontSize: FontSize.md, fontWeight: "700" },
  listRow: { flexDirection: "row", alignItems: "center", padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.sm },
  listInfo: { flex: 1 },
  listTitle: { fontSize: FontSize.sm, fontWeight: "600" },
  listSub: { fontSize: FontSize.xs },
  deleteButton: { padding: Spacing.sm },
});
