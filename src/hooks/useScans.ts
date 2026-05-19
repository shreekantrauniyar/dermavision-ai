import { useState, useEffect } from 'react';
import { ScanResult } from '../types';
import { useAuth } from './useAuth';

export function useScans(maxResults?: number) {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setScans([]);
      setLoading(false);
      return;
    }

    const loadScans = async () => {
      try {
        const res = await fetch('/api/scans');
        if (res.ok) {
          const data = await res.json();
          if (maxResults) {
            setScans(data.slice(0, maxResults));
          } else {
            setScans(data);
          }
        }
      } catch (err) {
        console.error("Failed to load scans", err);
      } finally {
        setLoading(false);
      }
    };

    loadScans();
    const interval = setInterval(loadScans, 2000);
    return () => clearInterval(interval);
  }, [user, maxResults]);

  return { scans, loading };
}
