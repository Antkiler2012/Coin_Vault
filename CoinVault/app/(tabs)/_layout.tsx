import React from 'react';
import { DynamicColorIOS, Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const textColor = DynamicColorIOS({ light: Colors.light.text, dark: Colors.dark.text });
  const tintColor = DynamicColorIOS({ light: Colors.light.tint, dark: Colors.dark.tint });

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
       android: <Icon sf="attach-money" /> 
})}

      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
