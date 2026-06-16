import { useGetDailyChallenge } from "@workspace/api-client-react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function ChallengesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch } = useGetDailyChallenge();

  const challenge = data?.challenge ?? null;
  const progress = data?.progress ?? null;

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const s = styles(colors);

  const progressPct = challenge
    ? Math.min(((progress?.progress ?? 0) / challenge.target) * 100, 100)
    : 0;

  const handleClaim = async () => {
    if (!challenge) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Reward Claimed!", `You earned ${challenge.rewardAmount} ETH!`);
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        { paddingTop: topInset + 16, paddingBottom: Platform.OS === "web" ? 118 : 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Daily Challenge</Text>
        <Pressable onPress={() => refetch()} style={s.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : challenge ? (
        <View>
          {/* Challenge card */}
          <View style={s.card}>
            <View style={s.cardTop}>
              <View style={s.rewardBadge}>
                <Ionicons name="diamond" size={14} color={colors.secondary} />
                <Text style={s.rewardText}>{challenge.rewardAmount} ETH</Text>
              </View>
              <View
                style={[
                  s.statusBadge,
                  {
                    backgroundColor: progress?.completed
                      ? colors.primary + "22"
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    s.statusText,
                    { color: progress?.completed ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {progress?.completed ? "Completed" : "In Progress"}
                </Text>
              </View>
            </View>

            <Text style={s.challengeTitle}>{challenge.title}</Text>
            <Text style={s.challengeDesc}>{challenge.description}</Text>

            {/* Progress bar */}
            <View style={s.progressSection}>
              <View style={s.progressHeader}>
                <Text style={s.progressLabel}>Progress</Text>
                <Text style={s.progressCount}>
                  {progress?.progress ?? 0} / {challenge.target}
                </Text>
              </View>
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${progressPct}%` as any }]} />
              </View>
            </View>

            {/* Meta info */}
            <View style={s.metaRow}>
              <View style={s.metaItem}>
                <Text style={s.metaKey}>Requirement</Text>
                <Text style={s.metaVal}>
                  {challenge.requirement.replace(/-/g, " ")}
                </Text>
              </View>
              <View style={s.metaItem}>
                <Text style={s.metaKey}>Target</Text>
                <Text style={s.metaVal}>{challenge.target}</Text>
              </View>
            </View>
          </View>

          {/* CTA */}
          {progress?.completed ? (
            <Pressable
              style={({ pressed }) => [s.ctaBtn, { backgroundColor: colors.primary }, pressed && s.pressed]}
              onPress={handleClaim}
              testID="claim-reward-btn"
            >
              <Ionicons name="diamond" size={18} color={colors.primaryForeground} />
              <Text style={s.ctaBtnText}>Claim Reward</Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [s.ctaBtn, pressed && s.pressed]}
              onPress={() => router.push("/(tabs)/play")}
              testID="play-to-progress-btn"
            >
              <Ionicons name="flash" size={18} color={colors.primaryForeground} />
              <Text style={s.ctaBtnText}>Play to Progress</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={s.empty}>
          <Ionicons name="bolt-circle-outline" size={56} color={colors.border} />
          <Text style={s.emptyTitle}>No Challenge Today</Text>
          <Text style={s.emptySub}>Check back tomorrow for a new challenge!</Text>
          <Pressable
            style={s.ctaBtn}
            onPress={() => router.push("/(tabs)/play")}
          >
            <Text style={s.ctaBtnText}>Play Anyway</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
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
      marginBottom: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    refreshBtn: { padding: 4 },
    loader: { paddingTop: 60, alignItems: "center" },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      gap: 14,
      marginBottom: 16,
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rewardBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.secondary + "22",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    rewardText: { color: colors.secondary, fontWeight: "700" as const, fontSize: 13 },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusText: { fontSize: 12, fontWeight: "600" as const },
    challengeTitle: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    challengeDesc: { fontSize: 15, color: colors.foreground, lineHeight: 22 },
    progressSection: { gap: 8 },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLabel: { fontSize: 12, fontWeight: "700" as const, color: colors.mutedForeground },
    progressCount: { fontSize: 14, fontWeight: "700" as const, color: colors.primary },
    progressBg: {
      height: 10,
      backgroundColor: colors.background,
      borderRadius: 5,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 5,
    },
    metaRow: { flexDirection: "row", gap: 12 },
    metaItem: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
    },
    metaKey: { fontSize: 11, color: colors.mutedForeground, marginBottom: 4 },
    metaVal: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.primary,
      textTransform: "capitalize",
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: colors.radius,
      paddingVertical: 14,
      marginBottom: 12,
    },
    ctaBtnText: { color: "#ffffff", fontWeight: "700" as const, fontSize: 15 },
    pressed: { opacity: 0.85 },
    empty: {
      paddingTop: 40,
      alignItems: "center",
      gap: 12,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    emptySub: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
    },
  });
