import { useState, useEffect } from 'react';
import type { OfficerRole } from '@/types';

const STORAGE_KEY = 'selectedOfficer';

export function useSelectedOfficer() {
  const [selected, setSelected] = useState<OfficerRole>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as OfficerRole) ?? 'all';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selected);
  }, [selected]);

  return { selected, setSelected };
}
