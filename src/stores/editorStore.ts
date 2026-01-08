import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import type { Block, BlockType, Template, Zone, Media, Font, EditorLoadPayload } from '../types';
import { createDefaultBlock } from '../types/block';

/**
 * Editor state interface
 */
interface EditorState {
  // Template data
  template: Template | null;
  zone: Zone | null;
  media: Media[];
  fonts: Font[];

  // Editor state
  selectedBlockId: string | null;
  isDirty: boolean;
  isLoaded: boolean;
  scaleFactor: number;

  // Actions
  loadTemplate: (payload: EditorLoadPayload) => void;
  selectBlock: (blockId: string | null) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  addBlock: (type: BlockType, name?: string) => void;
  deleteBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  setBackground: (backgroundId: string) => void;
  setTemplateName: (name: string) => void;
  setScaleFactor: (factor: number) => void;
  markDirty: () => void;
  getTemplateForSave: () => { Name: string; BackgroundID: string; Blocks: Array<Record<string, unknown>> } | null;
}

/**
 * Convert camelCase key to PascalCase
 */
function toPascalCase(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Convert PascalCase key to camelCase
 */
function toCamelCase(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

/**
 * Convert block from API format (PascalCase) to internal format (camelCase)
 */
function normalizeBlock(apiBlock: Record<string, unknown>, index: number): Block {
  const block: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(apiBlock)) {
    block[toCamelCase(key)] = value;
  }

  // Ensure id exists
  if (!block.id) {
    block.id = `block-${index}-${Date.now()}`;
  }

  // Provide defaults for any missing properties
  const defaults = createDefaultBlock(
    (block.blockType as BlockType) || 'Rectangle',
    (block.name as string) || `Block ${index + 1}`
  );

  return { ...defaults, ...block } as Block;
}

/**
 * Convert block to API format (PascalCase) for saving
 */
function blockToApiFormat(block: Block): Record<string, unknown> {
  const apiBlock: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(block)) {
    // Skip internal properties
    if (key === 'id') continue;
    apiBlock[toPascalCase(key)] = value;
  }

  return apiBlock;
}

/**
 * Generate unique block name
 */
function generateBlockName(blocks: Block[], baseType: BlockType): string {
  const prefix = baseType === 'Text' ? 'Text' :
                 baseType === 'Rectangle' ? 'Rectangle' :
                 baseType === 'Ellipse' ? 'Ellipse' :
                 baseType === 'Picture' ? 'Picture' :
                 baseType === 'WebPicture' ? 'WebPicture' :
                 'Video';

  let counter = 1;
  let name = `${prefix}${counter}`;

  const existingNames = new Set(blocks.map(b => b.name));
  while (existingNames.has(name)) {
    counter++;
    name = `${prefix}${counter}`;
  }

  return name;
}

/**
 * Main editor store with undo/redo support via zundo
 */
export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set, get) => ({
      // Initial state
      template: null,
      zone: null,
      media: [],
      fonts: [],
      selectedBlockId: null,
      isDirty: false,
      isLoaded: false,
      scaleFactor: 1,

      /**
       * Load template data from Ember postMessage
       */
      loadTemplate: (payload: EditorLoadPayload) => {
        set((state) => {
          const { template: apiTemplate, zone: apiZone, media: apiMedia, fonts: apiFonts } = payload;

          // Parse blocks with normalization
          const blocks = (apiTemplate.blocks || []).map((b, i) => normalizeBlock(b, i));

          state.template = {
            id: apiTemplate.id,
            name: apiTemplate.name || '',
            description: apiTemplate.description || '',
            width: apiZone.graphicsWidth,
            height: apiZone.graphicsHeight,
            backgroundID: apiTemplate.backgroundID || '',
            blocks,
            isNew: apiTemplate.isNew || false,
            isDynamic: apiTemplate.isDynamic || false,
          };

          state.zone = {
            id: apiZone.id,
            name: apiZone.name || '',
            graphicsWidth: apiZone.graphicsWidth,
            graphicsHeight: apiZone.graphicsHeight,
          };

          state.media = apiMedia.map(m => ({
            id: m.id,
            name: m.name,
            mediaType: (m.mediaType as Media['mediaType']) || 'Picture',
          }));

          state.fonts = apiFonts.map(f => ({
            id: f.id,
            name: f.name,
          }));

          state.isLoaded = true;
          state.isDirty = false;
          state.selectedBlockId = null;
        });
      },

      /**
       * Select a block by ID (null to deselect)
       */
      selectBlock: (blockId: string | null) => {
        set((state) => {
          state.selectedBlockId = blockId;
        });
      },

      /**
       * Update a block's properties
       */
      updateBlock: (blockId: string, updates: Partial<Block>) => {
        set((state) => {
          if (!state.template) return;

          const blockIndex = state.template.blocks.findIndex(b => b.id === blockId);
          if (blockIndex === -1) return;

          Object.assign(state.template.blocks[blockIndex], updates);
          state.isDirty = true;
        });
      },

      /**
       * Add a new block of specified type
       */
      addBlock: (type: BlockType, name?: string) => {
        set((state) => {
          if (!state.template) return;

          const blockName = name || generateBlockName(state.template.blocks, type);
          const newBlock = createDefaultBlock(type, blockName);

          // Position new block slightly offset if there are existing blocks
          if (state.template.blocks.length > 0) {
            const offset = (state.template.blocks.length * 20) % 100;
            newBlock.x = 50 + offset;
            newBlock.y = 50 + offset;
          }

          // Add to front (top of z-order)
          state.template.blocks.unshift(newBlock);
          state.selectedBlockId = newBlock.id;
          state.isDirty = true;
        });
      },

      /**
       * Delete a block by ID
       */
      deleteBlock: (blockId: string) => {
        set((state) => {
          if (!state.template) return;

          const blockIndex = state.template.blocks.findIndex(b => b.id === blockId);
          if (blockIndex === -1) return;

          state.template.blocks.splice(blockIndex, 1);

          // Deselect if deleted block was selected
          if (state.selectedBlockId === blockId) {
            state.selectedBlockId = null;
          }

          state.isDirty = true;
        });
      },

      /**
       * Duplicate a block
       */
      duplicateBlock: (blockId: string) => {
        set((state) => {
          if (!state.template) return;

          const sourceBlock = state.template.blocks.find(b => b.id === blockId);
          if (!sourceBlock) return;

          const newName = generateBlockName(state.template.blocks, sourceBlock.blockType);
          const newBlock: Block = {
            ...sourceBlock,
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: newName,
            x: sourceBlock.x + 20,
            y: sourceBlock.y + 20,
          };

          // Insert after source block
          const sourceIndex = state.template.blocks.findIndex(b => b.id === blockId);
          state.template.blocks.splice(sourceIndex, 0, newBlock);

          state.selectedBlockId = newBlock.id;
          state.isDirty = true;
        });
      },

      /**
       * Reorder blocks (for z-index management)
       */
      reorderBlocks: (fromIndex: number, toIndex: number) => {
        set((state) => {
          if (!state.template) return;
          if (fromIndex === toIndex) return;
          if (fromIndex < 0 || fromIndex >= state.template.blocks.length) return;
          if (toIndex < 0 || toIndex >= state.template.blocks.length) return;

          const [removed] = state.template.blocks.splice(fromIndex, 1);
          state.template.blocks.splice(toIndex, 0, removed);
          state.isDirty = true;
        });
      },

      /**
       * Set the template background
       */
      setBackground: (backgroundId: string) => {
        set((state) => {
          if (!state.template) return;
          state.template.backgroundID = backgroundId;
          state.isDirty = true;
        });
      },

      /**
       * Set the template name
       */
      setTemplateName: (name: string) => {
        set((state) => {
          if (!state.template) return;
          state.template.name = name;
          state.isDirty = true;
        });
      },

      /**
       * Set canvas scale factor
       */
      setScaleFactor: (factor: number) => {
        set((state) => {
          state.scaleFactor = Math.max(0.1, Math.min(3, factor));
        });
      },

      /**
       * Mark the template as dirty (has unsaved changes)
       */
      markDirty: () => {
        set((state) => {
          state.isDirty = true;
        });
      },

      /**
       * Get template data formatted for saving (PascalCase keys)
       */
      getTemplateForSave: () => {
        const state = get();
        if (!state.template) return null;

        return {
          Name: state.template.name,
          BackgroundID: state.template.backgroundID,
          Blocks: state.template.blocks.map(blockToApiFormat),
        };
      },
    })),
    {
      // zundo options for undo/redo
      limit: 50,
      partialize: (state) => ({
        template: state.template,
        selectedBlockId: state.selectedBlockId,
      }),
    }
  )
);

/**
 * Hook to get the currently selected block
 */
export function useSelectedBlock(): Block | null {
  return useEditorStore((state) => {
    if (!state.template || !state.selectedBlockId) return null;
    return state.template.blocks.find(b => b.id === state.selectedBlockId) || null;
  });
}

/**
 * Hook to get undo/redo functions from zundo temporal store
 */
export function useTemporalStore() {
  return useEditorStore.temporal;
}
