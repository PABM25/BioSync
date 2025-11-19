// src/styles/theme.js
import { createTheme } from '@rneui/themed';
import colors from './colors';
import typography from './typography';
import spacing from './spacing';

export const theme = createTheme({
  lightColors: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    white: colors.white,
    black: colors.black,
    error: colors.error,
    warning: colors.warning,
    success: colors.success
  },
  components: {
    Button: {
      raised: true,
      buttonStyle: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8
      }
    },
    Input: {
      containerStyle: {
        paddingHorizontal: 0
      }
    },
    Card: {
      containerStyle: {
        marginHorizontal: spacing.lg,
        marginVertical: spacing.md,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4
      }
    }
  }
});

export { colors, typography, spacing };
