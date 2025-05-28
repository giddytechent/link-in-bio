// app/components/dashboard/editors/sortable-link-item.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableLinkItemProps {
  id: string;
  children: React.ReactNode; // This will be the <Card> component for the link
  isOpacityReduced?: boolean; // For styling inactive or while dragging
}

export function SortableLinkItem({ id, children, isOpacityReduced }: SortableLinkItemProps) {
  const {
    attributes, // Spread these onto the element that serves as the drag handle
    listeners,  // Spread these onto the element that serves as the drag handle
    setNodeRef, // This ref should be on the main draggable container element
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : isOpacityReduced ? 0.6 : 1, // Adjust opacity as needed
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group touch-manipulation">
      {/* Drag Handle provided by SortableLinkItem */}
      <div
        {...attributes}
        {...listeners}
        className="p-2 cursor-grab opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Drag to reorder link"
      >
        <GripVertical className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </div>
      {/* The actual content (Link Card) passed as children */}
      <div className="flex-grow min-w-0"> {/* Ensures children take up available space */}
        {children}
      </div>
    </div>
  );
}