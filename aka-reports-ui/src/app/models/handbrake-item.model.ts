import { NONE_TYPE } from "@angular/compiler";

export interface HandbrakeItem {
  key: string;
  barcode: string;
  has_fault: boolean;
  fault_names: string;
  scan_date: Date;
  barcode_date: Date;
  type: string;
  imgSrc: string;
}

export interface HandbrakeSearchResult {
  handbrakes: HandbrakeItem[];
  count: number;
  fault_results: any[];
  type_results: any[];
  count_series: any[];
  shift_series: any[];
}

export interface HandbrakeSearchOptions {
  only_count: boolean,
  barcode_filter: string,
  include_fault: boolean,
  include_no_fault: boolean,
  type_crm: boolean,
  type_blk: boolean,
  type_unknown: boolean,

  date_start: any,
  date_end: any,
  date_shift1: boolean,
  date_shift2: boolean,
  date_shift3: boolean,

  barcode_date_start?: any,
  barcode_date_end?: any,

  sort_asc: boolean,
  sort_active: string,
  page_index: number,
  page_size: number
}

export interface HandbrakeDetails {
  key: string;
  barcode: string;
  has_fault: boolean;
  fault_names: string;
  scan_date?: any,
  barcode_date?: any,
  type: string;
  cams: Array<CamDetails>;
}
export interface CamDetails{
  preview: string;
}


export class HandbrakeHelper {
  public static createDefaultHandbrakeSearchResult(): HandbrakeSearchResult {
    return {
      handbrakes: [],
      count: 0,
      fault_results: [],
      type_results: [],
      count_series: [],
      shift_series: [],
    }
  }

  public static createDefaultHandbrakeDetails(): HandbrakeDetails {
    return {
      key: "",
      barcode: "",
      has_fault: false,
      fault_names: "",
      scan_date: null,
      barcode_date: null,
      type: "",
      cams: []
    }
  }

  public static createDefaultOptions(): HandbrakeSearchOptions {
    return {
      only_count: false,
      barcode_filter: "",
      include_fault: true,
      include_no_fault: true,
      type_crm: true,
      type_blk: true,
      type_unknown: true,

      date_start: null,
      date_end: null,
      date_shift1: true,
      date_shift2: true,
      date_shift3: true,

      barcode_date_start: null,
      barcode_date_end: null,

      sort_asc: true,
      sort_active: "",
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
      type_unknown: options.type_unknown,

      date_start: options.date_start,
      date_end: options.date_end,
      date_shift1: options.date_shift1,
      date_shift2: options.date_shift2,
      date_shift3: options.date_shift3,

      barcode_date_start: options.barcode_date_start,
      barcode_date_end: options.barcode_date_end,

      sort_asc: true,
      sort_active: "",
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
      !options.type_unknown ||
      options.date_start ? true : false ||
        options.date_end ? true : false ||
          !options.date_shift1 ||
          !options.date_shift2 ||
          !options.date_shift3 ||
          options.barcode_date_start ? true : false ||
            options.barcode_date_end ? true : false
  }

  public static validateHandbrake(obj: HandbrakeItem): void {
    obj.imgSrc = "assets/img/$.png".replace("$", obj.has_fault ? obj.type + "_err" : obj.type)
  }

  public static getHandbrakeSearchResult(obj: object): HandbrakeSearchResult {
    const res = obj as HandbrakeSearchResult;
    res.handbrakes.forEach(element => {
      this.validateHandbrake(element)
    })
    return res
  }

  public static getHandbrakeDetails(obj: object): HandbrakeDetails {
    return obj as HandbrakeDetails;
  }

}
