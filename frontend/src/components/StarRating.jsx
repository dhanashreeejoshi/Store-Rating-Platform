import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  interactive = false,
  onRate,
  size = 18,
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="star-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= Math.round(displayRating);
        return (
          <span
            key={starValue}
            className={interactive ? 'star-interactive' : ''}
            onClick={() => interactive && onRate && onRate(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              display: 'inline-flex',
              padding: '1px',
            }}
            title={interactive ? `Rate ${starValue} Star${starValue > 1 ? 's' : ''}` : undefined}
          >
            <Star
              size={size}
              className={isFilled ? 'star-filled' : 'star-empty'}
              fill={isFilled ? '#fbbf24' : 'none'}
              stroke={isFilled ? '#fbbf24' : '#cbd5e1'}
              strokeWidth={1.5}
            />
          </span>
        );
      })}
      {showValue && (
        <span style={{ marginLeft: '6px', fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
