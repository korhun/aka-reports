export interface HandbrakeItem {
  key: number;
  barcode: string;
  has_fault: boolean;
  type: string;
  time: Date;
  imgSrc: string;
}

export class HandbrakeItemHelper {
  public static validate(obj: HandbrakeItem): void {
    // if (obj.barcode == null)
    //     obj.barcode = ""
    // if (obj.has_fault == null)
    //     obj.has_fault = false;
    // if (obj.date == null)
    //     obj.date = new Date('0001-01-01T00:00:00Z');

    obj.imgSrc = "/assets/img/$.png".replace("$", obj.has_fault ? obj.type + "_err" : obj.type)
    // obj.imgSrc = "/assets/img/$.png".replace("$", obj.type + "_err" : obj.type)
  }

  public static getHandbrakeItems(obj: object): HandbrakeItem[] {
    const res = obj as HandbrakeItem[];
    res.forEach(element => {
      this.validate(element)
    })
    return res
  }
}
