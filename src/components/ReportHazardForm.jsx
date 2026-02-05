import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const severityLevels = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500', desc: 'Immediate danger to life' },
  { value: 'high', label: 'High', color: 'bg-orange-500', desc: 'Serious threat' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500', desc: 'Moderate concern' },
  { value: 'low', label: 'Low', color: 'bg-green-500', desc: 'Minor issue' },
];

const ReportHazardForm = ({ userLocation, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    latitude: userLocation?.lat || '',
    longitude: userLocation?.lng || '',
    severity: 'medium',
    safety_radius: 500,
    description: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmergencySignal = async () => {
    const emergencyData = {
      ...formData,
      severity: 'critical',
      description: formData.description || 'EMERGENCY SIGNAL - Immediate assistance required!',
    };

    setFormData(emergencyData);
    await handleSubmit(null, emergencyData);
  };

  const handleSubmit = async (e, emergencyData = null) => {
    if (e) e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to report a hazard.',
        variant: 'destructive',
      });
      return;
    }

    const dataToSubmit = emergencyData || formData;

    if (!dataToSubmit.latitude || !dataToSubmit.longitude) {
      toast({
        title: 'Location Required',
        description: 'Please provide a valid location',
        variant: 'destructive',
      });
      return;
    }

    if (!dataToSubmit.description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please provide a description of the hazard',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('hazards')
        .insert([
          {
            user_id: user.id,
            latitude: parseFloat(dataToSubmit.latitude),
            longitude: parseFloat(dataToSubmit.longitude),
            severity: dataToSubmit.severity,
            safety_radius: parseInt(dataToSubmit.safety_radius),
            description: dataToSubmit.description,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: emergencyData ? 'Emergency Signal Sent!' : 'Hazard Reported Successfully',
        description: 'Your report has been submitted to the community.',
      });

      // Reset form
      setFormData({
        latitude: userLocation?.lat || '',
        longitude: userLocation?.lng || '',
        severity: 'medium',
        safety_radius: 500,
        description: '',
      });

      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error('Error reporting hazard:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Could not save hazard report.',
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
      <h2 className="text-2xl font-bold text-white mb-6">Report Hazard</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Latitude
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="0.000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0.000000"
            />
          </div>
        </div>

        {/* Severity Level */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Severity Level
          </label>
          <div className="grid grid-cols-2 gap-3">
            {severityLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData({ ...formData, severity: level.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.severity === level.value
                    ? `${level.color} border-white shadow-lg scale-105`
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${level.color}`} />
                  <span className="font-semibold text-white">{level.label}</span>
                </div>
                <p className="text-xs text-gray-300">{level.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Safety Radius (meters)
          </label>
          <input
            type="number"
            name="safety_radius"
            value={formData.safety_radius}
            onChange={handleChange}
            min="50"
            step="50"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="mt-1 text-sm text-gray-400">Current: {formData.safety_radius}m</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Describe the hazard in detail..."
          />
        </div>

        {/* Emergency Signal Button */}
        <Button
          type="button"
          onClick={handleEmergencySignal}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
        >
          <Radio className="w-6 h-6 mr-2" />
          EMERGENCY SIGNAL
        </Button>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </motion.div>
  );
};

export default ReportHazardForm;