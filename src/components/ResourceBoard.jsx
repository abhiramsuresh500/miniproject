import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Package, Home, MapPin, Clock, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const resourceIcons = {
  blood: { icon: Droplet, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  supplies: { icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  shelter: { icon: Home, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' },
};

const urgencyColors = {
  critical: 'text-red-400 bg-red-500/20 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
};

const ResourceBoard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('resource_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resource_requests' }, () => {
        fetchResources();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resource_requests')
        .select(`
          *,
          users (full_name, phone, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resource requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const typeMatch = filter === 'all' || resource.resource_type === filter;
    const urgencyMatch = urgencyFilter === 'all' || resource.urgency === urgencyFilter;
    return typeMatch && urgencyMatch;
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
        <p className="text-gray-300 text-center">Loading resources...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Resource Requests</h2>
        <Filter className="w-5 h-5 text-gray-400" />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-300 mb-2">Resource Type</p>
          <div className="flex gap-2 flex-wrap">
            {['all', 'blood', 'supplies', 'shelter'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  filter === type
                    ? 'bg-white text-purple-900'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-300 mb-2">Urgency</p>
          <div className="flex gap-2 flex-wrap">
            {['all', 'critical', 'high', 'medium'].map((urgency) => (
              <button
                key={urgency}
                onClick={() => setUrgencyFilter(urgency)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  urgencyFilter === urgency
                    ? 'bg-white text-purple-900'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource List */}
      {filteredResources.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No resource requests found</p>
      ) : (
        <div className="space-y-4">
          {filteredResources.map((resource) => {
            const config = resourceIcons[resource.resource_type] || resourceIcons.supplies;
            const Icon = config.icon;

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-6 h-6 ${config.color} mt-1`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-white capitalize">
                          {resource.resource_type?.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-300">
                          Requested by {resource.users?.full_name || 'Community Member'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${urgencyColors[resource.urgency] || urgencyColors.medium}`}>
                        {resource.urgency?.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-200 mb-3">{resource.description}</p>

                    {resource.location_lat && resource.location_lng && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {resource.location_lat.toFixed(4)}, {resource.location_lng.toFixed(4)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(resource.created_at)}</span>
                      </div>
                      {resource.users?.phone && (
                        <a
                          href={`tel:${resource.users.phone}`}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Contact: {resource.users.phone}
                        </a>
                      )}
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

export default ResourceBoard;