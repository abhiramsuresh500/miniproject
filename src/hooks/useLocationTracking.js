import { useState, useEffect, useRef } from 'react';

export const useLocationTracking = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const watchIdRef = useRef(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setPermissionStatus('granted');
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setPermissionStatus('denied');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Watch position continuously (update every 5 seconds)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setPermissionStatus('granted');
        setError(null);
      },
      (err) => {
        setError(err.message);
        setPermissionStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 5000,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    startTracking();

    return () => {
      stopTracking();
    };
  }, []);

  return {
    location,
    loading,
    error,
    permissionStatus,
    startTracking,
    stopTracking,
  };
};