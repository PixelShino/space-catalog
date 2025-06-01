// components/cursor/CustomCursor.tsx
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export const CustomCursor = () => {
  const cursorSize = 40;
  const dotSize = 8;
  const [isMobile, setIsMobile] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [cursorState, setCursorState] = useState<
    'default' | 'hover' | 'active'
  >('default');
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Плавные значения для анимации
  const cursorXSpring = useSpring(cursorX, {
    damping: 15,
    stiffness: 300,
    mass: 0.1,
  });

  const cursorYSpring = useSpring(cursorY, {
    damping: 15,
    stiffness: 300,
    mass: 0.1,
  });

  const scaleSpring = useSpring(1, { damping: 15, stiffness: 300 });
  const opacitySpring = useSpring(1, { damping: 20, stiffness: 300 });

  // Цвета для разных состояний
  const cursorColors = {
    default: {
      border: 'rgba(255, 255, 255, 0.7)',
      bg: 'rgba(255, 255, 255, 0.1)',
    },
    hover: {
      border: 'rgba(255, 255, 255, 0.9)',
      bg: 'rgba(255, 255, 255, 0.3)',
    },
    active: {
      border: 'rgba(255, 255, 255, 1)',
      bg: 'rgba(255, 255, 255, 0.5)',
    },
  };

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Обработка касаний на мобильных устройствах
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (isMobile) {
        setIsTouching(true);
        const touch = e.touches[0];
        cursorX.set(touch.clientX - cursorSize / 2);
        cursorY.set(touch.clientY - cursorSize / 2);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isMobile && isTouching) {
        const touch = e.touches[0];
        cursorX.set(touch.clientX - cursorSize / 2);
        cursorY.set(touch.clientY - cursorSize / 2);
      }
    };

    const handleTouchEnd = () => {
      if (isMobile) {
        setIsTouching(false);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isTouching]);

  useEffect(() => {
    // Если мобильное устройство, не добавляем обработчики мыши
    if (isMobile) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - cursorSize / 2);
      cursorY.set(e.clientY - cursorSize / 2);
    };

    const handleMouseDown = () => {
      setCursorState('active');
      scaleSpring.set(0.8);
    };

    const handleMouseUp = () => {
      setCursorState((prev) => (prev === 'active' ? 'hover' : 'default'));
      scaleSpring.set(1);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Проверяем интерактивные элементы
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.closest('button, a, input, [data-cursor-hover]') ||
        target.closest('canvas'); // Важно: добавляем canvas для 3D сцены

      if (isInteractive) {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        setCursorState('hover');
        scaleSpring.set(1.5);
        opacitySpring.set(0.8);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;

      // Если ушли с интерактивного элемента и не перешли на его дочерний элемент
      if (
        !relatedTarget ||
        !relatedTarget.closest('button, a, input, [data-cursor-hover], canvas')
      ) {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

        hoverTimeout.current = setTimeout(() => {
          setCursorState('default');
          scaleSpring.set(1);
          opacitySpring.set(1);
        }, 100);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    // Скрываем стандартный курсор только на десктопе
    document.body.style.cursor = 'none';
    document.body.classList.add('custom-cursor-active');

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);

      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

      // Восстанавливаем стандартный курсор
      document.body.style.cursor = '';
      document.body.classList.remove('custom-cursor-active');
    };
  }, [isMobile]);

  // Не отображаем курсор на мобильных устройствах, если нет касания
  if (isMobile && !isTouching) {
    return null;
  }

  return (
    <motion.div
      className='fixed top-0 left-0 z-[9999] rounded-full pointer-events-none mix-blend-difference'
      style={{
        width: cursorSize,
        height: cursorSize,
        translateX: cursorXSpring,
        translateY: cursorYSpring,
        scale: scaleSpring,
        opacity: opacitySpring,
        border: `2px solid ${cursorColors[cursorState].border}`,
        backgroundColor: cursorColors[cursorState].bg,
        filter: 'blur(0.5px)',
      }}
      animate={{
        scale: scaleSpring.get(),
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 15,
        mass: 0.1,
      }}
    >
      <motion.div
        className='absolute bg-white rounded-full'
        style={{
          width: dotSize,
          height: dotSize,
          top: '50%',
          left: '50%',
          translateX: -dotSize / 2,
          translateY: -dotSize / 2,
        }}
        animate={{
          scale: cursorState === 'hover' ? 1.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </motion.div>
  );
};