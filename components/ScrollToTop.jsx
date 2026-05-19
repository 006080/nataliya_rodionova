'use client';

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Мгновенно перемещаем окно в координаты (0, 0) при любой смене страницы
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // Этот компонент ничего не рендерит, он просто выполняет логику
};

export default ScrollToTop;