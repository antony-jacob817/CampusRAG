/**
 * Instant Hardware-Accelerated Smooth Glide Scroll
 * Immediately initiates native GPU compositor smooth scroll with zero delay or hitch.
 */
export function glideScrollTo(targetId, offset = 75) {
  if (typeof window === 'undefined') return;

  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  const elementPosition = targetElement.getBoundingClientRect().top;
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
  const targetPosition = elementPosition + currentScroll - offset;

  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: 'smooth',
  });
}
