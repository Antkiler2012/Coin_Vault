import { Colors } from '@/constants/theme';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { DynamicColorIOS, Platform } from 'react-native';

export default function TabLayout() {
  const textColor = DynamicColorIOS({ light: Colors.light.text, dark: Colors.light.text });
  const tintColor = DynamicColorIOS({ light: Colors.light.tint, dark: Colors.light.tint });

  return (
    <NativeTabs labelStyle={{ color: textColor }} tintColor={tintColor}>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {Platform.select({ ios: <Icon sf={{ default: 'house', selected: 'house.fill' }} />, android: <Icon sf="house" /> })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Label>Collection</Label>
       {Platform.select({ 
       ios: <Icon sf={{ default: 'dollarsign.circle', selected: 'dollarsign.circle.fill' }} />, 
       android: <Icon sf="dollarsign.circle" /> 
})}

      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
