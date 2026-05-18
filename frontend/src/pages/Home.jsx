import React, { useEffect, useState } from 'react';
import { storyService } from '../services/api';
import StoryCard from '../components/StoryCard';
import './Home.css';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchStories();
  }, [page]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await storyService.getStories(page, 20);
      
      if (page === 1) {
        setStories(data.data);
      } else {
        setStories(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.pagination.page < data.pagination.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load stories. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Top Tech Stories</h1>
        <p>Curated list of the most trending programming discussions, updated automatically.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stories-feed">
        {stories.map(story => (
          <StoryCard key={story._id} story={story} />
        ))}
        
        {loading && (
          <div className="loader-container">
            <Loader2 className="spinner" size={32} />
          </div>
        )}
        
        {!loading && stories.length === 0 && !error && (
          <div className="empty-state">No stories found.</div>
        )}

        {!loading && hasMore && stories.length > 0 && (
          <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
            Load More Stories
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
