import { useColorScheme as useRNColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export function useThemeColors() {
  const colorScheme = useRNColorScheme();
  return Colors[colorScheme === "dark" ? "dark" : "light"];
}

export function useColorScheme() {
  return useRNColorScheme() ?? "light";
}
