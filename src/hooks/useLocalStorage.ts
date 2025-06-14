
'use client';
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initialValue directly to useState so the server and initial client render match.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // useEffect to update the state with the value from localStorage on the client side, after mount.
  useEffect(() => {
    // This check is still good practice for client-only code.
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none, use initialValue (which might be different from the initial state if key changes, though unlikely here)
      // If item is null, it means nothing is in localStorage for this key, so we should stick with initialValue
      // or the current state if it was set by `setValue` before this effect ran (e.g. if key changes)
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      } else {
        // If nothing in localStorage, ensure state is `initialValue`
        // This handles cases where initialValue might change over component lifecycle, though rare for this hook.
        // More importantly, it ensures if localStorage is empty, we use the provided default.
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      // Fallback to initial value on error during read
      setStoredValue(initialValue);
    }
  // Only re-run if key or initialValue change.
  // Typically, key and initialValue are stable for a given useLocalStorage instance.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, initialValue]);


  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
      return;
    }

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
