import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ArrowLink } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({
  title,
  movies,
  onPlay,
  onOpenDetail,
  isInMyList,
  onToggleMyList,
  isTall = false,
  isTop10 = false,
  onExplore = null
}) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const onScrollCheck = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
  };

  useEffect(() => {
    onScrollCheck();
    const handleResize = () => onScrollCheck();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const handleScroll = (direction) => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const scrollAmount = clientWidth * 0.75;
    const targetScroll = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

    rowRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    setTimeout(onScrollCheck, 350);
  };

  return (
    <div className={`netflix-movie-row ${isTall ? 'tall-row' : ''} ${isTop10 ? 'top10-row' : ''}`}>
      {/* Row Header */}
      <div className="row-header" onClick={onExplore ? onExplore : undefined} style={{ cursor: onExplore ? 'pointer' : 'default' }}>
        <h2 className="row-title">
          <span>{title}</span>
          <span className="row-explore-more">
            Explore All <ArrowLink size={14} className="explore-chevron" />
          </span>
        </h2>
      </div>

      {/* Row Slider Track Wrapper */}
      <div className="row-slider-wrapper">
        {/* Left Arrow Button */}
        <button
          className={`row-nav-arrow arrow-left ${canScrollLeft ? 'visible' : 'hidden'}`}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
          disabled={!canScrollLeft}
        >
          <ChevronLeft size={34} />
        </button>

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          className="row-cards-track"
          onScroll={onScrollCheck}
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={`${movie.id}-${index}`}
              movie={movie}
              onPlay={onPlay}
              onOpenDetail={onOpenDetail}
              isInMyList={isInMyList}
              onToggleMyList={onToggleMyList}
              isTall={isTall}
              rank={isTop10 ? index + 1 : null}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          className={`row-nav-arrow arrow-right ${canScrollRight ? 'visible' : 'hidden'}`}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
          disabled={!canScrollRight}
        >
          <ChevronRight size={34} />
        </button>
      </div>
    </div>
  );
}
