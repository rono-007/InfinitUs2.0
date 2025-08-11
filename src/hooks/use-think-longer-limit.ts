
"use client"

import { useState, useEffect, useCallback } from 'react';

const THINK_LONGER_LIMIT = 5;
const STORAGE_KEY = 'thinkLongerUsage';

interface UsageData {
  count: number;
  date: string; // YYYY-MM-DD
}

export function useThinkLongerLimit() {
  const [usageData, setUsageData] = useState<UsageData>({
    count: THINK_LONGER_LIMIT,
    date: new Date().toISOString().split('T')[0],
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const today = new Date().toISOString().split('T')[0];

      if (storedData) {
        const parsedData: UsageData = JSON.parse(storedData);
        if (parsedData.date === today) {
          setUsageData(parsedData);
        } else {
          // New day, reset the count
          const newUsageData = { count: THINK_LONGER_LIMIT, date: today };
          setUsageData(newUsageData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsageData));
        }
      } else {
        // No stored data, initialize for today
        const newUsageData = { count: THINK_LONGER_LIMIT, date: today };
        setUsageData(newUsageData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsageData));
      }
    } catch (error) {
        console.error("Could not access localStorage. Think longer limit will not be persisted.", error);
        // Fallback to in-memory state if localStorage is unavailable
         setUsageData({ count: THINK_LONGER_LIMIT, date: new Date().toISOString().split('T')[0] });
    }
    setIsInitialized(true);
  }, []);

  const decrementUses = useCallback(() => {
    setUsageData(prevData => {
      const newCount = Math.max(0, prevData.count - 1);
      const newUsageData = { ...prevData, count: newCount };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsageData));
      } catch (error) {
        console.error("Could not access localStorage to save think longer limit.", error);
      }
      return newUsageData;
    });
  }, []);
  
  const isLimitReached = !isInitialized || usageData.count <= 0;

  return {
    remainingUses: usageData.count,
    decrementUses,
    isLimitReached,
  };
}

    