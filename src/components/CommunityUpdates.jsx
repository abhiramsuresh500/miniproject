import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const CommunityUpdates = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('community_posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          users (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load community updates',
        variant: 'destructive',
      });
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

  const postTypeColors = {
    update: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    resource_request: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    shelter_info: 'bg-green-500/20 border-green-500/30 text-green-400',
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
        <p className="text-gray-300 text-center">Loading community updates...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
    >
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Community Updates
      </h2>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No community posts yet</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl border ${postTypeColors[post.post_type] || 'bg-white/5 border-white/10'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-white">
                      {post.users?.full_name || 'Community Member'}
                    </p>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(post.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 capitalize">
                    {post.post_type?.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-200">{post.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CommunityUpdates;