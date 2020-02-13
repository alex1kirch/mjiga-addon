// Available in main.js only
export function initialize(config: IPluginConfig);

export function initializeSettings(config: { iframeHeight: number });

export const board: IBoardCommands;

export function addListener(event: EventType, listener: (e: Event) => void);

export function removeListener(event: EventType, listener: (e: Event) => void);

export function showNotification(text: string);

export function showErrorNotification(text: string);

// Experimental. Get search params from parent window url
export function __getUrlSearchParams(): Promise<object>;

export function authorize(options: AuhorizationOptions): Promise<string>;

export function isAuthorized(): Promise<boolean>;

export function getToken(): Promise<string>;

export function onReady(callback: () => void);

// Can be not authorized if using scope 'client:plugin_for_account'
// isCurrentUserAuthorized(): Promise<boolean>

// Run OAuth authorization in popup
// authorizeCurrentUser(url: string, options): Promise<boolean>

// Return oauth token for current user, that plugin can use to call app's server-side
// getOAuthToken(): Promise<OAuthResponse>

export interface AuhorizationOptions {
  response_type: 'code' | 'token';
  scope?: string;
  redirect_uri?: string;
  state?: string;
}

export type EventType =
  | 'SELECTION_UPDATED'
  | 'WIDGETS_CREATED'
  | 'WIDGETS_DELETED'
  | 'WIDGETS_TRANSFORMATION_UPDATED'
  | 'COMMENT_CREATED' //experimental event
  | 'EXIT_PROTOTYPING' //experimental event
  | 'ESC_PRESSED' //experimental event
  | 'CANVAS_CLICKED' //experimental event
  | 'ALL_WIDGETS_LOADED'; //experimental event

export interface Event {
  type: EventType;
  data: any;
}

export interface OAuthResponse {
  token: string;
  accountId: string;
  userId: string;
}

export interface IPluginConfig {
  // Returns 'true' if omitted. You can return 'false' if you dont want start plugin for this board.
  // IFrame with plugin will be removed if canStartPluginOnBoard returns 'false'
  canStartPluginOnBoard?: (boardInfo: IBoardInfo) => boolean;
  extensionPoints: {
    upload?: {
      title: string;
      svgIcon: string;
      onClick: () => void;
    };
    toolbar?: {
      title: string;
      toolbarSvgIcon: string;
      librarySvgIcon: string;
      onClick: () => void;
    };
    bottomBar?: {
      title: string;
      svgIcon: string;
      onClick: () => void;
    };
    exportMenu?: {
      title: string;
      svgIcon: string;
      onClick: () => void;
    };
    widgetContextMenu?: Array<{
      supportedWidgetTypes: string[];
      availableInMultiSelection: boolean;
      item: IContextMenuItem;
    }>;
    canvasContextMenu?: {
      items: IContextMenuItem[];
    };
    getWidgetMenuItems?: (
      widgets: IBaseWidget[],
    ) => Promise<IContextMenuItem[]>;
  };

  // Extension points concept for dashboard and settings
  // settingsExtensionPoints: {
  // 	customSettingsIframeURL?: string
  // }

  // dashboardExtensionPoints: {
  // some extension points
  // }
}

export interface IContextMenuItem {
  svgIcon: string;
  tooltip: string;
  onClick: (widgets) => void;
}

export interface IBoardCommands {
  info: IBoardInfoCommands;

  widgets: IBoardWidgetsCommands; // requires 'EDIT_CONTENT' permission
  // comments: IBoardCommentsCommands // requires 'EDIT_CONTENT' permission
  groups: IBoardGroupsCommands; // requires 'EDIT_CONTENT' permission

  ui: IBoardUICommands;
  viewport: IBoardViewportCommands;
  selection: IBoardSelectionCommands;

  getPermissions(): Promise<BoardPermission[]>;

  hasPermission(permission: BoardPermission): Promise<boolean>;

  // todo: add in public sdk types
  //  helpers: SDK.IBoardHelpers
  //  enums: SDK.IBoardEnums
}

export interface IBoardEnums {
  readonly shapeType: ShapeWidgetType;
  readonly stickerType: StickerWidgetType;
}

export interface ShapeWidgetType {
  RECTANGLE: number;
  CIRCLE: number;
  TRIANGLE: number;
  BUBBLE: number;
  ROUNDER: number;
  RHOMBUS: number;
  PARALL: number;
  STAR: number;
  ARROW_BIG: number;
}

export interface StickerWidgetType {
  SQUARE: number;
  RECTANGLE: number;
}

export interface IBoardInfoCommands {
  get(): Promise<IBoardInfo>;
}

export interface IBoardUICommands {
  // Promise will resolves when sidebar closes
  // Promise returns data passed in closeLeftSidebar function
  openLeftSidebar(
    iframeURL: string,
    options?: { width?: number },
  ): Promise<any>;

  // Promise will resolves when sidebar closes
  // Promise returns data passed in openRightSidebar function
  openRightSidebar(
    iframeURL: string,
    options?: { width?: number },
  ): Promise<any>;

  // Promise will resolves when library closes
  // Promise returns data passed in closeLibrary function
  openLibrary(iframeURL: string, options: { title: string }): Promise<any>;

  // Promise will resolves when modal closes
  // Promise returns data passed in closeModal function
  openModal(
    iframeURL: string,
    options?: { maxWidth?: number; maxHeight?: number; fullscreen?: boolean },
  ): Promise<any>;

  // Throws error if modal opened not by this plugin
  closeLeftSidebar(data: any);

  // Throws error if sidebar opened not by this plugin
  closeRightSidebar(data: any);

  // Throws error if library opened not by this plugin
  closeLibrary(data: any);

  // Throws error if modal opened not by this plugin
  closeModal(data: any);

  // Experimental feature
  // __presentation: {
  // 	enterViewMode(frameIndex: number)
  // 	presentSlides(frameIndex)
  // 	exit()
  // }

  // Experimental feature
  // Throws error if another plugin already configured UI
  __configure(options: {
    bottomBar?: {
      visible?: boolean;
      availableTools?: BottomBarTool[] | undefined;
    };
    // Throws error if user is not editor
    toolbar?: {
      visible?: boolean;
      availableTools?: ToolbarTool[] | undefined;
    };
    topPanels?: {
      visible?: boolean;
    };
    miniMap?: {
      visible?: boolean;
    };
  });

  // Experimental feature
  // Throws error if another plugin configured UI
  __resetConfig();
}

export type ToolbarTool = 'STICKER' | 'SHAPE' | 'TEXT' | 'COMMENT'; // etc...
export type BottomBarTool = 'FRAMES' | 'COMMENTS' | 'HISTORY'; // etc...

export interface IBoardViewportCommands {
  getViewport(): Promise<IRect>;

  setViewport(viewport: IRect): Promise<IRect>;

  setViewportWithAnimation(viewport: IRect): Promise<IRect>;

  zoomToObject(objectId: string, selectObject?: boolean);

  setZoom(value: number): Promise<number>;

  getZoom(): Promise<number>;
}

export interface IBoardSelectionCommands {
  // Returns selected widgets
  get(): Promise<IBaseWidget[]>;

  // Select target widgets
  // Returns selected widgets
  selectWidgets(widgetIds: string | string[]): Promise<IBaseWidget[]>;

  // Get selected widgets id after user selects it
  // allowMultiSelection is false by default
  enterSelectWidgetsMode(options: {
    allowMultiSelection?: boolean;
  }): Promise<{ selectedWidgets: IBaseWidget[] }>;
}

export type BoardPermission = 'EDIT_INFO' | 'EDIT_CONTENT' | 'EDIT_COMMENTS';

////////////////////////////////////////////////////////////////////////
// Widgets
////////////////////////////////////////////////////////////////////////

export interface IBoardWidgetsCommands {
  create(
    widgets: Array<{ type: string; [index: string]: any }>,
  ): Promise<IBaseWidget[]>; // 'type' is required

  // filterBy uses https://lodash.com/docs/4.17.11#filter
  get(filterBy?: object): Promise<IBaseWidget[]>;

  update(
    widgets: Array<{ id: string; [index: string]: any }>,
  ): Promise<IBaseWidget[]>; // 'id' is required

  transformDelta(
    widgetIds: string | string[],
    deltaX: number | undefined,
    deltaY: number | undefined,
    deltaRotation: number | undefined,
  ): Promise<IBaseWidget[]>;

  deleteById(widgetIds: string | string[]): Promise<void>;

  bringForward(widgetId: string | string[]): Promise<void>;

  sendBackward(widgetId: string | string[]): Promise<void>;

  // Download new version of file by url in Image or Document widget
  __refreshURLResource(widgetId: string): Promise<void>;
}

export interface IBoardCommentsCommands {
  get(): Promise<ICommentData[]>;
}

export interface IBoardGroupsCommands {
  get(): Promise<IGroupData[]>;
}

export interface IGroupData {
  id: string;
  bounds: IBounds;
  childrenIds: string[];
}

export interface IBoardHelpers {
  initScrollableContainerWithDraggableImages(
    container: Element,
    options: {
      // requires 'EDIT_CONTENT' permission
      draggableImageSelector: string;
    },
  ): HTMLElement;
}

////////////////////////////////////////////////////////////////////////
// Widget data types
////////////////////////////////////////////////////////////////////////

type WidgetMetadata = { [x: string]: any };

type WidgetCapabilities = { editable: boolean };

interface IBaseWidgetNamespaces {
  metadata: WidgetMetadata;
  capabilities?: WidgetCapabilities;
}

type BaseWidgetNamespacesKeys = keyof IBaseWidgetNamespaces;

interface IBaseWidget extends IBaseWidgetNamespaces {
  readonly id: string;
  readonly type: string;
  readonly bounds: IBounds;
  readonly groupId?: string;
  readonly zIndex?: number; // defined when type !== 'frame' (not implemented yet)
  readonly createdUserId: string;
  readonly lastModifiedUserId: string;
  clientVisible: boolean;
}

export interface ITextWidgetData extends IBaseWidget {
  type: 'TEXT';
  x: number;
  y: number;
  width: number; // what value if auto-size?
  scale: number;
  rotation: number;
  text: string;
  style: {
    backgroundColor: BackgroundColorStyle;
    backgroundOpacity: BackgroundOpacityStyle;
    borderColor: BorderColorStyle;
    borderWidth: BorderWidthStyle;
    borderStyle: BorderStyleStyle;
    borderOpacity: BorderOpacityStyle;
    fontSize: FontSizeStyle;
    fontFamily: FontFamilyStyle;
    textColor: TextColorStyle;
    textAlign: TextAlignStyle;
  };
}

export interface IImageWidgetData extends IBaseWidget {
  type: 'IMAGE';
  x: number;
  y: number;
  rotation: number;
  width: number;
  scale: number;
  title: string;
  url?: string;
}

export interface IStickerWidgetData extends IBaseWidget {
  type: 'STICKER';
  x: number;
  y: number;
  scale: number;
  text: string;
  style: {
    stickerBackgroundColor: BackgroundColorStyle;
    fontSize: FontSizeStyle;
    textAlign: TextAlignStyle;
    textAlignVertical: TextAlignVerticalStyle;
    stickerType: StickerTypeStyle; // Does not work. It calcs from width
    fontFamily: FontFamilyStyle;
  };
}

export interface IShapeWidgetData extends IBaseWidget {
  type: 'SHAPE';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text: string;
  style: {
    shapeType: ShapeTypeStyle;
    backgroundColor: BackgroundColorStyle;
    backgroundOpacity: BackgroundOpacityStyle;
    borderColor: BorderColorStyle;
    borderWidth: BorderWidthStyle;
    borderStyle: BorderStyleStyle;
    borderOpacity: BorderOpacityStyle;
    fontSize: FontSizeStyle;
    fontFamily: FontFamilyStyle;
    textColor: TextColorStyle;
    textAlign: TextAlignStyle;
    textAlignVertical: TextAlignVerticalStyle;
    highlighting: HighlightingStyle;
    italic: ItalicStyle;
    strike: StrikeStyle;
    underline: UnderlineStyle;
    bold: BoldStyle;
  };
}

export interface ILineWidgetData extends IBaseWidget {
  type: 'LINE';
  startWidgetId: string | undefined;
  endWidgetId: string | undefined;
  startPosition: IPoint;
  endPosition: IPoint;
  style: {
    lineColor: LineColorStyle;
    lineWidth: LineWidthStyle;
    lineStyle: LineStyleStyle;
  };
}

export interface IWebScreenshotWidgetData extends IBaseWidget {
  type: 'WEBSCREEN';
  x: number;
  y: number;
  scale: number;
  url: string;
}

export interface IFrameWidgetData extends IBaseWidget {
  type: 'FRAME';
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  frameIndex: number;
  childrenIds: string[];
  style: {
    backgroundColor: BackgroundColorStyle;
  };
}

export interface ICurveWidgetData extends IBaseWidget {
  type: 'CURVE';
  x: number;
  y: number;
  scale: number;
  rotation: number;
  points: IPoint[];
  style: {
    lineColor: LineColorStyle;
    lineWidth: LineWidthStyle;
  };
}

export interface IEmbedWidgetData extends IBaseWidget {
  type: 'EMBED';
  x: number;
  y: number;
  scale: number;
  html: string;
}

export interface IPreviewWidgetData extends IBaseWidget {
  type: 'PREVIEW';
  x: number;
  y: number;
  scale: number;
  url: string;
}

export interface ICardWidgetData extends IBaseWidget {
  type: 'CARD';
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
  title: string;
  description: string;
  dueDate: {
    from: number;
    to: number;
  };
  assignee: {
    userId: string;
  };
  card: {
    customFields?: {
      value?: string;
      mainColor?: string;
      fontColor?: string;
      iconUrl?: string;
      roundedIcon?: boolean;
    }[];
    logo?: {
      iconUrl: string;
    };
  };
  parentId?: string;
  columnId?: string;
  subcolumnId?: string;
  style: {
    backgroundColor: BackgroundColorStyle;
  };
}

export interface IDocumentWidgetData extends IBaseWidget {
  type: 'DOCUMENT';
  x: number;
  y: number;
  rotation: number;
  scale: number;
  title: string;
}

export interface IMockupWidgetData extends IBaseWidget {
  type: 'MOCKUP';
  x: number;
  y: number;
  rotation: number;
  mockupType: string;
}

export interface ICommentData extends IBaseWidget {
  type: 'COMMENT';
  color: number;
  resolved: boolean;
}

////////////////////////////////////////////////////////////////////////
// Helpers data
////////////////////////////////////////////////////////////////////////

export interface IBoardInfo {
  id: string;
  title: string;
  description: string;
  owner: IUserInfo;
  picture: IPictureInfo;
  currentUserPermission: IBoardPermissionInfo;
  account: IAccountInfo;
  lastModifyingUser: IUserInfo;
  lastModifyingUserName: string;
  lastViewedByMeDate: string;
  modifiedByMeDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserInfo {
  id: string;
  name: string;
  email: string;
  picture: IPictureInfo;
}

export interface IAccountInfo {
  id: string;
  role?: string;
  title: string;
  picture: any;
  type: string;
}

export interface IPictureInfo {
  big: string;
  medium: string;
  small: string;
  resourceId: string;
  size44: string;
  size180: string;
  size210: string;
  size420: string;
  image: string; // original picture
}

export interface IBoardPermissionInfo {
  role: string;
  permissions: string[];
}

export interface IDraggableImageOptions {
  isTouchEvent: boolean;
  preview: {
    width?: number;
    height?: number;
    url: string;
  };
  image: IDroppedImageOptions;
}

export interface IDroppedImageOptions {
  width?: number;
  height?: number;
  url: string;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IBounds {
  x: number;
  y: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

/////////////////////////////////////////////
// Style types
/////////////////////////////////////////////
export type ShapeTypeStyle = number;
export type StickerTypeStyle = number;
export type BackgroundColorStyle = string | number;
export type BackgroundOpacityStyle = number;
export type BorderColorStyle = string | number;
export type BorderWidthStyle = number;
export type BorderStyleStyle = number;
export type BorderOpacityStyle = number;
export type FontSizeStyle = number;
export type FontFamilyStyle = number;
export type TextColorStyle = string | number;
export type TextAlignStyle = 'l' | 'c' | 'r'; // left | center | right
export type TextAlignVerticalStyle = 't' | 'm' | 'b'; // top | middle | bottom
export type HighlightingStyle = string | number;
export type ItalicStyle = 0 | 1;
export type StrikeStyle = 0 | 1;
export type UnderlineStyle = 0 | 1;
export type BoldStyle = 0 | 1;
export type LineColorStyle = string | number;
export type LineWidthStyle = number;
export type LineStyleStyle = number;
