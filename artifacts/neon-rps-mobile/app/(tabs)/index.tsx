import { useGetLeaderboard } from "@workspace/api-client-react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(false);
  const { data } = useGetLeaderboard({ period: "all-time" });
  const topEntry = data?.data?.[0];

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const connectWallet = () => {
    Alert.alert(
      "Connect Wallet",
      "Web3 wallet connection requires the desktop app. On mobile, you can view stats and explore — tap OK to continue as a guest.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Continue as Guest", onPress: () => setIsConnected(true) },
      ],
    );
  };

  const s = styles(colors);

  return (
    <ScrollView
      style={[s.container]}
      contentContainerStyle={[
        s.content,
        {
          paddingTop: topInset + 16,
          paddingBottom: bottomInset + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.logo}>NEON RPS</Text>
        <View style={s.headerRight}>
          <Pressable
            style={({ pressed }) => [
              s.walletBtn,
              isConnected && s.walletBtnConnected,
              pressed && s.pressed,
            ]}
            onPress={isConnected ? undefined : connectWallet}
            testID="connect-wallet-btn"
          >
            <Ionicons
              name={isConnected ? "wallet" : "wallet-outline"}
              size={14}
              color={isConnected ? colors.primaryForeground : colors.primary}
            />
            <Text style={[s.walletBtnText, isConnected && s.walletBtnTextConnected]}>
              {isConnected ? "Connected" : "Connect Wallet"}
            </Text>
          </Pressable>
          <View style={s.onlineBadge}>
            <View style={s.onlineDot} />
            <Text style={s.onlineText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Hero CTA */}
      <View style={s.heroCard}>
        <Text style={s.heroTitle}>Play. Earn. Dominate.</Text>
        <Text style={s.heroSub}>
          Rock Paper Scissors on-chain with real ETH rewards.
        </Text>
        {!isConnected ? (
          <Pressable
            style={({ pressed }) => [s.playBtn, s.connectBtn, pressed && s.pressed]}
            onPress={connectWallet}
            testID="connect-wallet-cta"
          >
            <Ionicons name="wallet-outline" size={20} color={colors.primaryForeground} />
            <Text style={s.playBtnText}>Connect Wallet to Play</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [s.playBtn, pressed && s.pressed]}
            onPress={() => router.push("/(tabs)/play")}
            testID="play-now-btn"
          >
            <Ionicons name="game-controller" size={20} color={colors.primaryForeground} />
            <Text style={s.playBtnText}>Play Now</Text>
          </Pressable>
        )}
      </View>

      {/* Stat cards */}
      <View style={s.statsRow}>
        <Pressable
          style={[s.statCard, { borderColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/leaderboard")}
        >
          <Text style={[s.statLabel, { color: colors.primary }]}>TOP WINNER</Text>
          <Text style={s.statValue}>
            {topEntry?.walletAddress
              ? `${topEntry.walletAddress.slice(0, 6)}…`
              : "—"}
          </Text>
          <Text style={s.statSub}>
            {topEntry ? `${topEntry.totalWins} wins` : "Be first!"}
          </Text>
        </Pressable>
        <Pressable
          style={[s.statCard, { borderColor: colors.secondary }]}
          onPress={() => router.push("/(tabs)/leaderboard")}
        >
          <Text style={[s.statLabel, { color: colors.secondary }]}>TOP EARNINGS</Text>
          <Text style={s.statValue}>
            {topEntry
              ? `${parseFloat(topEntry.totalWinnings).toFixed(3)} ETH`
              : "0 ETH"}
          </Text>
          <Text style={s.statSub}>All-time leader</Text>
        </Pressable>
      </View>

      {/* Quick nav grid */}
      <Text style={s.sectionTitle}>QUICK ACCESS</Text>
      <View style={s.grid}>
        {[
          {
            label: "Quick Match",
            sub: "1v1 with ETH wager",
            icon: "flash" as const,
            color: colors.primary,
            route: "/(tabs)/play",
          },
          {
            label: "Tournaments",
            sub: "Compete for prize pools",
            icon: "trophy" as const,
            color: colors.secondary,
            route: "/(tabs)/tournaments",
          },
          {
            label: "Daily Challenge",
            sub: "Earn ETH every day",
            icon: "flash" as const,
            color: colors.accent,
            route: "/(tabs)/challenges",
          },
          {
            label: "Leaderboard",
            sub: "See top players",
            icon: "bar-chart-outline" as const,
            color: colors.primary,
            route: "/(tabs)/leaderboard",
          },
        ].map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              s.gridItem,
              { borderColor: pressed ? item.color : colors.border },
            ]}
            onPress={() => router.push(item.route as any)}
          >
            <Ionicons name={item.icon as any} size={28} color={item.color} />
            <Text style={s.gridLabel}>{item.label}</Text>
            <Text style={s.gridSub}>{item.sub}</Text>
          </Pressable>
        ))}
      </View>
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
      marginBottom: 24,
    },
    logo: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: colors.primary,
      fontFamily: "Inter_700Bold",
      letterSpacing: 2,
    },
    onlineBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
      gap: 6,
    },
    onlineDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    onlineText: { color: colors.primary, fontSize: 11, fontWeight: "700" as const },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.primary,
      padding: 24,
      marginBottom: 16,
      alignItems: "flex-start",
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.foreground,
      marginBottom: 8,
      fontFamily: "Inter_700Bold",
    },
    heroSub: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 20,
      lineHeight: 20,
    },
    playBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: colors.radius,
    },
    playBtnText: {
      color: colors.primaryForeground,
      fontWeight: "700" as const,
      fontSize: 15,
    },
    connectBtn: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    walletBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: "transparent",
    },
    walletBtnConnected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    walletBtnText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: "700" as const,
    },
    walletBtnTextConnected: {
      color: colors.primaryForeground,
    },
    pressed: { opacity: 0.8 },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      padding: 16,
    },
    statLabel: { fontSize: 10, fontWeight: "700" as const, marginBottom: 6, letterSpacing: 1 },
    statValue: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 2,
    },
    statSub: { fontSize: 12, color: colors.mutedForeground },
    sectionTitle: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      letterSpacing: 1.5,
      marginBottom: 12,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    gridItem: {
      width: "47%",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      padding: 16,
      gap: 8,
    },
    gridLabel: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    gridSub: { fontSize: 12, color: colors.mutedForeground },
  });
