'use client';

import { useState, useEffect, useRef } from 'react';
import FavoritesDropdownWrapper from './FavoritesDropdownWrapper';
import CartDropdown from './CartDropdown';

interface ButtonsWrapperProps {
  className?: string;
}

export default function ButtonsWrapper({ className = '' }: ButtonsWrapperProps) {
  const [isCartSticky, setIsCartSticky] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);

  // Отслеживание скролла для sticky поведения корзины
  useEffect(() => {
    const handleScroll = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const shouldBeSticky = rect.top <= 20; // Небольшой отступ сверху
        setIsCartSticky(shouldBeSticky);
      }
    };

    // Добавляем throttling для лучшей производительности
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, []);

  return (
    <>
      {/* Основная обертка для кнопок */}
      <div 
        ref={wrapperRef}
        className={`flex items-center gap-2 sm:gap-3 ${className}`}
      >
        {/* Кнопка избранного - всегда остается на месте */}
        <div className="relative transform hover:scale-105 transition-transform duration-200">
          <FavoritesDropdownWrapper />
        </div>
        
        {/* Кнопка корзины - может быть sticky */}
        <div 
          ref={cartRef}
          className={`relative transition-all duration-300 ease-in-out ${
            isCartSticky ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <CartDropdown />
        </div>
      </div>

      {/* Sticky версия кнопки корзины */}
      {isCartSticky && (
        <div className="fixed top-6 right-6 z-50 sm:top-8 sm:right-8 md:top-12 md:right-12">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
            <CartDropdown />
          </div>
        </div>
      )}
    </>
  );
}