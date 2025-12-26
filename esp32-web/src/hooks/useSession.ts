import { useContext } from 'react';

import { SessionContext } from '@contexts/SessionContext';

import type { SessionContextType } from '../types';

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error('useSession must be inside of an SessionProvider');
  }

  return context;
};
