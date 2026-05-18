import React, { useContext, useState } from 'react';
import { Bookmark, BookmarkCheck, TrendingUp, Clock, User as UserIcon, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import AuthContext from '../context/AuthContext';
import { storyService } from '../services/api';
import './StoryCard.css';

const StoryCard = ({ story }) => {
  const { user, updateUser } = useContext(AuthContext);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // Check if current user has this story bookmarked
  const isBookmarked = user?.bookmarks?.includes(story._id);

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to bookmark stories!");
      return;
    }

    try {
      setIsBookmarking(true);
      const response = await storyService.toggleBookmark(story._id);
      
      if (response.success) {
        // Update the user context with the new bookmarks array
        updateUser({ bookmarks: response.data });
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <a href={story.url || '#'} target="_blank" rel="noopener noreferrer" className="story-card">
      <div className="story-card-content">
        <h3 className="story-title">{story.title}</h3>
        <div className="story-meta">
          <span className="meta-item points">
            <TrendingUp size={14} /> {story.points} points
          </span>
          <span className="meta-item">
            <UserIcon size={14} /> {story.author}
          </span>
          <span className="meta-item">
            <Clock size={14} /> {formatDistanceToNow(new Date(story.postedAt))} ago
          </span>
          {story.domain && (
            <span className="meta-item domain">
              <ExternalLink size={14} /> {story.domain}
            </span>
          )}
        </div>
      </div>
      
      <button 
        className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
        onClick={handleBookmarkToggle}
        disabled={isBookmarking}
        title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
      >
        {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
      </button>
    </a>
  );
};

export default StoryCard;
