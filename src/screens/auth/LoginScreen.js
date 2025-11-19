// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, Input, Button, Icon } from '@rneui/themed';
import authService from '../../services/authService';
import { colors, spacing, typography } from '../../styles';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validación
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Email inválido');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email, password);
      // La navegación ocurre automáticamente en el listener
    } catch (error) {
      Alert.alert('Error de Inicio de Sesión', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Ingresa tu email para recuperar contraseña');
      return;
    }

    authService.resetPassword(email)
      .then(() => {
        Alert.alert('Éxito', 'Se envió un email de recuperación');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Icon
            name="heart"
            type="feather"
            size={60}
            color={colors.primary}
          />
          <Text style={styles.title}>FitAI</Text>
          <Text style={styles.subtitle}>Tu entrenador personal con IA</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={{ name: 'mail', type: 'feather' }}
            containerStyle={styles.inputContainer}
            placeholderTextColor={colors.textSecondary}
            editable={!loading}
          />

          <Input
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={{ name: 'lock', type: 'feather' }}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-off'}
                  type="feather"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            }
            containerStyle={styles.inputContainer}
            placeholderTextColor={colors.textSecondary}
            editable={!loading}
          />

          <Button
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.loginButton}
            titleStyle={styles.buttonTitle}
            disabled={loading}
          />

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  title: {
    fontSize: typography.h1,
    fontWeight: '700',
    marginTop: spacing.md,
    color: colors.text
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm
  },
  formContainer: {
    marginVertical: spacing.lg
  },
  inputContainer: {
    marginBottom: spacing.lg
  },
  buttonContainer: {
    marginVertical: spacing.lg
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8
  },
  buttonTitle: {
    fontSize: typography.body,
    fontWeight: '600'
  },
  forgotPassword: {
    textAlign: 'center',
    color: colors.primary,
    fontSize: typography.caption,
    marginTop: spacing.md
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl
  },
  registerText: {
    color: colors.textSecondary,
    fontSize: typography.body
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: typography.body
  }
});

export default LoginScreen;
