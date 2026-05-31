import { motion } from 'framer-motion';
import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const color = (item.payload as { color?: string })?.color ?? '#00D4FF';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4 py-3 rounded-xl border backdrop-blur-xl"
      style={{
        background: 'rgba(5, 5, 12, 0.98)',
        borderColor: `${color}50`,
        boxShadow: `0 0 30px ${color}30, inset 0 0 20px ${color}08`,
      }}
    >
      <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Status: {label}</p>
      <p className="text-2xl font-bold" style={{ color, textShadow: `0 0 20px ${color}` }}>
        {String(item.value).padStart(2, '0')}
      </p>
    </motion.div>
  );
}

interface ActiveBarProps {
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function ActiveBarShape(props: ActiveBarProps) {
  const { fill = '#00D4FF', x = 0, y = 0, width = 0, height = 0 } = props;

  return (
    <g>
      <rect
        x={x - 2}
        y={y}
        width={width + 4}
        height={height}
        fill="none"
        stroke={fill}
        strokeWidth={1}
        strokeOpacity={0.3}
        rx={8}
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.95}
        rx={8}
        ry={8}
        stroke={fill}
        strokeWidth={2}
        style={{ filter: `drop-shadow(0 0 16px ${fill}) brightness(1.2)` }}
      />
    </g>
  );
}
