import { useCallback, useMemo } from 'react';
import type { Block, TextAlignment } from '../../../types';
import { useEditorStore } from '../../../stores';
import { Select, TextInput, ButtonGroup, Checkbox, Slider } from '../../shared';
import styles from '../PropertyPanel.module.css';

interface MediaPanelProps {
  block: Block;
}

const HORIZ_ALIGNMENT_OPTIONS = [
  { value: 'Near', label: 'Left', icon: '\u2190' },
  { value: 'Center', label: 'Center', icon: '\u2194' },
  { value: 'Far', label: 'Right', icon: '\u2192' },
];

const VERT_ALIGNMENT_OPTIONS = [
  { value: 'Near', label: 'Top', icon: '\u2191' },
  { value: 'Center', label: 'Middle', icon: '\u2195' },
  { value: 'Far', label: 'Bottom', icon: '\u2193' },
];

/**
 * Panel for media blocks (Picture, WebPicture, Video).
 * - Picture: select from media library
 * - WebPicture: enter URL
 * - Video: select from media library
 */
export function MediaPanel({ block }: MediaPanelProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const media = useEditorStore((state) => state.media);

  const isPicture = block.blockType === 'Picture';
  const isWebPicture = block.blockType === 'WebPicture';
  const isVideo = block.blockType === 'Video';

  // Filter media by type
  const mediaOptions = useMemo(() => {
    const filteredMedia = media.filter((m) => {
      if (isPicture) return m.mediaType === 'Picture' || m.mediaType === 'Background';
      if (isVideo) return m.mediaType === 'Video';
      return false;
    });

    return filteredMedia.map((m) => ({
      value: m.id,
      label: m.name,
    }));
  }, [media, isPicture, isVideo]);

  const handleMediaChange = useCallback(
    (value: string) => updateBlock(block.id, { mediaID: value }),
    [updateBlock, block.id]
  );

  const handleUrlChange = useCallback(
    (value: string) => updateBlock(block.id, { imageURL: value }),
    [updateBlock, block.id]
  );

  const handleHorizAlignChange = useCallback(
    (value: string) => updateBlock(block.id, { horizAlignment: value as TextAlignment }),
    [updateBlock, block.id]
  );

  const handleVertAlignChange = useCallback(
    (value: string) => updateBlock(block.id, { vertAlignment: value as TextAlignment }),
    [updateBlock, block.id]
  );

  const handleAspectRatioChange = useCallback(
    (value: boolean) => updateBlock(block.id, { maintainAspectRatio: value }),
    [updateBlock, block.id]
  );

  const handleOpacityChange = useCallback(
    (value: number) => updateBlock(block.id, { opacityLevel: value }),
    [updateBlock, block.id]
  );

  return (
    <div className={styles.propertyGrid}>
      {/* Media Selection (Picture/Video) */}
      {(isPicture || isVideo) && (
        <Select
          label={isPicture ? 'Image' : 'Video'}
          value={block.mediaID}
          options={mediaOptions}
          onChange={handleMediaChange}
          placeholder={`Select ${isPicture ? 'image' : 'video'}...`}
        />
      )}

      {/* URL Input (WebPicture) */}
      {isWebPicture && (
        <TextInput
          label="Image URL"
          value={block.imageURL}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.png"
        />
      )}

      {/* Alignment - Picture and WebPicture only */}
      {(isPicture || isWebPicture) && (
        <>
          <ButtonGroup
            label="Horizontal Align"
            value={block.horizAlignment}
            options={HORIZ_ALIGNMENT_OPTIONS}
            onChange={handleHorizAlignChange}
            iconOnly
          />

          <ButtonGroup
            label="Vertical Align"
            value={block.vertAlignment}
            options={VERT_ALIGNMENT_OPTIONS}
            onChange={handleVertAlignChange}
            iconOnly
          />

          <Checkbox
            label="Maintain Aspect Ratio"
            checked={block.maintainAspectRatio}
            onChange={handleAspectRatioChange}
          />

          <Slider
            label="Opacity"
            value={block.opacityLevel}
            onChange={handleOpacityChange}
            min={0}
            max={255}
            formatValue={(v) => `${Math.round((v / 255) * 100)}%`}
          />
        </>
      )}
    </div>
  );
}
