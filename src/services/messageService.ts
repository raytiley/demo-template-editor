import type { EditorLoadPayload } from '../types';
import { useEditorStore } from '../stores';

/**
 * Message types for communication with parent Ember app.
 * Based on ui/app/services/editor.js
 */
type MessageType =
  | 'CONTENT_EDITOR_READY'
  | 'editor-load'
  | 'editor-save'
  | 'editor-dirty'
  | 'editor-request'
  | 'editor-update';

interface IncomingMessage {
  type: MessageType;
  value?: unknown;
}

/**
 * Service for postMessage communication with the parent Ember application.
 *
 * Protocol:
 * - CONTENT_EDITOR_READY (React → Ember): Editor initialized, ready for data
 * - editor-load (Ember → React): Send template data to editor
 * - editor-request (Ember → React): Request current template data
 * - editor-save (React → Ember): Return template data on save
 * - editor-dirty (React → Ember): Mark as having unsaved changes
 * - editor-update (Ember → React): Toggle UI elements
 */
class MessageService {
  private initialized = false;
  private isDirtyNotified = false;

  /**
   * Initialize the message service and set up listeners
   */
  init() {
    if (this.initialized) return;

    window.addEventListener('message', this.handleMessage);
    this.initialized = true;

    // Send ready signal to parent
    this.sendReady();
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.initialized = false;
  }

  /**
   * Handle incoming messages from parent
   */
  private handleMessage = (event: MessageEvent) => {
    // Handle string message (CONTENT_EDITOR_READY is sent as string from us)
    if (typeof event.data === 'string') {
      return;
    }

    const message = event.data as IncomingMessage;
    if (!message || !message.type) return;

    switch (message.type) {
      case 'editor-load':
        this.handleEditorLoad(message.value as EditorLoadPayload);
        break;

      case 'editor-request':
        this.handleEditorRequest();
        break;

      case 'editor-update':
        this.handleEditorUpdate(message.value as string);
        break;
    }
  };

  /**
   * Handle editor-load message - load template data
   */
  private handleEditorLoad(payload: EditorLoadPayload) {
    console.log('[MessageService] Loading template:', payload);
    const store = useEditorStore.getState();
    store.loadTemplate(payload);
    this.isDirtyNotified = false;
  }

  /**
   * Handle editor-request message - return template data
   */
  private handleEditorRequest() {
    console.log('[MessageService] Template data requested');
    const store = useEditorStore.getState();
    const templateData = store.getTemplateForSave();

    if (templateData) {
      this.sendMessage('editor-save', templateData);
    }
  }

  /**
   * Handle editor-update message - toggle UI elements
   */
  private handleEditorUpdate(elementId: string) {
    console.log('[MessageService] Editor update:', elementId);
    // Currently used for 'TemplateNameBlock' toggle
    // Could be expanded to handle other UI updates
  }

  /**
   * Send ready signal to parent
   */
  sendReady() {
    console.log('[MessageService] Sending ready signal');
    window.parent.postMessage('CONTENT_EDITOR_READY', '*');
  }

  /**
   * Send dirty notification to parent
   */
  sendDirty() {
    if (this.isDirtyNotified) return;

    console.log('[MessageService] Sending dirty signal');
    this.sendMessage('editor-dirty', null);
    this.isDirtyNotified = true;
  }

  /**
   * Send message to parent
   */
  private sendMessage(type: MessageType, value: unknown) {
    window.parent.postMessage({ type, value }, '*');
  }
}

// Singleton instance
export const messageService = new MessageService();

/**
 * Hook to sync dirty state with parent
 */
export function useDirtySync() {
  const isDirty = useEditorStore((state) => state.isDirty);

  // Send dirty notification when state changes
  if (isDirty) {
    messageService.sendDirty();
  }
}
