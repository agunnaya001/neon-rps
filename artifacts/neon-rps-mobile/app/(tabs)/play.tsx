import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type GameMode = "quick" | "tournament" | "challenge" | null;
type TokenType = "eth" | "usdc";

const MODES = [
  {
    id: "quick" as GameMode,
    label: "Quick Match",
    sub: "1v1 against a random opponent",
    icon: "flash" as const,
    color: "#00ff88",
    tag1: "1v1",
    tag2: "ETH/USDC",
  },
  {
    id: "tournament" as GameMode,
    label: "Tournament",
    sub: "Join or create a bracket",
    icon: "trophy" as const,
    color: "#00ccff",
    tag1: "Multi-Round",
    tag2: "Prizes",
  },
  {
    id: "challenge" as GameMode,
    label: "Daily Challenge",
    sub: "Complete for ETH rewards",
    icon: "flash" as const,
    color: "#ff006e",
    tag1: "Daily",
    tag2: "Rewards",
  },
];

export default function PlayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [wagerAmount, setWagerAmount] = useState("0.01");
  const [wagerType, setWagerType] = useState<TokenType>("eth");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const s = styles(colors);

  const handleSelectMode = (mode: GameMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGameMode(mode);
  };

  const potentialWin = (parseFloat(wagerAmount || "0") * 1.9).toFixed(3);

  if (gameMode === null) {
    return (
      <ScrollView
        style={s.container}
        contentContainerStyle={[
          s.content,
          { paddingTop: topInset + 16, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>Choose Mode</Text>
        <Text style={s.subtitle}>Pick how you want to compete</Text>

        {MODES.map((mode) => (
          <Pressable
            key={mode.id}
            style={({ pressed }) => [
              s.modeCard,
              { borderColor: pressed ? mode.color : colors.border },
            ]}
            onPress={() => handleSelectMode(mode.id)}
            testID={`mode-${mode.id}`}
          >
            <View style={[s.modeIconWrap, { backgroundColor: mode.color + "22" }]}>
              <Ionicons name={mode.icon as any} size={32} color={mode.color} />
            </View>
            <View style={s.modeInfo}>
              <Text style={s.modeLabel}>{mode.label}</Text>
              <Text style={s.modeSub}>{mode.sub}</Text>
              <View style={s.tags}>
                <View style={[s.tag, { backgroundColor: mode.color }]}>
                  <Text style={[s.tagText, { color: colors.primaryForeground }]}>
                    {mode.tag1}
                  </Text>
                </View>
                <View style={[s.tag, { backgroundColor: colors.card, borderWidth: 1, borderColor: mode.color }]}>
                  <Text style={[s.tagText, { color: mode.color }]}>
                    {mode.tag2}
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        { paddingTop: topInset + 16, paddingBottom: 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={s.backBtn} onPress={() => setGameMode(null)}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={s.backText}>Modes</Text>
      </Pressable>

      {gameMode === "quick" && (
        <View>
          <Text style={s.title}>Quick Match</Text>

          <View style={s.setupCard}>
            <Text style={s.fieldLabel}>WAGER AMOUNT</Text>
            <View style={s.wagerRow}>
              <TextInput
                style={s.wagerInput}
                value={wagerAmount}
                onChangeText={setWagerAmount}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.mutedForeground}
                placeholder="0.01"
                testID="wager-input"
              />
              <View style={s.tokenToggle}>
                {(["eth", "usdc"] as TokenType[]).map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      s.tokenBtn,
                      wagerType === t && s.tokenBtnActive,
                    ]}
                    onPress={() => setWagerType(t)}
                  >
                    <Text
                      style={[
                        s.tokenText,
                        wagerType === t && s.tokenTextActive,
                      ]}
                    >
                      {t.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={s.winCard}>
              <Text style={s.winLabel}>POTENTIAL WIN</Text>
              <Text style={s.winValue}>
                {potentialWin} {wagerType.toUpperCase()}
              </Text>
              <Text style={s.winNote}>After 2.5% protocol fee</Text>
            </View>

            <Pressable
              style={({ pressed }) => [s.startBtn, pressed && s.pressed]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
            >
              <Ionicons name="flash" size={18} color={colors.primaryForeground} />
              <Text style={s.startBtnText}>Find Opponent</Text>
            </Pressable>
          </View>
        </View>
      )}

      {gameMode === "tournament" && (
        <View>
          <Text style={s.title}>Tournaments</Text>
          <View style={s.setupCard}>
            <Text style={s.modeSub}>
              Join an existing tournament or create one with custom rules.
            </Text>
            <Pressable
              style={[s.startBtn, { marginTop: 16 }]}
              onPress={() => router.push("/(tabs)/tournaments")}
            >
              <Ionicons name="trophy" size={18} color={colors.primaryForeground} />
              <Text style={s.startBtnText}>Browse Tournaments</Text>
            </Pressable>
          </View>
        </View>
      )}

      {gameMode === "challenge" && (
        <View>
          <Text style={s.title}>Daily Challenge</Text>
          <View style={s.setupCard}>
            <Text style={s.modeSub}>
              Complete today's challenge. Progress is tracked automatically.
            </Text>
            <Pressable
              style={[s.startBtn, { marginTop: 16, backgroundColor: colors.accent }]}
              onPress={() => router.push("/(tabs)/challenges")}
            >
              <Ionicons name="flash" size={18} color="#ffffff" />
              <Text style={[s.startBtnText, { color: "#ffffff" }]}>View Challenge</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16 },
    title: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 24,
    },
    modeCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      padding: 16,
      marginBottom: 12,
      gap: 14,
    },
    modeIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    modeInfo: { flex: 1, gap: 6 },
    modeLabel: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    modeSub: { fontSize: 13, color: colors.mutedForeground, lineHeight: 18 },
    tags: { flexDirection: "row", gap: 6, marginTop: 4 },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    tagText: { fontSize: 11, fontWeight: "700" as const },
    backBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 20,
    },
    backText: { color: colors.primary, fontWeight: "600" as const, fontSize: 15 },
    setupCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      gap: 12,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: colors.primary,
      letterSpacing: 1,
    },
    wagerRow: { flexDirection: "row", gap: 12, alignItems: "center" },
    wagerInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.foreground,
      fontSize: 16,
      fontWeight: "600" as const,
    },
    tokenToggle: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    tokenBtn: {
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    tokenBtnActive: { backgroundColor: colors.primary },
    tokenText: {
      color: colors.mutedForeground,
      fontWeight: "700" as const,
      fontSize: 13,
    },
    tokenTextActive: { color: colors.primaryForeground },
    winCard: {
      backgroundColor: colors.background,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    winLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      letterSpacing: 1,
      marginBottom: 4,
    },
    winValue: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: colors.secondary,
    },
    winNote: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    startBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
    },
    startBtnText: {
      color: colors.primaryForeground,
      fontWeight: "700" as const,
      fontSize: 15,
    },
    pressed: { opacity: 0.85 },
  });
