import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ReportHazardForm from '@/components/ReportHazardForm';
import { Button } from '@/components/ui/button';

const ReportHazardPage = ({ userLocation, onBack, onSuccess }) => {
  return (
    <>
      <Helmet>
        <title>Report Hazard - SafeZone</title>
        <meta name="description" content="Report a hazard or emergency situation to alert your community" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto py-8"
        >
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/10 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          <ReportHazardForm userLocation={userLocation} onSuccess={onSuccess} />
        </motion.div>
      </div>
    </>
  );
};

export default ReportHazardPage;