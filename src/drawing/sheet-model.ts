export type SheetFormat = "A0" | "A1" | "A2";
export type SheetOrientation = "landscape" | "portrait";

export interface TitleBlock {
  project: string;
  owner?: string;
  ownerRut?: string;
  address?: string;
  commune?: string;
  region?: string;
  destination?: string;
  utm?: string;
  wgs84?: string;
  authorizedInstaller?: string;
  secClass?: string;
  date?: string;
  scale: string;
  format: SheetFormat;
  sheet: string;
  revision: number;
}

export interface DrawingSheet {
  id: string;
  title: string;
  format: SheetFormat;
  orientation: SheetOrientation;
  titleBlock: TitleBlock;
  notes: string[];
}
