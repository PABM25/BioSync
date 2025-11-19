// src/screens/auth/OnboardingScreen.js
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Text, Button, Icon, Input } from '@rneui/themed';
import { colors, spacing, typography } from '../../styles';
import userService from '../../services/userService';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ route, navigation }) => {
  const { uid } = route.params;
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    objetivo: null,
    nivelExperiencia: null,
    diasPorSemana: null,
    duracionSesion: null,
    peso: '',
    altura: '',
    edad: '',
    genero: null
  });
  const [loading, setLoading] = useState(false);

  const objetivos = [
    { label: 'Perder Peso', value: 'Perder Peso', icon: '📉' },
    { label: 'Ganar Músculo', value: 'Ganar Músculo', icon: '💪' },
    { label: 'Mantenerme Activo', value: 'Mantenerme Activo', icon: '🏃' }
  ];

  const nivelesExperiencia = [
    { label: 'Principiante', value: 'Principiante', description: 'Recién empiezo' },
    { label: 'Intermedio', value: 'Intermedio', description: 'Entreno regularmente' },
    { label: 'Avanzado', value: 'Avanzado', description: 'Atleta experimentado' }
  ];

  const handleContinuar = async () => {
    if (step < 5) {
      // Validaciones por step
      switch(step) {
        case 1:
          if (!formData.objetivo) {
            Alert.alert('Error', 'Selecciona tu objetivo');
            return;
          }
          break;
        case 2:
          if (!formData.nivelExperiencia) {
            Alert.alert('Error', 'Selecciona tu nivel de experiencia');
            return;
          }
          break;
        case 3:
          if (!formData.diasPorSemana || !formData.duracionSesion) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
          }
          break;
        case 4:
          if (!formData.peso || !formData.altura || !formData.edad || !formData.genero) {
            Alert.alert('Error', 'Completa todos los datos antropométricos');
            return;
          }
          if (isNaN(formData.peso) || isNaN(formData.altura) || isNaN(formData.edad)) {
            Alert.alert('Error', 'Ingresa valores numéricos válidos');
            return;
          }
          break;
      }
      
      setStep(step + 1);
    } else {
      // Guardar onboarding
      await handleGuardarOnboarding();
    }
  };

  const handleGuardarOnboarding = async () => {
    setLoading(true);
    try {
      await userService.completeOnboarding(uid, {
        objetivo: formData.objetivo,
        nivelExperiencia: formData.nivelExperiencia,
        diasPorSemana: formData.diasPorSemana,
        duracionSesion: formData.duracionSesion,
        peso: parseFloat(formData.peso),
        altura: parseFloat(formData.altura),
        edad: parseInt(formData.edad),
        genero: formData.genero
      });

      // Navegación automática en el listener de auth
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }]
      });

    } catch (error) {
      Alert.alert('Error', 'No se pudo completar el onboarding: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>¿Cuál es tu objetivo?</Text>
            <Text style={styles.stepSubtitle}>Esto nos ayudará a personalizar tu plan</Text>
            
            {objetivos.map(obj => (
              <TouchableOpacity
                key={obj.value}
                style={[
                  styles.optionCard,
                  formData.objetivo === obj.value && styles.optionCardSelected
                ]}
                onPress={() => setFormData({ ...formData, objetivo: obj.value })}
              >
                <Text style={styles.optionIcon}>{obj.icon}</Text>
                <Text style={styles.optionLabel}>{obj.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Nivel de Experiencia</Text>
            <Text style={styles.stepSubtitle}>¿Cuánto entrenamiento tienes?</Text>
            
            {nivelesExperiencia.map(nivel => (
              <TouchableOpacity
                key={nivel.value}
                style={[
                  styles.optionCard,
                  formData.nivelExperiencia === nivel.value && styles.optionCardSelected
                ]}
                onPress={() => setFormData({ ...formData, nivelExperiencia: nivel.value })}
              >
                <Text style={styles.optionLabel}>{nivel.label}</Text>
                <Text style={styles.optionDescription}>{nivel.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Disponibilidad de Tiempo</Text>
            <Text style={styles.stepSubtitle}>¿Cuánto tiempo puedes dedicar?</Text>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Días por semana: {formData.diasPorSemana}</Text>
              {[1, 2, 3, 4, 5, 6, 7].map(dia => (
                <TouchableOpacity
                  key={dia}
                  style={[
                    styles.diaButton,
                    formData.diasPorSemana === dia && styles.diaButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, diasPorSemana: dia })}
                >
                  <Text style={[
                    styles.diaButtonText,
                    formData.diasPorSemana === dia && styles.diaButtonTextSelected
                  ]}>
                    {dia}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Duración por sesión: {formData.duracionSesion} min</Text>
              {[30, 45, 60, 90].map(duracion => (
                <TouchableOpacity
                  key={duracion}
                  style={[
                    styles.duracionButton,
                    formData.duracionSesion === duracion && styles.duracionButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, duracionSesion: duracion })}
                >
                  <Text style={[
                    styles.duracionButtonText,
                    formData.duracionSesion === duracion && styles.duracionButtonTextSelected
                  ]}>
                    {duracion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Datos Personales</Text>
            <Text style={styles.stepSubtitle}>Para calcular tu plan nutricional</Text>

            <Input
              placeholder="Peso (kg)"
              value={formData.peso}
              onChangeText={peso => setFormData({ ...formData, peso })}
              keyboardType="decimal-pad"
              containerStyle={styles.inputContainer}
            />

            <Input
              placeholder="Altura (cm)"
              value={formData.altura}
              onChangeText={altura => setFormData({ ...formData, altura })}
              keyboardType="decimal-pad"
              containerStyle={styles.inputContainer}
            />

            <Input
              placeholder="Edad"
              value={formData.edad}
              onChangeText={edad => setFormData({ ...formData, edad })}
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
            />

            <View style={styles.generoContainer}>
              <Text style={styles.sliderLabel}>Género:</Text>
              {['M', 'F', 'Otro'].map(genero => (
                <TouchableOpacity
                  key={genero}
                  style={[
                    styles.generoButton,
                    formData.genero === genero && styles.generoButtonSelected
                  ]}
                  onPress={() => setFormData({ ...formData, genero })}
                >
                  <Text style={[
                    styles.generoButtonText,
                    formData.genero === genero && styles.generoButtonTextSelected
                  ]}>
                    {genero}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Icon
              name="check-circle"
              type="feather"
              size={80}
              color={colors.success}
              containerStyle={styles.successIcon}
            />
            <Text style={styles.successTitle}>¡Perfecto!</Text>
            <Text style={styles.successMessage}>
              Tu perfil está configurado. Estamos listos para comenzar tu transformación.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map(s => (
          <View
            key={s}
            style={[
              styles.progressDot,
              s <= step && styles.progressDotActive
            ]}
          />
        ))}
      </View>

      {/* Content */}
      {renderStep()}

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {step > 1 && (
          <Button
            title="Atrás"
            type="outline"
            onPress={() => setStep(step - 1)}
            containerStyle={styles.backButtonContainer}
            titleStyle={styles.backButtonTitle}
          />
        )}
        
        <Button
          title={step === 5 ? '¡Comenzar!' : 'Continuar'}
          onPress={handleContinuar}
          loading={loading}
          containerStyle={[styles.nextButtonContainer, step > 1 && { flex: 1, marginLeft: spacing.md }]}
          buttonStyle={styles.nextButton}
          titleStyle={styles.nextButtonTitle}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24
  },
  stepContainer: {
    marginVertical: spacing.lg
  },
  stepTitle: {
    fontSize: typography.h2,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.text
  },
  stepSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg
  },
  optionCard: {
    padding: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center'
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: spacing.sm
  },
  optionLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center'
  },
  optionDescription: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  sliderContainer: {
    marginVertical: spacing.lg
  },
  sliderLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text
  },
  diaButton: {
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  diaButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  diaButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '500'
  },
  diaButtonTextSelected: {
    color: colors.white
  },
  duracionButton: {
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  duracionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  duracionButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '500'
  },
  duracionButtonTextSelected: {
    color: colors.white
  },
  inputContainer: {
    marginVertical: spacing.md
  },
  generoContainer: {
    marginVertical: spacing.lg
  },
  generoButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  generoButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  generoButtonText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '500',
    textAlign: 'center'
  },
  generoButtonTextSelected: {
    color: colors.white
  },
  successIcon: {
    marginVertical: spacing.xl,
    alignItems: 'center'
  },
  successTitle: {
    fontSize: typography.h2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text
  },
  successMessage: {
    fontSize: typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 24
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl
  },
  backButtonContainer: {
    flex: 1
  },
  backButtonTitle: {
    color: colors.primary
  },
  nextButtonContainer: {
    flex: 1
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8
  },
  nextButtonTitle: {
    fontSize: typography.body,
    fontWeight: '600'
  }
});

export default OnboardingScreen;
