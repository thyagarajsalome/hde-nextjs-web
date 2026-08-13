import React from 'react';
import type { Metadata } from 'next';
import PaintVisualizer from '@/features/visualizer/PaintVisualizer';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = {
  title: 'Virtual Paint Visualizer | HDE Construction',
  description: 'Visualize hundreds of premium wall paint colors on interiors and exteriors instantly.',
};

export default function VisualizerPage() {
  return (
    <PublicLayout>
      <PaintVisualizer />
    </PublicLayout>
  );
}