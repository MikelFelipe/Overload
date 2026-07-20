import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View, TextInputProps } from 'react-native';
import { colors, styles } from '@/lib/theme';
export const Button = ({ title, onPress, secondary = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) => <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[secondary ? styles.secondaryButton : styles.button, disabled && { opacity: .5 }]}><Text style={secondary ? styles.secondaryText : styles.buttonText}>{title}</Text></Pressable>;
export const Field = ({ label, ...props }: TextInputProps & { label: string }) => <View style={{ gap: 4 }}><Text style={styles.label}>{label}</Text><TextInput {...props} placeholderTextColor={colors.muted} style={[styles.input, props.style]} /></View>;
export const Loading = () => <View style={styles.centered}><ActivityIndicator color={colors.positive} /></View>;
export const ModalShell = ({ visible, children, onClose }: { visible: boolean; children: React.ReactNode; onClose: () => void }) => <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><View style={styles.modalPanel}><ScrollView contentContainerStyle={{ gap: 12 }}>{children}</ScrollView></View></View></Modal>;
