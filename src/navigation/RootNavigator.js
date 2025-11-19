// src/navigation/RootNavigator.js
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';

import authService from '../services/authService';
import { colors } from '../styles';

// Pantallas de Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Pantallas Principales
import DashboardScreen from '../screens/main/DashboardScreen';
import NutricionScreen from '../screens/main/NutricionScreen';
import EjercicioScreen from '../screens/main/EjercicioScreen';
import SaludScreen from '../screens/main/SaludScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Pantallas de Detalle
import AgregarComidaScreen from '../screens/detalles/AgregarComidaScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

const MainAppNavigator = ({ userUid }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Nutricion') {
            iconName = 'utensils';
          } else if (route.name === 'Ejercicio') {
            iconName = 'activity';
          } else if (route.name === 'Salud') {
            iconName = 'heart';
          } else if (route.name === 'Perfil') {
            iconName = 'user';
          }

          return <Icon name={iconName} type="feather" size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18
        }
      })}
    >
      <Tab.Screen
        name="Dashboard"
        options={{ title: 'Inicio' }}
      >
        {props => <DashboardScreen {...props} userUid={userUid} />}
      </Tab.Screen>

      <Tab.Screen
        name="Nutricion"
        options={{ title: 'Nutrición' }}
      >
        {props => <NutricionScreen {...props} userUid={userUid} />}
      </Tab.Screen>

      <Tab.Screen
        name="Ejercicio"
        options={{ title: 'Ejercicio' }}
      >
        {props => <EjercicioScreen {...props} userUid={userUid} />}
      </Tab.Screen>

      <Tab.Screen
        name="Salud"
        options={{ title: 'Salud' }}
      >
        {props => <SaludScreen {...props} userUid={userUid} />}
      </Tab.Screen>

      <Tab.Screen
        name="Perfil"
        options={{ title: 'Mi Perfil' }}
      >
        {props => <ProfileScreen {...props} userUid={userUid} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const AppNavigator = ({ userUid }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="MainApp"
        component={MainAppNavigator}
        initialParams={{ userUid }}
      />

      <Stack.Screen
        name="AgregarComida"
        component={AgregarComidaScreen}
        options={{
          headerShown: true,
          title: 'Agregar Comida',
          headerStyle: {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1
          },
          presentation: 'modal'
        }}
      />
    </Stack.Navigator>
  );
};

const RootNavigator = () => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            isLoading: false,
            isSignout: false,
            userToken: action.payload,
            userUid: action.uid
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload,
            userUid: action.uid
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            userUid: null
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload,
            userUid: action.uid
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      userUid: null
    }
  );

  useEffect(() => {
    const bootstrapAsync = () => {
      const unsubscribe = authService.onAuthStateChanged((user) => {
        if (user) {
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: user.email,
            uid: user.uid
          });
        } else {
          dispatch({ type: 'SIGN_OUT' });
        }
      });

      return unsubscribe;
    };

    const unsubscribe = bootstrapAsync();
    return unsubscribe;
  }, []);

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.userToken == null ? (
        <AuthNavigator />
      ) : (
        <AppNavigator userUid={state.userUid} />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
