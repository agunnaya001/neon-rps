import {
  useGetTournaments,
  useCreateTournament,
  getGetTournamentsQueryKey,
} from "@workspace/api-client-react";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  open: "#00ff88",
  active: "#00ccff",
  completed: "#666666",
};

const FORMATS = [
  { id: "single-elimination", label: "Single Elim" },
  { id: "double-elimination", label: "Double Elim" },
  { id: "round-robin", label: "Round Robin" },
];

export default function TournamentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data: tournaments = [], isLoading, refetch } = useGetTournaments();
  const createTournament = useCreateTournament({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetTournamentsQueryKey() });
        setShowCreate(false);
        resetForm();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
    },
  });

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState("single-elimination");
  const [maxPlayers, setMaxPlayers] = useState("8");
  const [entryFee, setEntryFee] = useState("0.01");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const s = styles(colors);

  const resetForm = () => {
    setName(""); setDescription(""); setFormat("single-elimination");
    setMaxPlayers("8"); setEntryFee("0.01");
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createTournament.mutate({
      data: {
        name: name.trim(),
        description: description.trim() || null,
        format,
        maxPlayers: parseInt(maxPlayers) || 8,
        entryFee,
      },
    });
  };

  if (showCreate) {
    return (
      <ScrollView
        style={s.container}
        contentContainerStyle={[s.content, { paddingTop: topInset + 16, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={s.backBtn} onPress={() => setShowCreate(false)}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={s.backText}>Tournaments</Text>
        </Pressable>

        <Text style={s.title}>New Tournament</Text>

        <View style={s.formCard}>
          <Text style={s.fieldLabel}>NAME</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Tournament name"
            placeholderTextColor={colors.mutedForeground}
            testID="tournament-name-input"
          />

          <Text style={[s.fieldLabel, { marginTop: 12 }]}>DESCRIPTION</Text>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            placeholderTextColor={colors.mutedForeground}
            multiline
          />

          <Text style={[s.fieldLabel, { marginTop: 12 }]}>FORMAT</Text>
          <View style={s.formatRow}>
            {FORMATS.map((f) => (
              <Pressable
                key={f.id}
                style={[s.formatBtn, format === f.id && s.formatBtnActive]}
                onPress={() => setFormat(f.id)}
              >
                <Text style={[s.formatText, format === f.id && s.formatTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={s.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>MAX PLAYERS</Text>
              <TextInput
                style={s.input}
                value={maxPlayers}
                onChangeText={setMaxPlayers}
                keyboardType="numeric"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.fieldLabel}>ENTRY FEE (ETH)</Text>
              <TextInput
                style={s.input}
                value={entryFee}
                onChangeText={setEntryFee}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
          </View>

          <Pressable
            style={[s.createBtn, createTournament.isPending && s.createBtnDisabled]}
            onPress={handleCreate}
            disabled={createTournament.isPending || !name.trim()}
          >
            {createTournament.isPending ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <>
                <Ionicons name="add-circle" size={18} color={colors.primaryForeground} />
                <Text style={s.createBtnText}>Create Tournament</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[s.container, { paddingTop: topInset }]}>
      <View style={s.header}>
        <Text style={s.title}>Tournaments</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => refetch()} style={s.iconBtn}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            style={s.addBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCreate(true);
            }}
            testID="create-tournament-btn"
          >
            <Feather name="plus" size={18} color={colors.primaryForeground} />
            <Text style={s.addBtnText}>Create</Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : tournaments.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="trophy-outline" size={48} color={colors.border} />
          <Text style={s.emptyTitle}>No tournaments yet</Text>
          <Text style={s.emptySub}>Be the first to create one!</Text>
          <Pressable style={s.createBtn} onPress={() => setShowCreate(true)}>
            <Text style={s.createBtnText}>Create Tournament</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: Platform.OS === "web" ? 118 : 100 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!tournaments.length}
          renderItem={({ item: t }) => (
            <View style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardName} numberOfLines={1}>{t.name}</Text>
                <View style={[s.statusBadge, { backgroundColor: (STATUS_COLORS[t.status] ?? "#666") + "22" }]}>
                  <Text style={[s.statusText, { color: STATUS_COLORS[t.status] ?? "#666" }]}>
                    {t.status}
                  </Text>
                </View>
              </View>

              {!!t.description && (
                <Text style={s.cardDesc} numberOfLines={2}>{t.description}</Text>
              )}

              <View style={s.statsGrid}>
                <View style={s.statItem}>
                  <Text style={s.statKey}>Format</Text>
                  <Text style={s.statVal}>{t.format.replace(/-/g, " ")}</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={s.statKey}>Players</Text>
                  <Text style={s.statVal}>{t.maxPlayers}</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={s.statKey}>Entry</Text>
                  <Text style={[s.statVal, { color: colors.primary }]}>{t.entryFee} ETH</Text>
                </View>
                <View style={s.statItem}>
                  <Text style={s.statKey}>Prize Pool</Text>
                  <Text style={[s.statVal, { color: colors.secondary }]}>{t.prizePool ?? "—"}</Text>
                </View>
              </View>

              {t.status === "open" && (
                <Pressable style={s.joinBtn}>
                  <Text style={s.joinBtnText}>Join Tournament</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    iconBtn: { padding: 4 },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: colors.radius,
    },
    addBtnText: {
      color: colors.primaryForeground,
      fontWeight: "700" as const,
      fontSize: 13,
    },
    loader: { flex: 1, alignItems: "center", justifyContent: "center" },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    emptySub: { fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
    backText: { color: colors.primary, fontWeight: "600" as const, fontSize: 15 },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: colors.primary,
      letterSpacing: 1,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.foreground,
      fontSize: 14,
    },
    formatRow: { flexDirection: "row", gap: 8 },
    formatBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    formatBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    formatText: { fontSize: 12, fontWeight: "600" as const, color: colors.mutedForeground },
    formatTextActive: { color: colors.primaryForeground },
    twoCol: { flexDirection: "row", gap: 12, marginTop: 12 },
    createBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      marginTop: 16,
    },
    createBtnDisabled: { opacity: 0.6 },
    createBtnText: {
      color: colors.primaryForeground,
      fontWeight: "700" as const,
      fontSize: 15,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 12,
      gap: 10,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardName: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusText: { fontSize: 11, fontWeight: "700" as const },
    cardDesc: { fontSize: 13, color: colors.mutedForeground, lineHeight: 18 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    statItem: {
      flex: 1,
      minWidth: "40%",
      backgroundColor: colors.background,
      borderRadius: 6,
      padding: 10,
    },
    statKey: { fontSize: 11, color: colors.mutedForeground, marginBottom: 2 },
    statVal: { fontSize: 13, fontWeight: "700" as const, color: colors.foreground },
    joinBtn: {
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      paddingVertical: 10,
      alignItems: "center",
    },
    joinBtnText: { color: colors.primaryForeground, fontWeight: "700" as const, fontSize: 14 },
  });
