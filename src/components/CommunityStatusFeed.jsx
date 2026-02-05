import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, HelpCircle, MapPin, Clock } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const statusConfig = {
  safe: {
    icon: Shield,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
  },
  unsafe: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/30',
  },
  need_help: {
    icon: HelpCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
  },
};

const CommunityStatusFeed = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    fetchStatuses();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('safety_status_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_status' }, (payload) => {
        fetchStatuses();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('safety_status')
        .select(`
          *,
          users (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setStatuses(data || []);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
        <p className="text-gray-300 text-center">Loading community updates...</p>
      </div>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
        <p className="text-yellow-400 text-center">Database connection not configured.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Community Safety Updates</h2>
      
      {statuses.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No status updates yet</p>
      ) : (
        <div className="space-y-3">
          {statuses.map((status) => {
            const config = statusConfig[status.status];
            const Icon = config.icon;

            return (
              <motion.div
                key={status.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.color} mt-1`} />
                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {status.users?.full_name || 'Community Member'}
                    </p>
                    <p className={`text-sm capitalize ${config.color}`}>
                      Status: {status.status.replace('_', ' ')}
                    </p>
                    {status.location_lat && status.location_lng && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {status.location_lat.toFixed(4)}, {status.location_lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(status.created_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default CommunityStatusFeed;