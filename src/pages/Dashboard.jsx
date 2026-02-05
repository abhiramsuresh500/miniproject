import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { AlertTriangle, Search, MapPin as MapIcon, Plus, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import CommunityStatusFeed from '@/components/CommunityStatusFeed';
import CommunityUpdates from '@/components/CommunityUpdates';

const severityColors = {
  critical: 'bg-red-500/20 border-red-500 text-red-400',
  high: 'bg-orange-500/20 border-orange-500 text-orange-400',
  medium: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  low: 'bg-green-500/20 border-green-500 text-green-400',
};

const Dashboard = ({ userLocation, onNavigate }) => {
  const { user } = useAuth();
  const [hazards, setHazards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    fetchHazards();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('hazards_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hazards' }, () => {
        fetchHazards();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchHazards = async () => {
    try {
      const { data, error } = await supabase
        .from('hazards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHazards(data || []);
    } catch (error) {
      console.error('Error fetching hazards:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
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

  const hazardsWithDistance = userLocation
    ? hazards.map(hazard => ({
        ...hazard,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          hazard.latitude,
          hazard.longitude
        ),
      }))
    : hazards.map(hazard => ({ ...hazard, distance: null }));

  const filteredHazards = hazardsWithDistance
    .filter(hazard => {
      const matchesSearch = hazard.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || hazard.severity_level === severityFilter;
      
      let matchesDistance = true;
      if (distanceFilter !== 'all' && hazard.distance !== null) {
        if (distanceFilter === '0-1') matchesDistance = hazard.distance <= 1;
        else if (distanceFilter === '1-5') matchesDistance = hazard.distance > 1 && hazard.distance <= 5;
        else if (distanceFilter === '5-10') matchesDistance = hazard.distance > 5 && hazard.distance <= 10;
        else if (distanceFilter === '10+') matchesDistance = hazard.distance > 10;
      }
      
      return matchesSearch && matchesSeverity && matchesDistance;
    })
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

  return (
    <>
      <Helmet>
        <title>Dashboard - SafeZone</title>
        <meta name="description" content="Your safety dashboard with nearby hazards and community updates" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
        <div className="max-w-6xl mx-auto space-y-6 py-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'User'}!
            </h1>
            <p className="text-purple-100">Stay safe and informed with real-time updates</p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Button
              onClick={() => onNavigate('report')}
              className="h-24 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col gap-2"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-semibold">Report Hazard</span>
            </Button>
            <Button
              onClick={() => onNavigate('safety-status')}
              className="h-24 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col gap-2"
            >
              <Shield className="w-6 h-6" />
              <span className="text-sm font-semibold">Safety Status</span>
            </Button>
            <Button
              onClick={() => onNavigate('resources')}
              className="h-24 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col gap-2"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm font-semibold">Resources</span>
            </Button>
            <Button
              onClick={() => onNavigate('map')}
              className="h-24 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col gap-2"
            >
              <MapIcon className="w-6 h-6" />
              <span className="text-sm font-semibold">View Map</span>
            </Button>
          </motion.div>

          {/* Hazards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Nearby Hazards
            </h2>

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hazards..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-300 mb-2">Severity</p>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-2">Distance</p>
                  <select
                    value={distanceFilter}
                    onChange={(e) => setDistanceFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Distances</option>
                    <option value="0-1">0-1 km</option>
                    <option value="1-5">1-5 km</option>
                    <option value="5-10">5-10 km</option>
                    <option value="10+">10+ km</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hazard List */}
            {filteredHazards.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No hazards found matching your filters</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredHazards.map((hazard) => (
                  <motion.div
                    key={hazard.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-2 ${severityColors[hazard.severity_level]}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-white capitalize">
                          {hazard.severity_level} Severity
                        </p>
                        {hazard.distance !== null && (
                          <p className="text-sm text-gray-300">
                            {hazard.distance.toFixed(2)} km away
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => onNavigate('map')}
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white"
                      >
                        <MapIcon className="w-4 h-4 mr-1" />
                        View on Map
                      </Button>
                    </div>
                    <p className="text-sm text-gray-200">{hazard.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Safety radius: {hazard.safety_radius}m
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Community Updates Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <CommunityStatusFeed />
            <CommunityUpdates />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;