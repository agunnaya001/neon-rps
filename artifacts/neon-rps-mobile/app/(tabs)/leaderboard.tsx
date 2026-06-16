import { useGetLeaderboard } from "@workspace/api-client-react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Period = "all-time" | "monthly" | "weekly";

const PERIODS: { id: Period; label: string }[] = [
  { id: "all-time", label: "All Time" },
  { id: "monthly", label: "Monthly" },
  { id: "weekly", label: "Weekly" },
];

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function truncate(addr: string | null | undefined): string {
  if (!addr) return "Anonymous";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>("all-time");
  const { data, isLoading, refetch } = useGetLeaderboard({ period });

  const entries = data?.data ?? [];
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const s = styles(colors);

  const handlePeriod = (p: Period) => {
    Haptics.selectionAsync();
    setPeriod(p);
  };

  return (
    <View style={[s.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Leaderboard</Text>
        <Pressable onPress={() => refetch()} style={s.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Period tabs */}
      <View style={s.periodRow}>
        {PERIODS.map((p) => (
          <Pressable
            key={p.id}
            style={[s.periodBtn, period === p.id && s.periodBtnActive]}
            onPress={() => handlePeriod(p.id)}
          >
            <Text
              style={[
                s.periodText,
                period === p.id && s.periodTextActive,
              ]}
            >
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.border} />
          <Text style={s.emptyTitle}>No players yet</Text>
          <Text style={s.emptySub}>Be the first to make the board!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!entries.length}
          renderItem={({ item, index }) => (
            <View
              style={[
                s.row,
                index < 3 && { borderColor: RANK_COLORS[index] + "55" },
              ]}
            >
              {/* Rank */}
              <View style={s.rankWrap}>
                {index < 3 ? (
                  <Ionicons
                    name="medal"
                    size={22}
                    color={RANK_COLORS[index]}
                  />
                ) : (
                  <Text style={s.rankNum}>#{item.rank}</Text>
                )}
              </View>

              {/* Address */}
              <View style={s.addrWrap}>
                <Text style={s.addr}>{truncate(item.walletAddress)}</Text>
                <Text style={s.wins}>{item.totalWins} wins</Text>
              </View>

              {/* Earnings */}
              <Text style={s.earnings}>
                {parseFloat(item.totalWinnings).toFixed(4)} ETH
              </Text>
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
    refreshBtn: { padding: 4 },
    periodRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 16,
    },
    periodBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    periodBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    periodText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
    },
    periodTextActive: { color: colors.primaryForeground },
    loader: { flex: 1, alignItems: "center", justifyContent: "center" },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    emptySub: { fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 8,
      gap: 12,
    },
    rankWrap: { width: 32, alignItems: "center" },
    rankNum: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
    },
    addrWrap: { flex: 1 },
    addr: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },
    wins: { fontSize: 12, color: colors.primary, marginTop: 2 },
    earnings: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.secondary,
    },
  });
