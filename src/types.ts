/**
 * TypeScript Types for LocalPDFManager Unified Workspace State
 */
export interface WorkspaceItem {
  id: string;          // Unique identifier for rearranging
  name: string;        // Name of the originating file
  type: string;        // 'pdf' or image extension (png, jpeg, webp, svg, etc.)
  dataUrl: string;     // Base64 or serialized preview string for canvas rendering and merging
  pageIndex?: number;  // Page number index (0-based) if extracted from a PDF
  fileSize?: string;   // Optional size representation for display
  width?: number;      // Width of the file/page in pixels
  height?: number;     // Height of the file/page in pixels
  aspectRatio?: string; // Standard or computed aspect ratio (e.g. 16:9, 9:16)
  rotation?: number;   // Rotation angle in degrees (0, 90, 180, 270)
  originalDataUrl?: string; // Optional raw data url before any cropping
}

export interface SavedPDFBundle {
  id: string;
  name: string;
  fileSize: string;
  pages: WorkspaceItem[]; // All pages in this PDF
}

export type AppView = 'workspace' | 'python-code';
