export enum AppMode {
  HOME = 'HOME',
  MONTESSORI = 'MONTESSORI',
  SECONDARY = 'SECONDARY',
}

export enum SectionType {
  TEXT = 'text',
  MATCHING = 'matching',
  FILL_BLANK = 'fill-blank',
  DRAWING = 'drawing',
  MATH = 'math',
  IMAGE = 'image'
}

export interface WorksheetSection {
  id: string;
  type: SectionType;
  title?: string;
  content: any; // Flexible content based on type
  boundingBox?: number[]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  imagePrompt?: string; // Description for AI image generation
  generatedImageUrl?: string; // URL/Base64 of generated image
}

export interface WorksheetData {
  title: string;
  subject?: string;
  gradeLevel?: string;
  instructions?: string;
  sections: WorksheetSection[];
}

export interface ExamQuestion {
  id: string;
  number: string;
  text: string;
  marks: number;
}

export interface ExamData {
  institution: string;
  subject: string;
  grade: string;
  duration: string;
  date?: string;
  instructions: string[];
  questions: ExamQuestion[];
}

export interface SearchResult {
  title: string;
  uri: string;
}