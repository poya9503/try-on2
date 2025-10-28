
export enum ModelType {
  Korean = "Korean",
  Chinese = "Chinese",
  European = "European/American",
}

export interface ImageFile {
  base64: string;
  mimeType: string;
}
