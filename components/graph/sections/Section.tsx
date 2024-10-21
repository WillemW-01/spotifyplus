import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  return (
    <View style={{ alignItems: "flex-start", width: "100%", gap: 15 }}>
      <Text style={styles.textStyle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    color: "white",
    textAlign: "center",
    fontSize: 28,
  },
});
