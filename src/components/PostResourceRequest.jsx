import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Package, Home, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const resourceTypes = [
  { value: 'blood', label: 'Blood Donation', icon: Droplet, color: 'bg-red-500' },
  { value: 'supplies', label: 'Supplies', icon: Package, color: 'bg-blue-500' },
  { value: 'shelter', label: 'Shelter', icon: Home, color: 'bg-green-500' },
];

const urgencyLevels = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
];

const PostResourceRequest = ({ userLocation, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    resource_type: 'supplies',
    description: '',
    urgency: 'medium',
    location_lat: userLocation?.lat || '',
    location_lng: userLocation?.lng || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to post a request.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please describe what you need',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('resource_requests')
        .insert([
          {
            user_id: user.id,
            resource_type: formData.resource_type,
            description: formData.description,
            urgency: formData.urgency,
            location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
            location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: 'Request Posted',
        description: 'Your resource request has been shared with the community',
      });

      // Reset form
      setFormData({
        resource_type: 'supplies',
        description: '',
        urgency: 'medium',
        location_lat: userLocation?.lat || '',
        location_lng: userLocation?.lng || '',
      });

      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error('Submission failed:', error);
      toast({
        title: 'Submission Failed',
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
      <h2 className="text-2xl font-bold text-white mb-6">Request Resources</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Resource Type */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Resource Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {resourceTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, resource_type: type.value })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.resource_type === type.value
                      ? `${type.color} border-white shadow-lg scale-105`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-6 h-6 text-white mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">{type.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="4"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe what you need in detail..."
          />
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Urgency Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {urgencyLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData({ ...formData, urgency: level.value })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData.urgency === level.value
                    ? `${level.color} border-white shadow-lg scale-105`
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <p className="text-sm text-white font-semibold">{level.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.location_lat}
              onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={formData.location_lng}
              onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Send className="w-5 h-5 mr-2" />
          {loading ? 'Posting...' : 'Post Request'}
        </Button>
      </form>
    </motion.div>
  );
};

export default PostResourceRequest;