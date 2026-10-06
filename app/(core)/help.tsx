import { ScreenHeader } from "@/components/ScreenHeader";
import ScreenLayout from "@/components/ScreenLayout";
import { createStyles, useCurrentTheme } from "@/context/CentralTheme";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

const QA = [
  { q: "q1", a: "a1" },
  { q: "q2", a: "a2" },
  { q: "q3", a: "a3" },
  { q: "q4", a: "a4" },
] as const;

export default function Help() {
  const { t } = useTranslation();
  const theme = useCurrentTheme();
  const styles = useStyles();
  const [open, setOpen] = useState<string | null>("q1");

  return (
    <ScreenLayout>
      <ScreenHeader title={t("help:headerTitle")} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={[styles.about, { color: theme.textSecondary }]}>
            {t("help:about")} - {t("help:copyright", { year: new Date().getFullYear() })}
          </Text>
          <Text style={[styles.faqTitle, { color: theme.text }]}>
            {t("help:faqTitle")}
          </Text>
          {QA.map(({ q, a }) => {
            const expanded = open === q;
            return (
              <View
                key={q}
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Pressable
                  style={styles.qRow}
                  onPress={() => setOpen(expanded ? null : q)}
                >
                  <Text style={[styles.q, { color: theme.text }]}>
                    {t(`help:questions.${q}`)}
                  </Text>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={theme.chevron}
                  />
                </Pressable>
                {expanded ? (
                  <Text style={[styles.a, { color: theme.textSecondary }]}>
                    {t(`help:answers.${a}`)}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const useStyles = createStyles(() => ({
  body: { paddingHorizontal: 16, paddingBottom: 32 },
  about: { fontSize: 13, marginTop: 16, marginBottom: 8 },
  faqTitle: { fontSize: 20, fontWeight: "700", marginVertical: 12 },
  card: { borderWidth: 1, borderRadius: 12, marginBottom: 10, overflow: "hidden" },
  qRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    gap: 12,
  },
  q: { fontSize: 15, fontWeight: "600", flex: 1 },
  a: { fontSize: 14, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 14 },
}));
