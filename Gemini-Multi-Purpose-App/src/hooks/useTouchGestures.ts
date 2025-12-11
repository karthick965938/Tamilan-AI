import { useRef, useEffect, useCallback } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface TapGesture {
  x: number;
  y: number;
  timestamp: number;
}

interface TouchGestureOptions {
  onSwipe?: (gesture: SwipeGesture) => void;
  onTap?: (gesture: TapGesture) => void;
  onDoubleTap?: (gesture: TapGesture) => void;
  onLongPress?: (gesture: TapGesture) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const {
    onSwipe,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;

  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchEndRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const lastTapRef = useRef<TapGesture | null>(null);
  const doubleTapTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (doubleTapTimerRef.current) {
      window.clearTimeout(doubleTapTimerRef.current);
      doubleTapTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    touchStartRef.current = touchPoint;
    touchEndRef.current = null;

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = window.setTimeout(() => {
        if (touchStartRef.current) {
          onLongPress({
            x: touchStartRef.current.x,
            y: touchStartRef.current.y,
            timestamp: touchStartRef.current.timestamp,
          });
        }
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    // Clear long press timer on move
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = event.touches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback((_event: TouchEvent) => {
    clearTimers();

    if (!touchStartRef.current) return;

    const endPoint = touchEndRef.current || {
      x: touchStartRef.current.x,
      y: touchStartRef.current.y,
      timestamp: Date.now(),
    };

    const deltaX = endPoint.x - touchStartRef.current.x;
    const deltaY = endPoint.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endPoint.timestamp - touchStartRef.current.timestamp;

    // Check for swipe gesture
    if (distance > swipeThreshold && onSwipe) {
      const velocity = distance / duration;
      let direction: SwipeGesture['direction'];

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      onSwipe({
        direction,
        distance,
        velocity,
        duration,
      });
    } 
    // Check for tap gesture (small movement, short duration)
    else if (distance < 10 && duration < 300) {
      const tapGesture: TapGesture = {
        x: touchStartRef.current.x,
        y: touchStartRef.current.y,
        timestamp: touchStartRef.current.timestamp,
      };

      // Check for double tap
      if (onDoubleTap && lastTapRef.current) {
        const timeSinceLastTap = tapGesture.timestamp - lastTapRef.current.timestamp;
        const distanceFromLastTap = Math.sqrt(
          Math.pow(tapGesture.x - lastTapRef.current.x, 2) +
          Math.pow(tapGesture.y - lastTapRef.current.y, 2)
        );

        if (timeSinceLastTap < doubleTapDelay && distanceFromLastTap < 50) {
          onDoubleTap(tapGesture);
          lastTapRef.current = null;
          return;
        }
      }

      // Single tap
      if (onTap) {
        // Delay single tap to check for double tap
        if (onDoubleTap) {
          doubleTapTimerRef.current = window.setTimeout(() => {
            onTap(tapGesture);
          }, doubleTapDelay);
        } else {
          onTap(tapGesture);
        }
      }

      lastTapRef.current = tapGesture;
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [onSwipe, onTap, onDoubleTap, swipeThreshold, doubleTapDelay]);

  const attachGestures = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearTimers();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return { attachGestures };
};

// Hook for detecting pinch-to-zoom gestures
export const usePinchZoom = (
  onPinch?: (scale: number, center: { x: number; y: number }) => void
) => {
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2) {
      const distance = getDistance(event.touches[0], event.touches[1]);
      initialDistanceRef.current = distance;
      initialScaleRef.current = 1;
    }
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2 && initialDistanceRef.current && onPinch) {
      event.preventDefault();
      
      const currentDistance = getDistance(event.touches[0], event.touches[1]);
      const scale = currentDistance / initialDistanceRef.current;
      const center = getCenter(event.touches[0], event.touches[1]);

      onPinch(scale, center);
    }
  }, [onPinch]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (event.touches.length < 2) {
      initialDistanceRef.current = null;
      initialScaleRef.current = 1;
    }
  }, []);

  const attachPinchGestures = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { attachPinchGestures };
};