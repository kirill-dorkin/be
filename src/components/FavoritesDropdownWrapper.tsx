"use client";

import { useState, useEffect } from 'react';
import FavoritesDropdown from './FavoritesDropdown';
import FavoritesSheet from './FavoritesSheet';

export default function FavoritesDropdownWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  // Определение мобильного устройства
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // На мобильных устройствах используем FavoritesSheet, на десктопе - FavoritesDropdown
  if (isMobile) {
    return <FavoritesSheet />;
  }

  return <FavoritesDropdown />;
}