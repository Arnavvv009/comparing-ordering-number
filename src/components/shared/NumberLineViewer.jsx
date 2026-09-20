import React from 'react';

// Renders a horizontal number line with tick marks and labels, and plots one
// or more values onto it as coloured markers. This is the module's equivalent
// of AngleViewer: a flat, purpose-built 2D SVG diagram reused by the Wonder,
// Simulate and Play phases. Optionally renders clickable "drop zones" between
// ticks for Station B's plotting activity.
import { toDecimal } from '../../data/numberData';

export default function NumberLineViewer({
  min = -10,
  max = 10,
  step = 1,
  width = 640,
  height = 150,
  markers = [],            // [{ value, label, color }]
  showZeroHighlight = true,
  clickTargets = null,     // array of numeric values to render as click zones
  onTargetClick = null,
  selectedTarget = null,
  correctTarget = null,
  wrongTarget = null,
}) {
  const padX = 34;
  const lineY = height * 0.58;
  const span = max - min;
  const usable = width - padX * 2;

  const xFor = (value) => padX + ((toDecimal(value) - min) / span) * usable;

  // Tick marks
  const ticks = [];
  for (let v = min; v <= max + 1e-9; v += step) {
    const rounded = Math.round(v * 1000) / 1000;
    const x = xFor(rounded);
    const isZero = Math.abs(rounded) < 1e-9;
    const isMajor = Math.abs(rounded % (step * 5)) < 1e-9 || isZero;
    ticks.push(
      <line
        key={`t-${rounded}`}
        x1={x} y1={lineY - (isMajor ? 11 : 6)}
        x2={x} y2={lineY + (isMajor ? 11 : 6)}
        stroke={isZero && showZeroHighlight ? '#ffbe1a' : '#bca8f2'}
        strokeWidth={isZero && showZeroHighlight ? 3 : isMajor ? 2 : 1}
        opacity={isMajor ? 0.95 : 0.55}
      />
    );
    if (isMajor) {
      ticks.push(
        <text
          key={`l-${rounded}`}
          x={x} y={lineY + 30}
          fill={isZero && showZeroHighlight ? '#ffbe1a' : '#bca8f2'}
          fontSize="13"
          fontWeight="800"
          fontFamily="Nunito, sans-serif"
          textAnchor="middle"
        >
          {rounded}
        </text>
      );
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', margin: '0 auto', overflow: 'visible', width: '100%', maxWidth: `${width}px` }}
    >
      {/* Negative-side wash so the "less than zero" region reads instantly */}
      <rect
        x={padX} y={lineY - 34}
        width={Math.max(0, xFor(0) - padX)} height={68}
        fill="#4A90D9" opacity="0.08" rx="6"
      />

      {/* The line itself, with arrowheads on both ends */}
      <line x1={padX - 14} y1={lineY} x2={width - padX + 14} y2={lineY} stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
      <polygon points={`${padX - 20},${lineY} ${padX - 8},${lineY - 6} ${padX - 8},${lineY + 6}`} fill="#ffffff" opacity="0.85" />
      <polygon points={`${width - padX + 20},${lineY} ${width - padX + 8},${lineY - 6} ${width - padX + 8},${lineY + 6}`} fill="#ffffff" opacity="0.85" />

      {ticks}

      {/* Optional clickable plotting zones (Station B) */}
      {clickTargets && clickTargets.map((tv) => {
        const x = xFor(tv);
        const isSelected = selectedTarget !== null && Math.abs(toDecimal(selectedTarget) - tv) < 1e-9;
        const isCorrect = correctTarget !== null && Math.abs(toDecimal(correctTarget) - tv) < 1e-9;
        const isWrong = wrongTarget !== null && Math.abs(toDecimal(wrongTarget) - tv) < 1e-9;
        const stroke = isCorrect ? '#22c55e' : isWrong ? '#ef4444' : isSelected ? '#ffbe1a' : 'rgba(255,255,255,0.35)';
        const fill = isCorrect ? 'rgba(34,197,94,0.25)' : isWrong ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.05)';
        return (
          <circle
            key={`ct-${tv}`}
            cx={x} cy={lineY} r="13"
            fill={fill} stroke={stroke} strokeWidth="2.5"
            style={{ cursor: onTargetClick ? 'pointer' : 'default' }}
            onClick={() => onTargetClick && onTargetClick(tv)}
          />
        );
      })}

      {/* Plotted markers */}
      {markers.map((m, i) => {
        const x = xFor(m.value);
        const color = m.color || '#34D399';
        const above = i % 2 === 0;
        const labelY = above ? lineY - 28 : lineY + 48;
        return (
          <g key={`m-${i}-${m.value}`}>
            <line x1={x} y1={lineY} x2={x} y2={above ? lineY - 20 : lineY + 20} stroke={color} strokeWidth="2.5" opacity="0.8" />
            <circle cx={x} cy={lineY} r="8" fill={color} stroke="#130a2a" strokeWidth="2.5" />
            <text
              x={x} y={labelY}
              fill={color}
              fontSize="15"
              fontWeight="900"
              fontFamily="Nunito, sans-serif"
              textAnchor="middle"
            >
              {m.label !== undefined ? m.label : m.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
