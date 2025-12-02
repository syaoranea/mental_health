
'use client';

import { ReactNode, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    Amplify.configure(outputs);
  }, []);

  return children;
}