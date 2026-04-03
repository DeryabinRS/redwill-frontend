import React, { useEffect, useRef, useState, useCallback } from 'react';
import './PcbTracesAnimation.css';

// ==================== TYPES ====================

export interface PcbTracesAnimationProps {
  /** Максимальное количество дорожек (по умолчанию: 30) */
  maxTraces?: number;
  /** Цвет основных дорожек (по умолчанию: '#e63946') */
  traceColor?: string;
  /** Цвет свечения дорожек (по умолчанию: '#ff6b6b') */
  glowColor?: string;
  /** Колбэк, вызываемый при завершении анимации */
  onComplete?: () => void;
  /** Дополнительные CSS-классы для контейнера */
  className?: string;
  /** Шаг сетки для привязки точек (по умолчанию: 20) */
  gridStep?: number;
  children?: React.ReactNode;
}

interface Point {
  x: number;
  y: number;
}

interface TraceData {
  points: Point[];
  endX: number;
  endY: number;
}

interface AnimationState {
  traceCount: number;
  isSpawning: boolean;
  timeouts: ReturnType<typeof setTimeout>[];
}

// ==================== COMPONENT ====================

const PcbTracesAnimation: React.FC<PcbTracesAnimationProps> = ({
  maxTraces = 30,
  traceColor = 'rgb(255, 107, 107, 0.5)',
  glowColor = '#ff6b6b',
  onComplete,
  className = '',
  gridStep = 20,
  children,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Реф для мутабельного состояния анимации
  const stateRef = useRef<AnimationState>({
    traceCount: 0,
    isSpawning: true,
    timeouts: [],
  });

  // ==================== UTILS ====================

  const rand = useCallback((min: number, max: number): number => 
    Math.floor(Math.random() * (max - min + 1)) + min, []);

  const snap = useCallback((value: number, step: number = gridStep): number => 
    Math.round(value / step) * step, [gridStep]);

  // ==================== PATH GENERATION ====================

  const generateTrace = useCallback((width: number, height: number, step: number): TraceData => {
    const side = rand(0, 3); // 0:top, 1:right, 2:bottom, 3:left
    let startX: number, startY: number;

    switch (side) {
      case 0: // top
        startX = snap(rand(0, Math.floor(width / step)) * step, step);
        startY = -step * 2;
        break;
      case 1: // right
        startX = width + step * 2;
        startY = snap(rand(0, Math.floor(height / step)) * step, step);
        break;
      case 2: // bottom
        startX = snap(rand(0, Math.floor(width / step)) * step, step);
        startY = height + step * 2;
        break;
      case 3: // left
        startX = -step * 2;
        startY = snap(rand(0, Math.floor(height / step)) * step, step);
        break;
      default:
        startX = 0;
        startY = 0;
    }

    const endX = snap(rand(Math.floor(width * 0.1), Math.floor(width * 0.9)), step);
    const endY = snap(rand(Math.floor(height * 0.1), Math.floor(height * 0.9)), step);
    const points: Point[] = [{ x: startX, y: startY }];

    let cx = startX;
    let cy = startY;
    const segments = rand(2, 4);

    for (let i = 0; i < segments; i++) {
      if (i === segments - 1) {
        // Финальный сегмент к цели
        if (Math.random() > 0.5) {
          points.push({ x: endX, y: cy });
          points.push({ x: endX, y: endY });
        } else {
          points.push({ x: cx, y: endY });
          points.push({ x: endX, y: endY });
        }
        break;
      }

      const dir = Math.random() > 0.5;
      const dist = snap(rand(60, 220), step);
      
      if (dir) {
        cx += (Math.random() > 0.5 ? 1 : -1) * dist;
      } else {
        cy += (Math.random() > 0.5 ? 1 : -1) * dist;
      }

      // Ограничиваем координаты
      cx = Math.max(-step * 4, Math.min(width + step * 4, cx));
      cy = Math.max(-step * 4, Math.min(height + step * 4, cy));
      points.push({ x: cx, y: cy });
    }

    return { points, endX, endY };
  }, [rand, snap]);

  const pointsToPath = useCallback((pts: Point[]): string => 
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '), []);

  const calculatePathLength = useCallback((pts: Point[]): number => {
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
  }, []);

  // ==================== SVG ELEMENTS ====================

  const createTrace = useCallback((svg: SVGSVGElement, width: number, height: number): void => {
    const state = stateRef.current;
    if (!state.isSpawning || state.traceCount >= maxTraces) return;

    const { points, endX, endY } = generateTrace(width, height, gridStep);
    const pathD = pointsToPath(points);
    const totalLen = calculatePathLength(points);
    const duration = 2.0 + totalLen / 450;
    const padR = 6 + Math.random() * 3;
    const padDelay = duration + 0.05;
    const pinS = 5;
    const [pinX, pinY] = [points[0].x, points[0].y];

    // Группа элементов дорожки
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Свечение
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glow.setAttribute('d', pathD);
    glow.setAttribute('class', 'trace-glow');
    glow.style.setProperty('--duration', `${duration}s`);
    glow.style.strokeDasharray = `${totalLen}`;
    glow.style.strokeDashoffset = `${totalLen}`;
    glow.style.stroke = glowColor;
    g.appendChild(glow);

    // Основная линия
    const trace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trace.setAttribute('d', pathD);
    trace.setAttribute('class', 'trace');
    trace.style.setProperty('--duration', `${duration}s`);
    trace.style.strokeDasharray = `${totalLen}`;
    trace.style.strokeDashoffset = `${totalLen}`;
    trace.style.stroke = traceColor;
    g.appendChild(trace);

    // Кольцо пада
    const padRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    padRing.setAttribute('cx', `${endX}`);
    padRing.setAttribute('cy', `${endY}`);
    padRing.setAttribute('r', `${padR + 3}`);
    padRing.setAttribute('class', 'pad-ring');
    padRing.style.setProperty('--pad-delay', `${padDelay}s`);
    padRing.style.stroke = traceColor;
    g.appendChild(padRing);

    // Основной пад
    const pad = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pad.setAttribute('cx', `${endX}`);
    pad.setAttribute('cy', `${endY}`);
    pad.setAttribute('r', `${padR}`);
    pad.setAttribute('class', 'pad');
    pad.style.setProperty('--pad-delay', `${padDelay}s`);
    pad.style.fill = traceColor;
    g.appendChild(pad);

    // Внутренний круг пада
    const padInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    padInner.setAttribute('cx', `${endX}`);
    padInner.setAttribute('cy', `${endY}`);
    padInner.setAttribute('r', `${padR * 0.35}`);
    padInner.setAttribute('class', 'pad-inner');
    padInner.style.setProperty('--pad-delay', `${padDelay}s`);
    g.appendChild(padInner);

    // Стартовый контакт (квадрат)
    const compPad = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    compPad.setAttribute('x', `${pinX - pinS}`);
    compPad.setAttribute('y', `${pinY - pinS}`);
    compPad.setAttribute('width', `${pinS * 2}`);
    compPad.setAttribute('height', `${pinS * 2}`);
    compPad.setAttribute('rx', '1');
    compPad.setAttribute('class', 'component-pad');
    compPad.style.stroke = traceColor;
    g.appendChild(compPad);

    // Внутренний пин
    const compPin = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    compPin.setAttribute('x', `${pinX - pinS * 0.5}`);
    compPin.setAttribute('y', `${pinY - pinS * 0.5}`);
    compPin.setAttribute('width', `${pinS}`);
    compPin.setAttribute('height', `${pinS}`);
    compPin.setAttribute('rx', '1');
    compPin.setAttribute('class', 'component-pin');
    compPin.style.fill = traceColor;
    g.appendChild(compPin);

    svg.appendChild(g);

    // Мерцание после завершения отрисовки
    const flickerTimeout = setTimeout(() => {
      const flicker = () => {
        if (Math.random() > 0.75) {
          trace.style.opacity = '0.4';
          setTimeout(() => { trace.style.opacity = '1'; }, 80);
        }
        stateRef.current.timeouts.push(setTimeout(flicker, rand(2500, 7000)));
      };
      setTimeout(flicker, duration * 1000 + 1500);
    }, duration * 1000);

    stateRef.current.timeouts.push(flickerTimeout);

    // Обновление состояния
    const newCount = state.traceCount + 1;
    state.traceCount = newCount;

    if (newCount >= maxTraces) {
      state.isSpawning = false;
      setIsComplete(true);
      onComplete?.();
    }
  }, [maxTraces, traceColor, glowColor, onComplete, generateTrace, pointsToPath, calculatePathLength, rand, gridStep]);

  const spawnLoop = useCallback((svg: SVGSVGElement, width: number, height: number): void => {
    if (!stateRef.current.isSpawning) return;
    createTrace(svg, width, height);
    
    if (stateRef.current.traceCount < maxTraces) {
      const timeout = setTimeout(() => spawnLoop(svg, width, height), rand(180, 550));
      stateRef.current.timeouts.push(timeout);
    }
  }, [maxTraces, createTrace, rand]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const getSize = (): { width: number; height: number } => ({
      width: svg.clientWidth || window.innerWidth,
      height: svg.clientHeight || window.innerHeight,
    });

    let { width, height } = getSize();

    const handleResize = (): void => {
      svg.innerHTML = '';
      stateRef.current = { traceCount: 0, isSpawning: true, timeouts: [] };
      setIsComplete(false);
      ({ width, height } = getSize());
      setTimeout(() => spawnLoop(svg, width, height), 100);
    };

    window.addEventListener('resize', handleResize);

    // Запуск анимации
    const startTimeout = setTimeout(() => spawnLoop(svg, width, height), 300);
    stateRef.current.timeouts.push(startTimeout);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      stateRef.current.timeouts.forEach(clearTimeout);
      stateRef.current.timeouts = [];
    };
  }, [maxTraces, traceColor, glowColor, onComplete, gridStep, spawnLoop]);

  // ==================== RENDER ====================

  return (
    <div
      className={`pcb-container ${className}`}
      data-pcb-animation={isComplete ? 'complete' : 'running'}
    >
      <svg 
        ref={svgRef} 
        className="pcb-svg" 
        aria-hidden="true"
        role="presentation"
        />
      {/* Контент поверх анимации */}
      <div className="pcb-content">
        {children}
      </div>
    </div>
  );
};

export default PcbTracesAnimation;