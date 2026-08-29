/**
 * Ultra-smooth 60fps circular expansion theme transition using the View Transition API.
 * Gracefully falls back for browsers without View Transition support.
 */
export function executeThemeTransition(targetDark, event, callback) {
  if (typeof window === 'undefined') return;

  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  if (isCurrentlyDark === targetDark) return;

  const updateDOM = () => {
    if (targetDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campusrag_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campusrag_theme', 'light');
    }
    if (callback) callback(targetDark);
  };

  // If View Transitions API is not supported or user prefers reduced motion, fallback gracefully
  if (
    !document.startViewTransition ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    updateDOM();
    return;
  }

  // Calculate the click origin coordinates
  let x = window.innerWidth / 2;
  let y = 0;

  if (event) {
    const rect = event.currentTarget?.getBoundingClientRect?.();
    if (rect) {
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (event.clientX !== undefined && event.clientY !== undefined) {
      x = event.clientX;
      y = event.clientY;
    }
  }

  // Calculate distance to the farthest corner with a 60px safe padding
  const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  const maxDimX = Math.max(x, width - x);
  const maxDimY = Math.max(y, height - y);
  const endRadius = Math.ceil(Math.hypot(maxDimX, maxDimY)) + 60;

  const transition = document.startViewTransition(() => {
    updateDOM();
  });

  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`,
    ];

    document.documentElement.animate(
      {
        clipPath: clipPath,
      },
      {
        duration: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  });
}
