import type { EditorLoadPayload } from '../types';

/**
 * API configuration for connecting to CablecastCG server
 */
export interface ApiConfig {
  baseUrl: string;
  username: string;
  password: string;
}

/**
 * Zone response from API
 */
export interface ApiZone {
  id: number;
  ZoneName: string;
  GraphicsWidth: number | null;
  GraphicsHeight: number | null;
  ZoneType: string;
}

/**
 * Template summary from list endpoint
 */
export interface ApiTemplateSummary {
  id: string;
  Name: string;
  Description?: string;
  ThumbnailImageUrl?: string;
  PreviewImageUrl?: string;
}

/**
 * Full template from detail endpoint
 */
export interface ApiTemplate extends ApiTemplateSummary {
  BackgroundID?: string;
  Blocks: Array<Record<string, unknown>>;
  ZoneID: number;
}

/**
 * Bulletin summary from list endpoint
 */
export interface ApiBulletinSummary {
  id: string;
  Description?: string;
  Type: string;
  Status: string;
  ThumbnailImageUrl?: string;
  PreviewImageUrl?: string;
}

/**
 * Full bulletin from detail endpoint
 */
export interface ApiBulletin extends ApiBulletinSummary {
  Blocks?: Array<Record<string, unknown>>;
  BackgroundID?: string;
}

/**
 * Font from API
 */
export interface ApiFont {
  Name: string;
}

/**
 * Media item from API
 */
export interface ApiMedia {
  id: string;
  Name: string;
  MediaType: string;
  ThumbnailUrl?: string;
}

const STORAGE_KEY = 'cablecast-api-config';

/**
 * Convert any URL to proxy URL format for CORS bypass.
 * All requests go through Vite's dev proxy.
 * e.g., https://rays-house.cablecast.tv -> /api-proxy/https/rays-house.cablecast.tv
 * e.g., http://localhost/CablecastCGAPI -> /api-proxy/http/localhost/CablecastCGAPI
 */
export function toProxyUrl(baseUrl: string, path: string = ''): string {
  // Already a proxy URL
  if (baseUrl.startsWith('/api-proxy/')) {
    return path ? `${baseUrl}${path}` : baseUrl;
  }

  // Convert to absolute URL if relative
  let absoluteUrl = baseUrl;
  if (baseUrl.startsWith('/')) {
    // Relative path like /CablecastCGAPI - assume localhost
    absoluteUrl = `http://localhost${baseUrl}`;
  }

  // Convert absolute URL to proxy path
  try {
    const url = new URL(absoluteUrl);
    const protocol = url.protocol.replace(':', '');
    // Remove trailing slash from pathname to avoid double slashes
    const pathname = url.pathname.replace(/\/$/, '');
    return `/api-proxy/${protocol}/${url.host}${pathname}${path}`;
  } catch {
    // If URL parsing fails, return as-is
    return path ? `${baseUrl}${path}` : baseUrl;
  }
}

/**
 * Service for communicating with the CablecastCG API
 */
class ApiService {
  private config: ApiConfig | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load config from localStorage on init
    this.loadFromStorage();
  }

  /**
   * Subscribe to config changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Load configuration from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
  }

  /**
   * Save configuration to localStorage
   */
  private saveToStorage() {
    try {
      if (this.config) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Configure the API service with credentials
   */
  configure(config: ApiConfig): void {
    this.config = config;
    this.saveToStorage();
    this.notify();
  }

  /**
   * Clear the API configuration
   */
  disconnect(): void {
    this.config = null;
    this.saveToStorage();
    this.notify();
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Get the current config (for display purposes)
   */
  getConfig(): ApiConfig | null {
    return this.config;
  }

  /**
   * Build authorization header
   */
  private getAuthHeader(): string {
    if (!this.config) throw new Error('API not configured');
    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    return `Basic ${credentials}`;
  }

  /**
   * Make an authenticated GET request
   */
  private async get<T>(endpoint: string): Promise<T> {
    if (!this.config) throw new Error('API not configured');

    const proxyBase = toProxyUrl(this.config.baseUrl);
    const url = `${proxyBase}/v1/${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: this.getAuthHeader(),
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Check your username and password.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You may not have permission for this resource.');
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Test the connection with current credentials
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getZones();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all zones
   */
  async getZones(): Promise<ApiZone[]> {
    return this.get<ApiZone[]>('zones');
  }

  /**
   * Get templates in a zone
   */
  async getTemplates(zoneId: number): Promise<ApiTemplateSummary[]> {
    return this.get<ApiTemplateSummary[]>(`templates?zoneID=${zoneId}`);
  }

  /**
   * Get a single template with blocks
   */
  async getTemplate(id: string): Promise<ApiTemplate> {
    return this.get<ApiTemplate>(`templates/${encodeURIComponent(id)}`);
  }

  /**
   * Get bulletins in a zone
   */
  async getBulletins(zoneId: number): Promise<ApiBulletinSummary[]> {
    return this.get<ApiBulletinSummary[]>(`bulletins?zoneID=${zoneId}`);
  }

  /**
   * Get a single bulletin with blocks
   */
  async getBulletin(id: string): Promise<ApiBulletin> {
    return this.get<ApiBulletin>(`bulletins/${encodeURIComponent(id)}`);
  }

  /**
   * Get available fonts
   */
  async getFonts(): Promise<ApiFont[]> {
    return this.get<ApiFont[]>('fonts');
  }

  /**
   * Get media in a zone
   */
  async getMedia(zoneId: number): Promise<ApiMedia[]> {
    return this.get<ApiMedia[]>(`media?zoneID=${zoneId}`);
  }

  /**
   * Load a template and transform to EditorLoadPayload format
   */
  async loadTemplateForEditor(
    templateId: string,
    zone: ApiZone
  ): Promise<EditorLoadPayload> {
    // Fetch template, fonts, and media in parallel
    const [template, fonts, media] = await Promise.all([
      this.getTemplate(templateId),
      this.getFonts(),
      this.getMedia(zone.id),
    ]);

    return this.transformToPayload('template', template, zone, fonts, media);
  }

  /**
   * Load a bulletin and transform to EditorLoadPayload format
   */
  async loadBulletinForEditor(
    bulletinId: string,
    zone: ApiZone
  ): Promise<EditorLoadPayload> {
    // Fetch bulletin, fonts, and media in parallel
    const [bulletin, fonts, media] = await Promise.all([
      this.getBulletin(bulletinId),
      this.getFonts(),
      this.getMedia(zone.id),
    ]);

    return this.transformBulletinToPayload(bulletin, zone, fonts, media);
  }

  /**
   * Transform API template to EditorLoadPayload
   */
  private transformToPayload(
    layoutType: 'template' | 'bulletin',
    template: ApiTemplate,
    zone: ApiZone,
    fonts: ApiFont[],
    media: ApiMedia[]
  ): EditorLoadPayload {
    return {
      layoutType,
      template: {
        id: template.id,
        name: template.Name || '',
        description: template.Description,
        backgroundID: template.BackgroundID,
        blocks: template.Blocks || [],
        isNew: false,
        isDynamic: false,
      },
      zone: {
        id: String(zone.id),
        name: zone.ZoneName,
        graphicsWidth: zone.GraphicsWidth || 1920,
        graphicsHeight: zone.GraphicsHeight || 1080,
      },
      fonts: fonts.map((f, i) => ({
        id: String(i),
        name: f.Name,
      })),
      media: media.map((m) => ({
        id: m.id,
        name: m.Name,
        mediaType: m.MediaType,
      })),
    };
  }

  /**
   * Transform API bulletin to EditorLoadPayload
   */
  private transformBulletinToPayload(
    bulletin: ApiBulletin,
    zone: ApiZone,
    fonts: ApiFont[],
    media: ApiMedia[]
  ): EditorLoadPayload {
    return {
      layoutType: 'bulletin',
      template: {
        id: bulletin.id,
        name: bulletin.Description || 'Bulletin',
        description: bulletin.Description,
        backgroundID: bulletin.BackgroundID,
        blocks: bulletin.Blocks || [],
        isNew: false,
        isDynamic: false,
      },
      zone: {
        id: String(zone.id),
        name: zone.ZoneName,
        graphicsWidth: zone.GraphicsWidth || 1920,
        graphicsHeight: zone.GraphicsHeight || 1080,
      },
      fonts: fonts.map((f, i) => ({
        id: String(i),
        name: f.Name,
      })),
      media: media.map((m) => ({
        id: m.id,
        name: m.Name,
        mediaType: m.MediaType,
      })),
    };
  }
}

// Singleton instance
export const apiService = new ApiService();
