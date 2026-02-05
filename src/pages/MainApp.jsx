import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, LayoutDashboard, Users, User as UserIcon, LogOut } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useHazardProximity } from '@/hooks/useHazardProximity';
import HazardMap from '@/components/HazardMap';
import HazardAlert from '@/components/HazardAlert';
import LocationStatus from '@/components/LocationStatus';
import Dashboard from '@/pages/Dashboard';
import ReportHazardPage from '@/pages/ReportHazardPage';
import SafetyStatusWidget from '@/components/SafetyStatusWidget';
import ResourceBoard from '@/components/ResourceBoard';
import PostResourceRequest from '@/components/PostResourceRequest';
import CommunityUpdates from '@/components/CommunityUpdates';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useEffect } from 'react';

const MainApp = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { location, loading: locationLoading, error: locationError, permissionStatus, startTracking } = useLocationTracking();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hazards, setHazards] = useState([]);
  const { activeAlert, acknowledgeAlert } = useHazardProximity(location, hazards);
  const [communityView, setCommunityView] = useState('updates');

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    fetchHazards();

    // Subscribe to real-time hazard updates
    const subscription = supabase
      .channel('hazards_realtime')
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

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
    }
  };

  const handleNavigation = (destination) => {
    if (destination === 'map') setActiveTab('map');
    else if (destination === 'report') setActiveTab('report');
    else if (destination === 'safety-status') {
      setActiveTab('community');
      setCommunityView('status');
    }
    else if (destination === 'resources') {
      setActiveTab('community');
      setCommunityView('resources');
    }
  };

  const userLocationArray = location ? [location.lat, location.lng] : null;

  const tabs = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Emergency Alert Overlay */}
      <HazardAlert alert={activeAlert} onAcknowledge={acknowledgeAlert} />

      {/* Location Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <LocationStatus
          location={location}
          loading={locationLoading}
          error={locationError}
          permissionStatus={permissionStatus}
          onEnableTracking={startTracking}
        />
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[calc(100vh-10rem)] p-4"
            >
              <HazardMap userLocation={userLocationArray} hazards={hazards} />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard userLocation={location} onNavigate={handleNavigation} />
            </motion.div>
          )}

          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 pb-24"
            >
              <div className="max-w-4xl mx-auto space-y-6 py-6">
                <h1 className="text-3xl font-bold text-white mb-4">Community Hub</h1>
                
                {/* Sub-tabs */}
                <div className="flex gap-2 bg-white/10 p-2 rounded-xl">
                  <button
                    onClick={() => setCommunityView('updates')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      communityView === 'updates'
                        ? 'bg-white text-purple-900'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Updates
                  </button>
                  <button
                    onClick={() => setCommunityView('status')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      communityView === 'status'
                        ? 'bg-white text-purple-900'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Safety Status
                  </button>
                  <button
                    onClick={() => setCommunityView('resources')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                      communityView === 'resources'
                        ? 'bg-white text-purple-900'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Resources
                  </button>
                </div>

                {communityView === 'updates' && <CommunityUpdates />}
                {communityView === 'status' && <SafetyStatusWidget userLocation={location} />}
                {communityView === 'resources' && (
                  <div className="space-y-6">
                    <PostResourceRequest userLocation={location} onSuccess={fetchHazards} />
                    <ResourceBoard />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 pb-24"
            >
              <div className="max-w-2xl mx-auto space-y-6 py-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <UserIcon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {user?.user_metadata?.full_name || 'User'}
                      </h2>
                      <p className="text-gray-300">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Phone</p>
                      <p className="text-white">{user?.user_metadata?.phone || 'Not provided'}</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Account Created</p>
                      <p className="text-white">
                        {new Date(user?.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ReportHazardPage
                userLocation={location}
                onBack={() => setActiveTab('dashboard')}
                onSuccess={fetchHazards}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/20 z-40">
        <div className="max-w-md mx-auto flex justify-around py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-purple-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default MainApp;