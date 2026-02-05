import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const severityConfig = {
  critical: {
    color: 'red',
    bgGradient: 'from-red-600 to-red-800',
    borderColor: 'border-red-500',
    textColor: 'text-red-100',
    actions: 'Evacuate immediately! Seek shelter now!',
  },
  high: {
    color: 'orange',
    bgGradient: 'from-orange-600 to-orange-800',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-100',
    actions: 'Stay alert. Prepare to evacuate if necessary.',
  },
  medium: {
    color: 'yellow',
    bgGradient: 'from-yellow-600 to-yellow-800',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-100',
    actions: 'Exercise caution. Monitor the situation.',
  },
  low: {
    color: 'green',
    bgGradient: 'from-green-600 to-green-800',
    borderColor: 'border-green-500',
    textColor: 'text-green-100',
    actions: 'Stay informed. No immediate action required.',
  },
};

const HazardAlert = ({ alert, onAcknowledge }) => {
  const { toast } = useToast();
  const config = severityConfig[alert?.severity_level] || severityConfig.medium;

  useEffect(() => {
    // Show desktop notification if permitted
    if (alert && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ Hazard Alert!', {
        body: `${alert.severity_level.toUpperCase()}: You are entering a danger zone. ${alert.description}`,
        icon: '/hazard-icon.png',
        requireInteraction: true,
        tag: `hazard-${alert.id}`,
      });
    }
  }, [alert]);

  const handleGetHelp = () => {
    toast({
      title: 'Emergency Services',
      description: '🚧 This feature isn\'t implemented yet—but don\'t worry! You can request it in your next prompt! 🚀',
    });
  };

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className={`relative w-full max-w-md bg-gradient-to-br ${config.bgGradient} rounded-2xl shadow-2xl border-2 ${config.borderColor} overflow-hidden`}
          >
            {/* Animated border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            
            {/* Header */}
            <div className="relative p-6 border-b border-white/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase">
                      {alert.severity_level} Alert
                    </h2>
                    <p className="text-sm text-white/80">Danger Zone Entered</p>
                  </div>
                </div>
                <button
                  onClick={onAcknowledge}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative p-6 space-y-4">
              <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                <p className={`font-semibold ${config.textColor} mb-2`}>Description:</p>
                <p className="text-white">{alert.description}</p>
              </div>

              <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                <p className={`font-semibold ${config.textColor} mb-2`}>
                  Distance from Hazard:
                </p>
                <div className="flex items-center gap-2 text-white">
                  <Navigation className="w-5 h-5" />
                  <span className="text-2xl font-bold">
                    {(alert.distance / 1000).toFixed(2)} km
                  </span>
                </div>
              </div>

              <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                <p className={`font-semibold ${config.textColor} mb-2`}>
                  Recommended Actions:
                </p>
                <p className="text-white font-medium">{config.actions}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="relative p-6 pt-0 space-y-3">
              <Button
                onClick={handleGetHelp}
                className="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Phone className="w-5 h-5 mr-2" />
                Get Emergency Help
              </Button>
              
              <Button
                onClick={onAcknowledge}
                className="w-full bg-black/30 hover:bg-black/40 text-white font-semibold py-3 rounded-xl backdrop-blur-sm transition-all"
              >
                Acknowledge & Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HazardAlert;