import { useEffect, useRef } from 'react';

export function useLazyVideo(dependency) {
  const containerRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '200px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const dataSrc = video.getAttribute('data-src');
          if (dataSrc) {
            video.src = dataSrc;
            video.removeAttribute('data-src');
            video.load();
            observer.unobserve(video);
          }
        }
      });
    }, options);

    const currentContainer = containerRef.current;
    if (currentContainer) {
      const videos = currentContainer.querySelectorAll('video[data-src]');
      videos.forEach(video => observer.observe(video));
    }

    // Cleanup observer on unmount
    return () => {
      if (currentContainer) {
        const videos = currentContainer.querySelectorAll('video');
        videos.forEach(video => observer.unobserve(video));
      }
    };
  }, [dependency]);

  return containerRef;
}
