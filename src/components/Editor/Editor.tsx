import { useEffect } from 'react';
import { useEditorStore } from '../../stores';
import { messageService, useDirtySync } from '../../services';
import { Canvas } from '../Canvas';
import { PropertyPanel } from '../PropertyPanel';
import styles from './Editor.module.css';

/**
 * Main Editor component that contains the full template editor interface.
 */
export function Editor() {
  const template = useEditorStore((state) => state.template);
  const isDirty = useEditorStore((state) => state.isDirty);
  const isLoaded = useEditorStore((state) => state.isLoaded);
  const addBlock = useEditorStore((state) => state.addBlock);

  // Initialize message service on mount
  useEffect(() => {
    messageService.init();
    return () => messageService.destroy();
  }, []);

  // Sync dirty state with parent
  useDirtySync();

  return (
    <div className={styles.editor} role="application" aria-label="Template Editor">
      {/* Screen reader announcements */}
      <div
        id="sr-announcer"
        role="status"
        aria-live="polite"
        className={styles.srAnnouncer}
      />

      {/* Toolbar */}
      <header className={styles.toolbar} role="toolbar" aria-label="Editor toolbar">
        <h1 className={styles.toolbarTitle}>
          {template?.name || 'Template Editor'}
        </h1>

        <div className={styles.toolbarActions}>
          <button
            className={styles.toolbarButton}
            onClick={() => addBlock('Text')}
            title="Add text block"
          >
            <span aria-hidden="true">T</span>
            <span>Text</span>
          </button>
          <button
            className={styles.toolbarButton}
            onClick={() => addBlock('Rectangle')}
            title="Add rectangle block"
          >
            <span aria-hidden="true">□</span>
            <span>Shape</span>
          </button>
          <button
            className={styles.toolbarButton}
            onClick={() => addBlock('Picture')}
            title="Add picture block"
          >
            <span aria-hidden="true">🖼</span>
            <span>Image</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className={styles.main}>
        {/* Canvas area */}
        <div className={styles.canvasArea}>
          <Canvas />
        </div>

        {/* Property panel sidebar */}
        <aside
          className={styles.sidebar}
          role="complementary"
          aria-label="Block properties"
        >
          <PropertyPanel />
        </aside>
      </main>

      {/* Status bar */}
      <footer className={styles.statusBar}>
        <div className={styles.statusItem}>
          {template && (
            <span>
              {template.width} × {template.height}px
              {template.blocks.length > 0 && ` • ${template.blocks.length} block${template.blocks.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </div>
        <div className={styles.statusItem}>
          {isDirty && (
            <span className={styles.statusDirty}>
              <span className={styles.statusDot} />
              Unsaved changes
            </span>
          )}
          {!isLoaded && (
            <span>Loading...</span>
          )}
        </div>
      </footer>
    </div>
  );
}
