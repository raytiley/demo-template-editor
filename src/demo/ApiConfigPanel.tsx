import { useState, useEffect, useCallback } from 'react';
import { apiService, type ApiConfig } from '../services/apiService';
import styles from './demo.module.css';

interface ApiConfigPanelProps {
  onConnectionChange: (connected: boolean) => void;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

/**
 * Panel for configuring API connection credentials.
 * Stores credentials in localStorage for convenience.
 */
export function ApiConfigPanel({ onConnectionChange }: ApiConfigPanelProps) {
  // Use proxy path for local development (Vite proxies /CablecastCGAPI to localhost)
  const [baseUrl, setBaseUrl] = useState('/CablecastCGAPI');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  // Load existing config on mount
  useEffect(() => {
    const config = apiService.getConfig();
    if (config) {
      setBaseUrl(config.baseUrl);
      setUsername(config.username);
      setPassword(config.password);
      // Test if still valid
      setStatus('connecting');
      apiService.testConnection().then((valid) => {
        if (valid) {
          setStatus('connected');
          onConnectionChange(true);
        } else {
          setStatus('disconnected');
          onConnectionChange(false);
        }
      });
    }
  }, [onConnectionChange]);

  const handleConnect = useCallback(async () => {
    setError(null);
    setStatus('connecting');

    const config: ApiConfig = { baseUrl, username, password };
    apiService.configure(config);

    try {
      const valid = await apiService.testConnection();
      if (valid) {
        setStatus('connected');
        onConnectionChange(true);
      } else {
        setStatus('disconnected');
        setError('Connection failed. Check your credentials.');
        onConnectionChange(false);
      }
    } catch (err) {
      setStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Connection failed');
      onConnectionChange(false);
    }
  }, [baseUrl, username, password, onConnectionChange]);

  const handleDisconnect = useCallback(() => {
    apiService.disconnect();
    setStatus('disconnected');
    setError(null);
    onConnectionChange(false);
  }, [onConnectionChange]);

  const canConnect = baseUrl && username && password && status !== 'connecting';

  return (
    <div className={styles.configPanel}>
      {/* Connection status */}
      <div className={`${styles.connectionStatus} ${styles[status]}`}>
        <span className={styles.statusDot} />
        {status === 'connected' && 'Connected'}
        {status === 'connecting' && 'Connecting...'}
        {status === 'disconnected' && 'Not connected'}
      </div>

      {/* Config fields - only show when not connected */}
      {status !== 'connected' && (
        <>
          <div className={styles.configField}>
            <label htmlFor="api-url">Server URL</label>
            <input
              id="api-url"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="/CablecastCGAPI (uses Vite proxy)"
            />
          </div>

          <div className={styles.configField}>
            <label htmlFor="api-username">Username</label>
            <input
              id="api-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>

          <div className={styles.configField}>
            <label htmlFor="api-password">Password</label>
            <input
              id="api-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>
        </>
      )}

      {/* Error message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Actions */}
      <div className={styles.configActions}>
        {status !== 'connected' ? (
          <button
            className={styles.connectButton}
            onClick={handleConnect}
            disabled={!canConnect}
          >
            {status === 'connecting' ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            className={styles.disconnectButton}
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
