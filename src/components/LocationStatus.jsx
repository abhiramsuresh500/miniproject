import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LocationStatus = ({ location, loading, error, permissionStatus, onEnableTracking }) => {
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
          <span className="text-blue-100">Getting your location...</span>
        </div>
      </motion.div>
    );
  }

  if (error || permissionStatus === 'denied') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-100 font-medium">Location access denied</p>
              <p className="text-red-200 text-sm">Please enable location to use this app</p>
            </div>
          </div>
          <Button
            onClick={onEnableTracking}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Enable
          </Button>
        </div>
      </motion.div>
    );
  }

  if (location) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-green-100 font-medium">Location tracking active</p>
            <p className="text-green-200 text-sm">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default LocationStatus;