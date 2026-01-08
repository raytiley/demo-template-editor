import type { Block } from './block';

/**
 * Zone represents the display area configuration
 */
export interface Zone {
  id: string;
  name: string;
  graphicsWidth: number;
  graphicsHeight: number;
}

/**
 * Media item (background, picture, video)
 */
export interface Media {
  id: string;
  name: string;
  mediaType: 'Background' | 'Picture' | 'Video';
  thumbnailUrl?: string;
}

/**
 * Font available for text blocks
 */
export interface Font {
  id: string;
  name: string;
}

/**
 * Template represents the bulletin/template being edited.
 * Maps to the data structure sent via postMessage from Ember.
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  backgroundID: string;
  blocks: Block[];
  isNew: boolean;
  isDynamic: boolean;
}

/**
 * Payload received from Ember via postMessage 'editor-load'
 */
export interface EditorLoadPayload {
  layoutType: 'bulletin' | 'template';
  template: {
    id: string;
    name: string;
    description?: string;
    backgroundID?: string;
    blocks: Array<Record<string, unknown>>;
    isNew?: boolean;
    isDynamic?: boolean;
  };
  zone: {
    id: string;
    name?: string;
    graphicsWidth: number;
    graphicsHeight: number;
  };
  media: Array<{
    id: string;
    name: string;
    mediaType?: string;
  }>;
  fonts: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * Payload sent to Ember via postMessage 'editor-save'
 * Note: Block keys are converted to PascalCase for backend compatibility
 */
export interface EditorSavePayload {
  Name: string;
  BackgroundID: string;
  Blocks: Array<Record<string, unknown>>;
}
