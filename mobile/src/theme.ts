import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#0D0D0D', surface: '#1A1A1A', maroon: '#7A0C1E', deep: '#4A0812',
  accent: '#9AA0A6', text: '#F5F5F5', muted: '#8A8A8A', danger: '#FF3B3B', positive: '#3BD16F',
};

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary },
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: colors.surface, borderColor: '#9AA0A64D', borderWidth: 1, borderRadius: 5, padding: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  heading: { color: colors.text, fontSize: 20, fontWeight: '700' },
  label: { color: colors.muted, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: colors.primary, borderColor: '#9AA0A64D', borderWidth: 1, borderRadius: 5, color: colors.text, padding: 12 },
  button: { backgroundColor: colors.maroon, borderRadius: 5, padding: 13, alignItems: 'center' },
  buttonText: { color: colors.text, fontWeight: '700' },
  secondaryButton: { borderColor: '#9AA0A64D', borderWidth: 1, borderRadius: 5, padding: 11, alignItems: 'center' },
  secondaryText: { color: colors.muted, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modalPanel: { maxHeight: '92%', backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  error: { color: colors.danger, marginTop: 8 },
  success: { color: colors.positive, marginTop: 8 },
});
