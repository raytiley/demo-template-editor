import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import type {
  ApiZone,
  ApiTemplateSummary,
  ApiBulletinSummary,
} from '../services/apiService';
import { useEditorStore } from '../stores';
import styles from './demo.module.css';

type ContentTab = 'templates' | 'bulletins';

/**
 * Browser for selecting zones, templates, and bulletins from the API.
 */
export function ContentBrowser() {
  const loadTemplate = useEditorStore((state) => state.loadTemplate);

  // Zone state
  const [zones, setZones] = useState<ApiZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<ApiZone | null>(null);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<ContentTab>('templates');

  // Content state
  const [templates, setTemplates] = useState<ApiTemplateSummary[]>([]);
  const [bulletins, setBulletins] = useState<ApiBulletinSummary[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  // Loading state for loading into editor
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Load zones on mount
  useEffect(() => {
    async function fetchZones() {
      setZonesLoading(true);
      setZonesError(null);
      try {
        const data = await apiService.getZones();
        // Filter to bulletin zones with dimensions
        const bulletinZones = data.filter(
          (z) => z.ZoneType === 'Bulletin' && z.GraphicsWidth && z.GraphicsHeight
        );
        setZones(bulletinZones);
        if (bulletinZones.length > 0) {
          setSelectedZone(bulletinZones[0]);
        }
      } catch (err) {
        setZonesError(err instanceof Error ? err.message : 'Failed to load zones');
      } finally {
        setZonesLoading(false);
      }
    }
    fetchZones();
  }, []);

  // Load content when zone or tab changes
  useEffect(() => {
    if (!selectedZone) return;

    async function fetchContent() {
      setContentLoading(true);
      setContentError(null);
      try {
        if (activeTab === 'templates') {
          const data = await apiService.getTemplates(selectedZone.id);
          setTemplates(data);
        } else {
          const data = await apiService.getBulletins(selectedZone.id);
          setBulletins(data);
        }
      } catch (err) {
        setContentError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setContentLoading(false);
      }
    }
    fetchContent();
  }, [selectedZone, activeTab]);

  // Handle zone selection
  const handleZoneChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const zone = zones.find((z) => z.id === parseInt(e.target.value, 10));
      setSelectedZone(zone || null);
    },
    [zones]
  );

  // Handle content item click
  const handleItemClick = useCallback(
    async (id: string) => {
      if (!selectedZone || loadingId) return;

      setLoadingId(id);
      try {
        const payload =
          activeTab === 'templates'
            ? await apiService.loadTemplateForEditor(id, selectedZone)
            : await apiService.loadBulletinForEditor(id, selectedZone);
        loadTemplate(payload);
      } catch (err) {
        console.error('Failed to load content:', err);
        setContentError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoadingId(null);
      }
    },
    [selectedZone, activeTab, loadTemplate, loadingId]
  );

  // Render loading spinner
  if (zonesLoading) {
    return (
      <div className={styles.contentBrowser}>
        <div className={styles.demoPanelHeader}>Content Browser</div>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  // Render zones error
  if (zonesError) {
    return (
      <div className={styles.contentBrowser}>
        <div className={styles.demoPanelHeader}>Content Browser</div>
        <div className={styles.error}>{zonesError}</div>
      </div>
    );
  }

  // Render empty zones
  if (zones.length === 0) {
    return (
      <div className={styles.contentBrowser}>
        <div className={styles.demoPanelHeader}>Content Browser</div>
        <div className={styles.emptyState}>No bulletin zones found</div>
      </div>
    );
  }

  const items = activeTab === 'templates' ? templates : bulletins;

  return (
    <div className={styles.contentBrowser}>
      <div className={styles.demoPanelHeader}>Content Browser</div>

      <div className={styles.browserControls}>
        {/* Zone selector */}
        <div className={styles.zoneSelect}>
          <label htmlFor="zone-select">Zone</label>
          <select
            id="zone-select"
            value={selectedZone?.id || ''}
            onChange={handleZoneChange}
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.ZoneName} ({zone.GraphicsWidth}x{zone.GraphicsHeight})
              </option>
            ))}
          </select>
        </div>

        {/* Content type tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'templates' ? styles.active : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'bulletins' ? styles.active : ''}`}
            onClick={() => setActiveTab('bulletins')}
          >
            Bulletins
          </button>
        </div>
      </div>

      {/* Content error */}
      {contentError && <div className={styles.error}>{contentError}</div>}

      {/* Content list */}
      <div className={styles.contentList}>
        {contentLoading ? (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner} />
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            No {activeTab} found in this zone
          </div>
        ) : (
          items.map((item) => {
            const isTemplate = activeTab === 'templates';
            const name = isTemplate
              ? (item as ApiTemplateSummary).Name
              : (item as ApiBulletinSummary).Description || 'Untitled';
            const thumbnailUrl = item.ThumbnailImageUrl;
            const subtitle = isTemplate
              ? 'Template'
              : (item as ApiBulletinSummary).Type;

            return (
              <div
                key={item.id}
                className={`${styles.contentItem} ${loadingId === item.id ? styles.selected : ''}`}
                onClick={() => handleItemClick(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(item.id);
                  }
                }}
              >
                {thumbnailUrl ? (
                  <img
                    className={styles.contentThumbnail}
                    src={thumbnailUrl}
                    alt=""
                    onError={(e) => {
                      // Hide broken images
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className={styles.contentThumbnail} />
                )}
                <div className={styles.contentInfo}>
                  <div className={styles.contentName}>{name}</div>
                  <div className={styles.contentType}>{subtitle}</div>
                </div>
                {loadingId === item.id && (
                  <div className={styles.spinner} style={{ width: 16, height: 16 }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
