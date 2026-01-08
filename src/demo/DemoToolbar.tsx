import styles from './demo.module.css';

export type DemoMode = 'mock' | 'api';

interface DemoToolbarProps {
  mode: DemoMode;
  onModeChange: (mode: DemoMode) => void;
}

/**
 * Demo toolbar shown at the top of the app in development mode.
 * Allows switching between mock data and API data modes.
 */
export function DemoToolbar({ mode, onModeChange }: DemoToolbarProps) {
  return (
    <div className={styles.demoToolbar}>
      <h1>Template Editor Demo</h1>

      <div className={styles.modeToggle}>
        <label htmlFor="demo-mode">Data Source:</label>
        <select
          id="demo-mode"
          value={mode}
          onChange={(e) => onModeChange(e.target.value as DemoMode)}
        >
          <option value="mock">Mock Data</option>
          <option value="api">CablecastCG API</option>
        </select>
      </div>
    </div>
  );
}
