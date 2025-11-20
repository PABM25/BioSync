// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Input, Button, Icon } from '@rneui/themed';
import authService from '../../services/authService';
import { colors, spacing, typography } from '../../styles';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.register(email, password, name);
      // Navegar al Onboarding pasando el UID
      navigation.replace('Onboarding', { uid: user.uid });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete al reto BioSync</Text>

        <View style={styles.formContainer}>
          <Input
            placeholder="Nombre Completo"
            leftIcon={{ name: 'user', type: 'feather', color: colors.textSecondary }}
            value={name}
            onChangeText={setName}
          />
          <Input
            placeholder="Email"
            leftIcon={{ name: 'mail', type: 'feather', color: colors.textSecondary }}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Contraseña"
            leftIcon={{ name: 'lock', type: 'feather', color: colors.textSecondary }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Button
            title="Registrarse"
            onPress={handleRegister}
            loading={loading}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
          />
          
          <Button
            title="¿Ya tienes cuenta? Inicia Sesión"
            type="clear"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: spacing.lg, justifyContent: 'center', flexGrow: 1 },
  title: { fontSize: typography.h1, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  formContainer: { marginTop: spacing.md },
  button: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: spacing.md },
  buttonContainer: { marginVertical: spacing.md }
});

export default RegisterScreen;