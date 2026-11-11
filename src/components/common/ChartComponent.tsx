import React, { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  ChartConfiguration,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

interface ChartComponentProps {
  type: 'line' | 'bar' | 'doughnut';
  labels: string[];
  data: number[];
  label?: string;
  colors?: string[];
  height?: number;
  options?: any;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({
  type,
  labels,
  data,
  label = 'Value',
  colors,
  height = 240,
  options = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy prior chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let backgroundColors: any = '#2563eb';
    let borderColors: any = '#1d4ed8';

    if (type === 'line') {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.35)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0.02)');
      backgroundColors = gradient;
      borderColors = '#2563eb';
    } else if (type === 'doughnut') {
      backgroundColors = colors || [
        '#2563eb', // primary blue
        '#3b82f6', // sky blue
        '#10b981', // green
        '#f59e0b', // amber
        '#8b5cf6', // purple
        '#ef4444', // red
      ];
      borderColors = '#ffffff';
    } else if (type === 'bar') {
      backgroundColors = colors || labels.map((_, i) => (i % 2 === 0 ? '#2563eb' : '#60a5fa'));
      borderColors = '#1d4ed8';
    }

    const config: ChartConfiguration = {
      type,
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: type === 'line' ? 2.5 : 1,
            fill: type === 'line',
            tension: 0.35,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: type === 'doughnut',
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11,
              },
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 'bold' },
            bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales:
          type === 'doughnut'
            ? {}
            : {
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                    color: '#64748b',
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: { color: '#f1f5f9' },
                  ticks: {
                    font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
                    color: '#64748b',
                  },
                },
              },
        ...options,
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, labels, data, label, height]);

  return (
    <div style={{ height: `${height}px`, width: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
