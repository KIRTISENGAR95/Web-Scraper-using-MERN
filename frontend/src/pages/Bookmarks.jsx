import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { storyService } from '../services/api';
import StoryCard from '../components/StoryCard';
import './Home.css'; // Reusing Home.css for consistent layout
import { Loader2 } from 'lucide-react';

const Bookmarks = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if user is defined (auth loading is complete)
    if (!authLoading && user) {
      fetchBookmarkedStories();
    }
  }, [user, authLoading]);

  // Sync view if a user removes a bookmark while on this page
  useEffect(() => {
    if (user && stories.length > 0) {
      // Keep only stories that are still present in the user's bookmark array
      setStories((prev) =>
        prev.filter((story) => user.bookmarks.includes(story._id))
      );
    }
  }, [user?.bookmarks]);

  const fetchBookmarkedStories = async () => {
    try {
      setLoading(true);
      const data = await storyService.getBookmarkedStories();
      setStories(data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load bookmarked stories.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Wait for Auth Context to finish checking localStorage
  if (authLoading) {
    return (
      <div className="loader-container" style={{ marginTop: '5rem' }}>
        <Loader2 className="spinner" size={32} />
      </div>
    );
  }

  // 2. Protected access: redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>My Bookmarks</h1>
        <p>Your personal collection of saved Hacker News stories.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stories-feed">
        {stories.map((story) => (
          <StoryCard key={story._id} story={story} />
        ))}

        {loading && (
          <div className="loader-container">
            <Loader2 className="spinner" size={32} />
          </div>
        )}

        {!loading && stories.length === 0 && !error && (
          <div className="empty-state">
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>No bookmarks yet</h3>
            <p style={{ margin: 0 }}>You haven't bookmarked any stories yet. Go to the Home page to find some!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
