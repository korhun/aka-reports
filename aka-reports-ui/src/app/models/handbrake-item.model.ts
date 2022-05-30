
export interface HandbrakeItem {
  key: number;
  barcode: string;
  has_fault: boolean;
  scan_date: Date;
  barcode_date: Date;
  type: string;
  imgSrc: string;
}

export interface HandbrakeSearchOptions {
  only_count: boolean,
  barcode_filter: string,
  include_fault: boolean,
  include_no_fault: boolean,
  type_crm: boolean,
  type_blk: boolean,

  date_start: any,
  date_end: any,
  date_shift1: boolean,
  date_shift2: boolean,
  date_shift3: boolean,

  barcode_date_start?: any,
  barcode_date_end?: any,

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
      type_crm: true,
      type_blk: true,

      date_start: null,
      date_end: null,
      date_shift1: true,
      date_shift2: true,
      date_shift3: true,

      barcode_date_start: null,
      barcode_date_end: null,

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
      type_crm: options.type_crm,
      type_blk: options.type_blk,

      date_start: options.date_start,
      date_end: options.date_end,
      date_shift1: options.date_shift1,
      date_shift2: options.date_shift2,
      date_shift3: options.date_shift3,

      barcode_date_start: options.barcode_date_start,
      barcode_date_end: options.barcode_date_end,

      sort_asc: true,
      page_index: 0,
      page_size: 0,
    }
  }
  public static filterExists(options: HandbrakeSearchOptions): boolean {
    return options.barcode_filter ? true : false ||
      !options.include_fault ||
      !options.include_no_fault ||
      !options.type_crm ||
      !options.type_blk ||
      options.date_start ? true : false ||
      options.date_end ? true : false ||
      !options.date_shift1 ||
      !options.date_shift2 ||
      !options.date_shift3 ||
      options.barcode_date_start ? true : false ||
      options.barcode_date_end ? true : false
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
