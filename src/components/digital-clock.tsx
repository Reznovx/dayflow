'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client
    setTime(new Date());
    
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="text-xl font-medium text-foreground">
      {time ? format(time, 'HH:mm:ss') : '00:00:00'}
    </div>
  );
}
