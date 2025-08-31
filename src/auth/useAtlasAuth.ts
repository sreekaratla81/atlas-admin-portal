import { useAuth0 } from '@auth0/auth0-react';
import { useContext } from 'react';
import { BYPASS } from './config';
import { DevAuthContext } from './DevAuthProvider';

export function useAtlasAuth() {
  if (BYPASS) {
    const ctx = useContext(DevAuthContext);
    if (!ctx) throw new Error('useAtlasAuth used outside DevAuthProvider');
    return ctx;
  }
  return useAuth0();
}
