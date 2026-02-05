import { useState, useEffect } from 'react';

export const useHazardProximity = (userLocation, hazards = []) => {
  const [activeAlert, setActiveAlert] = useState(null);
  const [acknowledgedHazards, setAcknowledgedHazards] = useState(new Set());

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    if (!userLocation || !hazards.length) {
      return;
    }

    // Check each hazard for proximity
    for (const hazard of hazards) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        hazard.latitude,
        hazard.longitude
      );

      // If within safety radius and not already acknowledged
      if (distance <= hazard.safety_radius && !acknowledgedHazards.has(hazard.id)) {
        setActiveAlert({
          ...hazard,
          distance: distance,
        });
        
        // Play alert sound (if browser supports)
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryy3gsBSp+zPLaizsIDGS56+mhUBAKTKXh8bllHAU2jdXzzn0vBSF1xO/glEILElyx6OyrWBgIT6Hd8sV0KAUufMny2Ik4CA1iu+zpoVEQCkyk4fG5Zh');
          audio.play().catch(() => {});
        } catch (e) {
          // Silent fail for audio
        }
        
        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        break; // Only show one alert at a time
      }
    }
  }, [userLocation, hazards, acknowledgedHazards]);

  const acknowledgeAlert = () => {
    if (activeAlert) {
      setAcknowledgedHazards(prev => new Set([...prev, activeAlert.id]));
      setActiveAlert(null);
    }
  };

  const resetAcknowledgements = () => {
    setAcknowledgedHazards(new Set());
  };

  return {
    activeAlert,
    acknowledgeAlert,
    resetAcknowledgements,
  };
};