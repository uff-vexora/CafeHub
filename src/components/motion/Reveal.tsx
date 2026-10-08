import React, { useRef, useState, useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type RevealVariant = 'fade-up' | 'fade-down' | 'fade-in' | 'scale-in' | 'clip-up';

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delayMs?: number;
  durationMs?: number;
  threshold?: number;
  className?: string;
  triggerOnce?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'fade-up',
  delayMs = 0,
  durationMs = 600,
  threshold = 0.1,
  className = '',
  triggerOnce = true,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    const el = ref.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold, triggerOnce, reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Variant styles when not visible
  let hiddenTransform = 'none';
  let visibleTransform = 'none';
  let hiddenClip = 'none';
  let visibleClip = 'none';

  switch (variant) {
    case 'fade-up':
      hiddenTransform = 'translate3d(0, 24px, 0)';
      visibleTransform = 'translate3d(0, 0, 0)';
      break;
    case 'fade-down':
      hiddenTransform = 'translate3d(0, -20px, 0)';
      visibleTransform = 'translate3d(0, 0, 0)';
      break;
    case 'scale-in':
      hiddenTransform = 'scale3d(0.95, 0.95, 1)';
      visibleTransform = 'scale3d(1, 1, 1)';
      break;
    case 'clip-up':
      hiddenClip = 'inset(100% 0 0 0)';
      visibleClip = 'inset(0% 0 0 0)';
      break;
    case 'fade-in':
    default:
      hiddenTransform = 'none';
      visibleTransform = 'none';
  }

  const style: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? visibleTransform : hiddenTransform,
    clipPath: variant === 'clip-up' ? (isVisible ? visibleClip : hiddenClip) : undefined,
    transition: `opacity ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms, clip-path ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms`,
    willChange: isVisible ? 'auto' : 'opacity, transform',
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
};
