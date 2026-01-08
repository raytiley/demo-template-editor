import { useState, useCallback, type ReactNode } from 'react';
import styles from './PropertyPanel.module.css';

interface PropertySectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

/**
 * Collapsible section for grouping related properties.
 */
export function PropertySection({
  title,
  defaultExpanded = true,
  children,
}: PropertySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const sectionId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-controls={sectionId}
      >
        <span className={`${styles.sectionIcon} ${expanded ? styles.expanded : ''}`}>
          &#9654;
        </span>
        <span className={styles.sectionTitle}>{title}</span>
      </button>
      <div
        id={sectionId}
        className={`${styles.sectionContent} ${expanded ? styles.expanded : ''}`}
        role="region"
        aria-labelledby={`${sectionId}-header`}
      >
        {children}
      </div>
    </div>
  );
}
