/**
 * Block types supported by the template editor.
 * Maps to backend BlockType enum in lib/Carousel/Imaging/Constants.cs
 */
export type BlockType = 'Text' | 'Rectangle' | 'Ellipse' | 'Picture' | 'WebPicture' | 'Video';

/**
 * Text alignment values - maps to TRMSStringAlignment enum
 * Near = Left/Top, Center = Center, Far = Right/Bottom
 */
export type TextAlignment = 'Near' | 'Center' | 'Far';

/**
 * Gradient direction modes
 */
export type GradientMode = 'Horizontal' | 'Vertical' | 'ForwardDiagonal' | 'BackwardDiagonal';

/**
 * HTML field types for text blocks (used in public submission forms)
 */
export type HTMLFieldType = 'EditField' | 'TextArea' | '';

/**
 * HTML field sizes
 */
export type HTMLFieldSize = 'Small' | 'Medium' | 'Large' | '';

/**
 * Repeat type for dynamic templates
 */
export type RepeatType = 'None' | 'Header' | 'Footer' | 'ItemRepeated' | '';

/**
 * Block interface representing all properties of a template block.
 * Based on ui/app/models/block.js Ember Data model.
 */
export interface Block {
  // Core identity
  id: string;
  name: string;
  blockType: BlockType;

  // Position and size (in template coordinates)
  x: number;
  y: number;
  width: number;
  height: number;

  // Rotation
  rotateDegrees: number;

  // Text properties (Text blocks only)
  text: string;
  textFont: string;
  textSize: number;
  textPadding: number;
  textBold: boolean;
  textItalic: boolean;
  textStrikeout: boolean;
  textUnderline: boolean;
  textColor: string;           // Hex without # (e.g., "FFFFFF")
  textColorOpacity: number;    // 0-255
  textHorizAlignment: TextAlignment;
  textVertAlignment: TextAlignment;
  textVertical: boolean;
  textRightToLeft: boolean;
  textWrap: boolean;
  autoSizeText: boolean;
  sizingMode: string;
  textMaxLength: number;
  truncateURLs: boolean;

  // Text gradient
  textGradient: boolean;
  textGradientColor: string;
  textGradientMode: GradientMode;
  textGradientOpacity: number;

  // Text outline
  textOutline: boolean;
  textOutlineColor: string;
  textOutlineOpacity: number;

  // Text shadow
  textShadow: boolean;
  textShadowColor: string;
  textShadowDepth: number;
  textShadowOpacity: number;

  // Text glow
  textGlow: boolean;
  textGlowColor: string;

  // Shape/Rectangle properties (all blocks)
  rectColor: string;
  rectColorOpacity: number;

  // Shape gradient
  rectGradient: boolean;
  rectGradientColor: string;
  rectGradientMode: GradientMode;
  rectGradientOpacity: number;

  // Shape outline
  rectOutline: boolean;
  rectOutlineColor: string;
  rectOutlineWidth: number;
  rectOutlineOpacity: number;

  // Shape shadow
  rectShadow: boolean;
  rectShadowColor: string;
  rectShadowDepth: number;
  rectShadowOpacity: number;

  // Reflection effect
  reflection: boolean;
  reflectionOpacity: number;
  reflectionOffset: number;
  reflectionHeight: number;

  // Media properties (Picture/Video/WebPicture blocks)
  mediaID: string;
  imageURL: string;              // For WebPicture blocks
  horizAlignment: TextAlignment;
  vertAlignment: TextAlignment;
  maintainAspectRatio: boolean;
  opacityLevel: number;

  // HTML form field config (for public submission)
  hTMLFieldType: HTMLFieldType;
  hTMLFieldSize: HTMLFieldSize;

  // Dynamic template properties
  repeatType: RepeatType;
  allowResizeRect: boolean;
}

/**
 * Create a new block with default values
 */
export function createDefaultBlock(type: BlockType, name: string): Block {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    blockType: type,

    // Position/Size
    x: 100,
    y: 100,
    width: 300,
    height: type === 'Text' ? 100 : 200,
    rotateDegrees: 0,

    // Text defaults
    text: type === 'Text' ? 'New Text Block' : '',
    textFont: 'Arial',
    textSize: 32,
    textPadding: 0,
    textBold: false,
    textItalic: false,
    textStrikeout: false,
    textUnderline: false,
    textColor: '000000',
    textColorOpacity: 255,
    textHorizAlignment: 'Center',
    textVertAlignment: 'Center',
    textVertical: false,
    textRightToLeft: false,
    textWrap: true,
    autoSizeText: true,
    sizingMode: '',
    textMaxLength: -1,
    truncateURLs: false,

    // Text effects
    textGradient: false,
    textGradientColor: '000000',
    textGradientMode: 'Horizontal',
    textGradientOpacity: 255,
    textOutline: false,
    textOutlineColor: '000000',
    textOutlineOpacity: 255,
    textShadow: false,
    textShadowColor: '000000',
    textShadowDepth: 2,
    textShadowOpacity: 128,
    textGlow: false,
    textGlowColor: 'FFFFFF',

    // Shape defaults
    rectColor: type === 'Rectangle' ? '2cb466' : 'FFFFFF',
    rectColorOpacity: type === 'Rectangle' ? 255 : 0,
    rectGradient: false,
    rectGradientColor: '000000',
    rectGradientMode: 'Horizontal',
    rectGradientOpacity: 255,
    rectOutline: false,
    rectOutlineColor: '000000',
    rectOutlineWidth: 1,
    rectOutlineOpacity: 255,
    rectShadow: false,
    rectShadowColor: '000000',
    rectShadowDepth: 5,
    rectShadowOpacity: 128,

    // Reflection
    reflection: false,
    reflectionOpacity: 128,
    reflectionOffset: 0,
    reflectionHeight: 50,

    // Media defaults
    mediaID: '',
    imageURL: '',
    horizAlignment: 'Center',
    vertAlignment: 'Center',
    maintainAspectRatio: true,
    opacityLevel: 255,

    // HTML field
    hTMLFieldType: '',
    hTMLFieldSize: '',

    // Dynamic
    repeatType: '',
    allowResizeRect: true,
  };
}
