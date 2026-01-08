import type { Block } from '../types';
import { toProxyUrl } from './apiService';

interface TemplateSize {
  width: number;
  height: number;
}

interface RenderOptions {
  templateSize: TemplateSize;
  apiBaseUrl?: string; // e.g., 'https://rays-house.cablecast.tv' or '/CablecastCGAPI'
}

/**
 * Build the render API URL for a block.
 * Maps to the query string format expected by /CablecastCGAPI/v1/render/full
 *
 * Based on updateBlockFromServer() in ui/public/Legacy/js/template_editor.js:3463-3573
 *
 * @param block - The block to render
 * @param options - Render options including template size and optional API base URL
 * @returns URL string for the render endpoint
 */
export function buildRenderUrl(block: Block, options: RenderOptions | TemplateSize): string {
  // Support both old signature (just templateSize) and new options object
  const templateSize = 'templateSize' in options ? options.templateSize : options;
  const apiBaseUrl = 'apiBaseUrl' in options ? options.apiBaseUrl : undefined;
  const params = new URLSearchParams();

  // Required params for all blocks
  params.set('ZoneWidth', String(templateSize.width));
  params.set('ZoneHeight', String(templateSize.height));
  params.set('X', String(Math.round(block.x)));
  params.set('Y', String(Math.round(block.y)));
  params.set('Width', String(Math.round(block.width)));
  params.set('Height', String(Math.round(block.height)));
  params.set('BlockType', block.blockType);
  params.set('Name', block.name);

  // Block type specific params
  if (block.blockType === 'Text') {
    params.set('Text', block.text || '');
    params.set('TextSize', String(block.textSize));
    params.set('TextFont', block.textFont);

    params.set('TextBold', String(block.textBold));
    params.set('TextItalic', String(block.textItalic));
    params.set('TextStrikeout', String(block.textStrikeout));
    params.set('TextUnderline', String(block.textUnderline));
    params.set('TextColor', block.textColor);
    params.set('TextColorOpacity', String(block.textColorOpacity));

    params.set('TextGradient', String(block.textGradient));
    params.set('TextGradientColor', block.textGradientColor);
    params.set('TextGradientMode', block.textGradientMode);
    params.set('TextGradientOpacity', String(block.textGradientOpacity));

    params.set('TextOutline', String(block.textOutline));
    params.set('TextOutlineColor', block.textOutlineColor);
    params.set('TextOutlineOpacity', String(block.textOutlineOpacity));

    params.set('TextGlow', String(block.textGlow));
    params.set('TextGlowColor', block.textGlowColor);

    params.set('TextShadow', String(block.textShadow));
    params.set('TextShadowColor', block.textShadowColor);
    params.set('TextShadowDepth', String(block.textShadowDepth));
    params.set('TextShadowOpacity', String(block.textShadowOpacity));

    params.set('TextHorizAlignment', block.textHorizAlignment);
    params.set('TextVertAlignment', block.textVertAlignment);

    params.set('TextVertical', String(block.textVertical));
    params.set('TextWrap', String(block.textWrap));
    params.set('AllowResizeRect', String(block.allowResizeRect));
    params.set('AutoSizeText', String(block.autoSizeText));
    params.set('TextMaxLength', String(block.textMaxLength));
  } else if (block.blockType === 'Picture') {
    params.set('HorizAlignment', block.horizAlignment);
    params.set('VertAlignment', block.vertAlignment);
    params.set('MaintainAspectRatio', String(block.maintainAspectRatio));
    params.set('OpacityLevel', String(block.opacityLevel));
    params.set('MediaID', block.mediaID);
    // Note: TemplateID would be added by the caller if needed
  } else if (block.blockType === 'WebPicture') {
    params.set('HorizAlignment', block.horizAlignment);
    params.set('VertAlignment', block.vertAlignment);
    params.set('MaintainAspectRatio', String(block.maintainAspectRatio));
    params.set('OpacityLevel', String(block.opacityLevel));
    params.set('ImageURL', block.imageURL);
  } else if (block.blockType === 'Video') {
    params.set('MediaID', block.mediaID);
  }

  // Common rect options for all block types
  params.set('RotateDegrees', String(block.rotateDegrees));
  params.set('RectColor', block.rectColor);
  params.set('RectColorOpacity', String(block.rectColorOpacity));

  params.set('RectGradient', String(block.rectGradient));
  params.set('RectGradientColor', block.rectGradientColor);
  params.set('RectGradientMode', block.rectGradientMode);
  params.set('RectGradientOpacity', String(block.rectGradientOpacity));

  params.set('RectOutline', String(block.rectOutline));
  params.set('RectOutlineColor', block.rectOutlineColor);
  params.set('RectOutlineWidth', String(block.rectOutlineWidth));
  params.set('RectOutlineOpacity', String(block.rectOutlineOpacity));

  params.set('RectShadow', String(block.rectShadow));
  params.set('RectShadowColor', block.rectShadowColor);
  params.set('RectShadowDepth', String(block.rectShadowDepth));
  params.set('RectShadowOpacity', String(block.rectShadowOpacity));

  params.set('Reflection', String(block.reflection));
  params.set('ReflectionOpacity', String(block.reflectionOpacity));
  params.set('ReflectionOffset', String(block.reflectionOffset));
  params.set('ReflectionHeight', String(block.reflectionHeight));

  // Special case: empty Picture block renders as transparent rect
  if (block.blockType === 'Picture' && !block.mediaID) {
    const emptyPath = '/v1/render/full?BlockType=Rectangle&RectColorOpacity=0';
    if (apiBaseUrl) {
      return toProxyUrl(apiBaseUrl, emptyPath);
    }
    return `/CablecastCGAPI${emptyPath}`;
  }

  // Cache buster to prevent stale renders
  params.set('_t', String(Date.now()));

  const renderPath = `/v1/render/full?${params.toString()}`;
  if (apiBaseUrl) {
    return toProxyUrl(apiBaseUrl, renderPath);
  }
  return `/CablecastCGAPI${renderPath}`;
}

/**
 * Build URL for background image
 *
 * @param backgroundId - The background media ID
 * @param apiBaseUrl - Optional API base URL for proxy routing
 * @returns URL string for the background image
 */
export function buildBackgroundUrl(backgroundId: string, apiBaseUrl?: string): string {
  if (!backgroundId || backgroundId === '-1') {
    return '';
  }
  const bgPath = `/Media/Backgrounds/${backgroundId}/Final.jpg`;
  if (apiBaseUrl) {
    // Convert API base URL (e.g., https://host/CablecastCGAPI) to CG base (https://host/CablecastCG)
    const cgBaseUrl = apiBaseUrl.replace(/CablecastCGAPI\/?$/, 'CablecastCG');
    return toProxyUrl(cgBaseUrl, bgPath);
  }
  return `/CablecastCG${bgPath}`;
}
