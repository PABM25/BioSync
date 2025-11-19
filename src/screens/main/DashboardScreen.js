// src/screens/main/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Text, Icon, Card, LinearProgress, Button } from '@rneui/themed';
import { LineChart, BarChart } from 'react-native-chart-kit';
import userService from '../../services/userService';
import { colors, spacing, typography } from '../../styles';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ route, navigation, userUid }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [error, setError] = useState(null);

  const chartWidth = width - spacing.lg * 2;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const profile = await userService.getUserProfile(userUid);
      setUserData(profile);

      const hoy = format(new Date(), 'yyyy-MM-dd');
      const progResp = await userService.getProgresoUltimos30Dias(userUid);
      
      if (progResp.length > 0) {
        setProgreso(progResp[0]);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loading" size={40} color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar datos del usuario</Text>
        <Button title="Reintentar" onPress={cargarDatos} />
      </View>
    );
  }

  const { perfil, requisitosNutricionales } = userData;
  const calorias_consumidas = progreso?.calorasConsumidas || 0;
  const porcentaje_calorias = (calorias_consumidas / requisitosNutricionales.calorias) * 100;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {perfil.nombre}!</Text>
          <Text style={styles.subtitle}>{format(new Date(), 'EEEE, d MMMM', { locale: es })}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Icon
            name="user"
            type="feather"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Métricas Principales */}
      <View style={styles.metricsContainer}>
        <Card containerStyle={styles.metricCard}>
          <View style={styles.metricContent}>
            <Icon name="zap" type="feather" size={32} color={colors.orange} />
            <View style={styles.metricInfo}>
              <Text style={styles.metricValue}>{calorias_consumidas}</Text>
              <Text style={styles.metricLabel}>Calorías Hoy</Text>
              <Text style={styles.metricGoal}>Meta: {requisitosNutricionales.calorias}</Text>
            </View>
          </View>
          <LinearProgress
            value={Math.min(porcentaje_calorias / 100, 1)}
            color={colors.orange}
            containerStyle={styles.progressBar}
          />
        </Card>

        <Card containerStyle={styles.metricCard}>
          <View style={styles.metricContent}>
            <Icon name="droplet" type="feather" size={32} color={colors.blue} />
            <View style={styles.metricInfo}>
              <Text style={styles.metricValue}>{progreso?.agua || 0}L</Text>
              <Text style={styles.metricLabel}>Agua Consumida</Text>
              <Text style={styles.metricGoal}>Meta: {requisitosNutricionales.agua}L</Text>
            </View>
          </View>
        </Card>

        <Card containerStyle={styles.metricCard}>
          <View style={styles.metricContent}>
            <Icon name="activity" type="feather" size={32} color={colors.green} />
            <View style={styles.metricInfo}>
              <Text style={styles.metricValue}>{progreso?.tiempoEntrenamiento || 0}m</Text>
              <Text style={styles.metricLabel}>Entrenamiento</Text>
              <Text style={styles.metricGoal}>Meta: 60m</Text>
            </View>
          </View>
        </Card>

        <Card containerStyle={styles.metricCard}>
          <View style={styles.metricContent}>
            <Icon name="moon" type="feather" size={32} color={colors.purple} />
            <View style={styles.metricInfo}>
              <Text style={styles.metricValue}>{progreso?.sueno || 0}h</Text>
              <Text style={styles.metricLabel}>Sueño</Text>
              <Text style={styles.metricGoal}>Meta: 8h</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Macronutrientes */}
      <Card containerStyle={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Macronutrientes de Hoy</Text>
        
        <View style={styles.macroGrid}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Proteínas</Text>
            <Text style={styles.macroValue}>{progreso?.totalesNutricionales?.proteinas || 0}g</Text>
            <Text style={styles.macroGoal}>{requisitosNutricionales.proteinas}g</Text>
          </View>

          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Carbos</Text>
            <Text style={styles.macroValue}>{progreso?.totalesNutricionales?.carbohidratos || 0}g</Text>
            <Text style={styles.macroGoal}>{requisitosNutricionales.carbohidratos}g</Text>
          </View>

          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Grasas</Text>
            <Text style={styles.macroValue}>{progreso?.totalesNutricionales?.grasas || 0}g</Text>
            <Text style={styles.macroGoal}>{requisitosNutricionales.grasas}g</Text>
          </View>
        </View>
      </Card>

      {/* Progreso de Peso (últimos 30 días) */}
      {/* Este gráfico se implementa similar a los anteriores */}

      {/* Botones de Acciones Rápidas */}
      <View style={styles.actionsContainer}>
        <Button
          title="Registrar Comida"
          icon={{ name: 'utensils', type: 'feather', color: colors.white }}
          onPress={() => navigation.navigate('AgregarComida')}
          containerStyle={styles.actionButton}
          buttonStyle={styles.actionButtonStyle}
        />
        
        <Button
          title="Registrar Ejercicio"
          icon={{ name: 'activity', type: 'feather', color: colors.white }}
          onPress={() => navigation.navigate('Ejercicio')}
          containerStyle={styles.actionButton}
          buttonStyle={styles.actionButtonStyle}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body,
    color: colors.textSecondary
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg
  },
  errorText: {
    fontSize: typography.body,
    color: colors.error,
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface
  },
  greeting: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs
  },
  subtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary
  },
  metricsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md
  },
  metricCard: {
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginHorizontal: 0,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md
  },
  metricInfo: {
    flex: 1
  },
  metricValue: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.text
  },
  metricLabel: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  metricGoal: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs
  },
  progressBar: {
    borderRadius: 8,
    marginTop: spacing.md
  },
  sectionCard: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: '700',
    marginBottom: spacing.lg,
    color: colors.text
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.md
  },
  macroItem: {
    alignItems: 'center',
    flex: 1
  },
  macroLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs
  },
  macroValue: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs
  },
  macroGoal: {
    fontSize: typography.caption,
    color: colors.textSecondary
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.md
  },
  actionButton: {
    flex: 1
  },
  actionButtonStyle: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8
  }
});

export default DashboardScreen;
