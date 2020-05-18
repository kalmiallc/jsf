export type CustomComponentFactory = (id: string, config: any) => CustomComponentInterface;

export interface CustomComponentInterface {

  styleUrls: string[];
  styles: string[];

  scriptUrls: string[];
  scripts: string[];

  html: string;

  dependencies: string[];
  layoutDependencies: string[];

  onInit: (context: any) => void;
  onUpdate: (context: any) => void;
  onDestroy: (context: any) => void;

}
