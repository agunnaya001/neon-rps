import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceSub: "",
    borderColor: null,
    labelColor: null,
    popular: false,
    features: [
      { text: "Daily challenges", included: true },
      { text: "Leaderboards", included: true },
      { text: "Standard cosmetics", included: true },
      { text: "Premium cosmetics", included: false },
    ],
    ctaLabel: "Current Plan",
    ctaActive: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    priceSub: "/month · or 1 ETH",
    borderColor: "#00ff88",
    labelColor: "#00ff88",
    popular: true,
    features: [
      { text: "All free features", included: true },
      { text: "Exclusive cosmetics", included: true },
      { text: "Custom move animations", included: true },
      { text: "0.5% fee discount", included: true },
      { text: "Early tournament access", included: true },
    ],
    ctaLabel: "Upgrade Now",
    ctaActive: true,
  },
  {
    id: "vip",
    name: "VIP",
    price: "$29.99",
    priceSub: "/month · or 3 ETH",
    borderColor: "#ff006e",
    labelColor: "#ff006e",
    popular: false,
    features: [
      { text: "All premium features", included: true },
      { text: "VIP cosmetics & NFT", included: true },
      { text: "1% fee discount", included: true },
      { text: "Private tournaments", included: true },
      { text: "Weekly challenges", included: true },
    ],
    ctaLabel: "Go VIP",
    ctaActive: true,
  },
];

const COSMETICS = [
  { name: "Neon Rock", type: "Animation", level: 1 },
  { name: "Matrix Paper", type: "Animation", level: 5 },
  { name: "Quantum Scissors", type: "Animation", level: 10 },
  { name: "Golden Trophy", type: "Avatar Frame", level: 1 },
];

export default function BattlePassScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTier, setActiveTier] = useState("free");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const s = styles(colors);

  const handleUpgrade = (tier: typeof TIERS[number]) => {
    if (!tier.ctaActive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      `Upgrade to ${tier.name}`,
      `Connect your wallet on the web app to purchase the ${tier.name} battle pass.`,
      [{ text: "OK" }],
    );
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[
        s.content,
        {
          paddingTop: topInset + 16,
          paddingBottom: Platform.OS === "web" ? 118 : 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.title}>Battle Pass</Text>
      <Text style={s.subtitle}>Unlock cosmetics &amp; exclusive perks</Text>

      {/* Tier cards */}
      {TIERS.map((tier) => (
        <View
          key={tier.id}
          style={[
            s.tierCard,
            tier.borderColor ? { borderColor: tier.borderColor, borderWidth: 2 } : {},
          ]}
        >
          {tier.popular && (
            <View style={s.popularBadge}>
              <Text style={s.popularText}>POPULAR</Text>
            </View>
          )}

          <View style={s.tierHeader}>
            <Text style={[s.tierName, tier.labelColor ? { color: tier.labelColor } : {}]}>
              {tier.name}
            </Text>
            <View>
              <Text style={[s.tierPrice, tier.labelColor ? { color: tier.labelColor } : {}]}>
                {tier.price}
              </Text>
              {!!tier.priceSub && (
                <Text style={s.tierPriceSub}>{tier.priceSub}</Text>
              )}
            </View>
          </View>

          <View style={s.featureList}>
            {tier.features.map((f) => (
              <View key={f.text} style={s.featureRow}>
                <Ionicons
                  name={f.included ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={
                    f.included
                      ? tier.labelColor ?? colors.primary
                      : colors.mutedForeground
                  }
                />
                <Text
                  style={[
                    s.featureText,
                    !f.included && { color: colors.mutedForeground },
                  ]}
                >
                  {f.text}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              s.tierBtn,
              !tier.ctaActive && s.tierBtnInactive,
              tier.ctaActive && tier.labelColor
                ? { backgroundColor: tier.labelColor }
                : {},
              pressed && tier.ctaActive ? { opacity: 0.85 } : {},
            ]}
            onPress={() => handleUpgrade(tier)}
            disabled={!tier.ctaActive}
          >
            <Text
              style={[
                s.tierBtnText,
                !tier.ctaActive && { color: colors.mutedForeground },
                tier.ctaActive && tier.id !== "free"
                  ? { color: tier.id === "vip" ? "#ffffff" : colors.primaryForeground }
                  : {},
              ]}
            >
              {tier.ctaLabel}
            </Text>
          </Pressable>
        </View>
      ))}

      {/* Cosmetics */}
      <Text style={s.sectionTitle}>AVAILABLE COSMETICS</Text>
      <View style={s.cosmeticsGrid}>
        {COSMETICS.map((c) => (
          <View key={c.name} style={s.cosmeticCard}>
            <Ionicons name="sparkles" size={28} color={colors.primary} />
            <Text style={s.cosmeticName}>{c.name}</Text>
            <Text style={s.cosmeticType}>{c.type}</Text>
            <Text style={s.cosmeticLevel}>Level {c.level}+</Text>
          </View>
        ))}
      </View>
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
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 24,
    },
    tierCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      marginBottom: 16,
      position: "relative",
    },
    popularBadge: {
      position: "absolute",
      top: -12,
      alignSelf: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 20,
    },
    popularText: {
      color: colors.primaryForeground,
      fontSize: 11,
      fontWeight: "700" as const,
      letterSpacing: 1,
    },
    tierHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    tierName: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    tierPrice: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.foreground,
      textAlign: "right",
    },
    tierPriceSub: {
      fontSize: 11,
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 2,
    },
    featureList: { gap: 10, marginBottom: 16 },
    featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    featureText: { fontSize: 14, color: colors.foreground },
    tierBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 12,
      alignItems: "center",
    },
    tierBtnInactive: {
      backgroundColor: colors.border,
    },
    tierBtnText: {
      color: colors.primaryForeground,
      fontWeight: "700" as const,
      fontSize: 15,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: colors.mutedForeground,
      letterSpacing: 1.5,
      marginBottom: 12,
      marginTop: 8,
    },
    cosmeticsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    cosmeticCard: {
      width: "47%",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      alignItems: "center",
      gap: 6,
    },
    cosmeticName: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: colors.primary,
      textAlign: "center",
    },
    cosmeticType: { fontSize: 12, color: colors.mutedForeground },
    cosmeticLevel: { fontSize: 11, color: colors.mutedForeground },
  });
