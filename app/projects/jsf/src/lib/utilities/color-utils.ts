import { ralColors } from './ral-colors';

interface RalItem {
  code: string;
  hex: string;
}

export class ColorUtils {

  private ralLookupTable: RalItem[] = [];

  constructor() {
    this.ralLookupTable = Object.keys(ralColors).map(x => ({
      code: x,
      hex: ralColors[x]
    }))
      .sort((a, b) => parseInt(a.code, 10) - parseInt(b.code, 10));
  }

  getAllRalColors(): RalItem[] {
    return this.ralLookupTable;
  }

  getRalColor(ral: string | number): RalItem {
    return this.ralLookupTable.find(x => x.code === ral.toString());
  }

  ralToHex(ral: string | number): string {
    return this.getRalColor(ral).hex;
  }
}

export const colorUtils = new ColorUtils();
