import { StyleSheet } from 'react-native';

export const colors = { background: '#0D0D0D', surface: '#1A1A1A', maroon: '#7A0C1E', maroonDeep: '#4A0812', accent: '#9AA0A6', text: '#F5F5F5', muted: '#A0A0A0', danger: '#FF5B5B', positive: '#3BD16F' };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 36 };
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, content: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: spacing.md, gap: spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md }, card: { backgroundColor: colors.surface, borderColor: '#9AA0A64D', borderWidth: 1, borderRadius: 6, padding: spacing.md },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' }, heading: { color: colors.text, fontSize: 20, fontWeight: '700' }, label: { color: colors.muted, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderColor: '#9AA0A64D', borderWidth: 1, borderRadius: 5, color: colors.text, padding: 12, minHeight: 46 }, button: { backgroundColor: colors.maroon, borderRadius: 5, padding: 13, alignItems: 'center' }, buttonText: { color: colors.text, fontWeight: '700' },
  secondaryButton: { borderColor: '#9AA0A64D', borderWidth: 1, borderRadius: 5, padding: 11, alignItems: 'center' }, secondaryText: { color: colors.muted, fontWeight: '600' }, error: { color: colors.danger, marginTop: spacing.sm }, success: { color: colors.positive, marginTop: spacing.sm },
  modalBackdrop: { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' }, modalPanel: { width: '100%', maxHeight: '92%', backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.md },
});
