import { useMemo } from 'react';
import type { Block } from '../types';

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number; // Y for horizontal, X for vertical
}

interface UseSnapGuidesOptions {
  draggingBlockId: string | null;
  blocks: Block[];
  templateWidth: number;
  templateHeight: number;
  snapThreshold?: number;
}

interface SnapResult {
  guides: SnapGuide[];
  snappedX?: number;
  snappedY?: number;
}

/**
 * Calculate snap points for a moving block.
 * Returns visible guides and optional snapped coordinates.
 */
export function calculateSnapPoints(
  movingBlock: Block,
  otherBlocks: Block[],
  templateWidth: number,
  templateHeight: number,
  snapThreshold: number = 10
): SnapResult {
  const guides: SnapGuide[] = [];
  let snappedX: number | undefined;
  let snappedY: number | undefined;

  const movingLeft = movingBlock.x;
  const movingRight = movingBlock.x + movingBlock.width;
  const movingCenterX = movingBlock.x + movingBlock.width / 2;
  const movingTop = movingBlock.y;
  const movingBottom = movingBlock.y + movingBlock.height;
  const movingCenterY = movingBlock.y + movingBlock.height / 2;

  // Collect snap targets: edges of other blocks + canvas edges + canvas center
  const verticalTargets: number[] = [
    0, // Left edge
    templateWidth, // Right edge
    templateWidth / 2, // Center
  ];

  const horizontalTargets: number[] = [
    0, // Top edge
    templateHeight, // Bottom edge
    templateHeight / 2, // Center
  ];

  // Add other blocks' edges and centers
  for (const block of otherBlocks) {
    verticalTargets.push(
      block.x, // Left edge
      block.x + block.width, // Right edge
      block.x + block.width / 2 // Center
    );
    horizontalTargets.push(
      block.y, // Top edge
      block.y + block.height, // Bottom edge
      block.y + block.height / 2 // Center
    );
  }

  // Check vertical snapping (X axis)
  let closestVerticalDist = Infinity;
  let closestVerticalTarget: number | undefined;
  let verticalSnapType: 'left' | 'right' | 'center' | undefined;

  for (const target of verticalTargets) {
    // Snap moving block's left edge
    const leftDist = Math.abs(movingLeft - target);
    if (leftDist < snapThreshold && leftDist < closestVerticalDist) {
      closestVerticalDist = leftDist;
      closestVerticalTarget = target;
      verticalSnapType = 'left';
    }

    // Snap moving block's right edge
    const rightDist = Math.abs(movingRight - target);
    if (rightDist < snapThreshold && rightDist < closestVerticalDist) {
      closestVerticalDist = rightDist;
      closestVerticalTarget = target;
      verticalSnapType = 'right';
    }

    // Snap moving block's center
    const centerDist = Math.abs(movingCenterX - target);
    if (centerDist < snapThreshold && centerDist < closestVerticalDist) {
      closestVerticalDist = centerDist;
      closestVerticalTarget = target;
      verticalSnapType = 'center';
    }
  }

  if (closestVerticalTarget !== undefined && verticalSnapType) {
    guides.push({ type: 'vertical', position: closestVerticalTarget });

    // Calculate snapped X based on which edge/center snapped
    switch (verticalSnapType) {
      case 'left':
        snappedX = closestVerticalTarget;
        break;
      case 'right':
        snappedX = closestVerticalTarget - movingBlock.width;
        break;
      case 'center':
        snappedX = closestVerticalTarget - movingBlock.width / 2;
        break;
    }
  }

  // Check horizontal snapping (Y axis)
  let closestHorizontalDist = Infinity;
  let closestHorizontalTarget: number | undefined;
  let horizontalSnapType: 'top' | 'bottom' | 'center' | undefined;

  for (const target of horizontalTargets) {
    // Snap moving block's top edge
    const topDist = Math.abs(movingTop - target);
    if (topDist < snapThreshold && topDist < closestHorizontalDist) {
      closestHorizontalDist = topDist;
      closestHorizontalTarget = target;
      horizontalSnapType = 'top';
    }

    // Snap moving block's bottom edge
    const bottomDist = Math.abs(movingBottom - target);
    if (bottomDist < snapThreshold && bottomDist < closestHorizontalDist) {
      closestHorizontalDist = bottomDist;
      closestHorizontalTarget = target;
      horizontalSnapType = 'bottom';
    }

    // Snap moving block's center
    const centerDist = Math.abs(movingCenterY - target);
    if (centerDist < snapThreshold && centerDist < closestHorizontalDist) {
      closestHorizontalDist = centerDist;
      closestHorizontalTarget = target;
      horizontalSnapType = 'center';
    }
  }

  if (closestHorizontalTarget !== undefined && horizontalSnapType) {
    guides.push({ type: 'horizontal', position: closestHorizontalTarget });

    // Calculate snapped Y based on which edge/center snapped
    switch (horizontalSnapType) {
      case 'top':
        snappedY = closestHorizontalTarget;
        break;
      case 'bottom':
        snappedY = closestHorizontalTarget - movingBlock.height;
        break;
      case 'center':
        snappedY = closestHorizontalTarget - movingBlock.height / 2;
        break;
    }
  }

  return { guides, snappedX, snappedY };
}

/**
 * Hook for managing snap guides during block dragging.
 * Returns visible guides based on the currently dragging block.
 */
export function useSnapGuides({
  draggingBlockId,
  blocks,
  templateWidth,
  templateHeight,
  snapThreshold = 10,
}: UseSnapGuidesOptions): SnapGuide[] {
  return useMemo(() => {
    if (!draggingBlockId) return [];

    const draggingBlock = blocks.find((b) => b.id === draggingBlockId);
    if (!draggingBlock) return [];

    const otherBlocks = blocks.filter((b) => b.id !== draggingBlockId);

    const { guides } = calculateSnapPoints(
      draggingBlock,
      otherBlocks,
      templateWidth,
      templateHeight,
      snapThreshold
    );

    return guides;
  }, [draggingBlockId, blocks, templateWidth, templateHeight, snapThreshold]);
}
