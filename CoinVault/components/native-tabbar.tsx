import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NativeTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [BlurView, setBlurView] = React.useState<any>(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // eslint-disable-next-line import/no-unresolved
        // @ts-ignore
        const mod = await import('expo-blur');
        if (mounted) setBlurView(mod?.BlurView ?? null);
      } catch {
        /* optional */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const containerHeight = 60 + insets.bottom;

  return (
    <View style={[styles.wrapper, { height: containerHeight, paddingBottom: insets.bottom }]}> 
      {BlurView ? (
        <BlurView tint={colorScheme === 'dark' ? 'dark' : 'light'} intensity={80} style={styles.blur} />
      ) : (
        <View
          style={[
            styles.fallback,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(18,18,18,0.48)' : 'rgba(255,255,255,0.7)' },
          ]}
        />
      )}

      <View style={styles.row} pointerEvents="box-none">
        {state.routes.map((route, idx) => {
          const focused = state.index === idx;
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const color = focused ? colors.tint : colors.text;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              style={styles.tabButton}
            >
              {options.tabBarIcon ? (
                (options.tabBarIcon as any)({ color, focused, size: 26 })
              ) : (
                <IconSymbol name="chevron.right" size={24} color={color} />
              )}
              <Text style={[styles.label, { color, fontFamily: Fonts.sans }]}>{label as string}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: 16,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 100,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    opacity: 0.95,
    borderWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 0,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '100%',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});
