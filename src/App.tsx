import { useEffect, useState, useCallback } from 'react';
import { Editor } from './components';
import { useEditorStore } from './stores';
import {
  MOCK_TEMPLATE_PAYLOAD,
  DemoToolbar,
  ApiConfigPanel,
  ContentBrowser,
  type DemoMode,
} from './demo';
import './styles/theme.css';
import styles from './demo/demo.module.css';

/**
 * Root application component.
 *
 * In production, the editor receives data via postMessage from the parent Ember app.
 * In development/demo mode, we can load mock data or connect to the API.
 */
function App() {
  const loadTemplate = useEditorStore((state) => state.loadTemplate);
  const isLoaded = useEditorStore((state) => state.isLoaded);

  // Check if we're in an iframe (production) or standalone (development)
  const isInIframe = window.parent !== window;

  // Demo mode state
  const [demoMode, setDemoMode] = useState<DemoMode>('mock');
  const [isConnected, setIsConnected] = useState(false);

  // Handle connection state changes
  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  // Handle demo mode changes
  const handleModeChange = useCallback(
    (mode: DemoMode) => {
      setDemoMode(mode);
      // Reset to mock data when switching to mock mode
      if (mode === 'mock' && !isLoaded) {
        console.log('[App] Switching to mock mode - loading mock data');
        loadTemplate(MOCK_TEMPLATE_PAYLOAD);
      }
    },
    [loadTemplate, isLoaded]
  );

  // In standalone development mode with mock mode, load mock data
  useEffect(() => {
    if (!isInIframe && !isLoaded && demoMode === 'mock') {
      console.log('[App] Development mode - loading mock template data');
      const timer = setTimeout(() => {
        loadTemplate(MOCK_TEMPLATE_PAYLOAD);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loadTemplate, isLoaded, isInIframe, demoMode]);

  // Production mode: just render the editor
  if (isInIframe) {
    return <Editor />;
  }

  // Development mode: render with demo controls
  return (
    <div className={styles.appWrapper}>
      {/* Demo toolbar */}
      <DemoToolbar mode={demoMode} onModeChange={handleModeChange} />

      <div className={styles.appContent}>
        {/* Demo panel - only show in API mode */}
        {demoMode === 'api' && (
          <div className={styles.demoPanel}>
            <div className={styles.demoPanelHeader}>API Connection</div>
            <ApiConfigPanel onConnectionChange={handleConnectionChange} />

            {/* Content browser - only show when connected */}
            {isConnected && <ContentBrowser />}
          </div>
        )}

        {/* Editor */}
        <div className={styles.editorWrapper}>
          <Editor />
        </div>
      </div>
    </div>
  );
}

export default App;
