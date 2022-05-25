export interface HandbrakeItem {
  key: number;
  barcode: string;
  has_fault: boolean;
  type: string;
  time: Date;
  imgSrc: string;
}

export interface HandbrakeSearchOptions {
  only_count: boolean,
  barcode_filter: string,
  include_fault: boolean,
  include_no_fault: boolean,

  sort_asc: boolean,
  page_index: number,
  page_size: number
}

export class HandbrakeHelper {
  public static createDefaultOptions(): HandbrakeSearchOptions {
    return {
      only_count: false,
      barcode_filter: "",
      include_fault: true,
      include_no_fault: true,

      sort_asc: true,
      page_index: 0,
      page_size: 0,
    }
  }
  public static createOptionsForCount(options: HandbrakeSearchOptions): HandbrakeSearchOptions {
    return {
      only_count: true,
      barcode_filter: options.barcode_filter,
      include_fault: options.include_fault,
      include_no_fault: options.include_no_fault,

      sort_asc: true,
      page_index: 0,
      page_size: 0,
    }
  }

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
