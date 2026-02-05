import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, HelpCircle, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const statusOptions = [
  {
    value: 'safe',
    label: 'Safe',
    icon: Shield,
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-700',
    desc: 'I am safe and secure',
  },
  {
    value: 'unsafe',
    label: 'Unsafe',
    icon: AlertTriangle,
    color: 'bg-yellow-500',
    gradient: 'from-yellow-500 to-yellow-700',
    desc: 'Situation is concerning',
  },
  {
    value: 'need_help',
    label: 'Need Help',
    icon: HelpCircle,
    color: 'bg-red-500',
    gradient: 'from-red-500 to-red-700',
    desc: 'I need assistance',
  },
];

const SafetyStatusWidget = ({ userLocation }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to share your status.',
        variant: 'destructive',
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: 'Location Required',
        description: 'Please enable location tracking to share your status',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('safety_status')
        .insert([
          {
            user_id: user.id,
            status: status,
            location_lat: userLocation.lat,
            location_lng: userLocation.lng,
          },
        ]);

      if (error) throw error;

      setCurrentStatus(status);
      toast({
        title: 'Status Updated',
        description: `Your status has been shared with the community as "${statusOptions.find(s => s.value === status)?.label}"`,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Share Your Safety Status</h2>
      <p className="text-gray-300 mb-6">Let your community know how you're doing</p>

      <div className="space-y-3">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = currentStatus === option.value;

          return (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateStatus(option.value)}
              disabled={loading}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `bg-gradient-to-r ${option.gradient} border-white shadow-lg`
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-white" />
                  <div className="text-left">
                    <p className="font-semibold text-white">{option.label}</p>
                    <p className="text-sm text-gray-300">{option.desc}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-6 h-6 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {currentStatus && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl"
        >
          <p className="text-green-100 text-sm">
            ✓ Status shared at {new Date().toLocaleTimeString()}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SafetyStatusWidget;