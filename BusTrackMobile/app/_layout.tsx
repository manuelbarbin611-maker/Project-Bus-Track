import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '@app/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}