export interface HandbrakeItem {
  barcode: string;
  createDate: Date;
}
export class HandbrakeItemHelper {
  public static validate(obj: HandbrakeItem): void {
      if (obj.barcode == null)
          obj.barcode = ""
      if (obj.createDate == null)
          obj.createDate = new Date('0001-01-01T00:00:00Z');
  }
}
