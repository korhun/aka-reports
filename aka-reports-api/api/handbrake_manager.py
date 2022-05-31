import datetime
import os.path
import logging
import re
import sys
import threading
import time
import dateutil.parser

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from utils import file_helper, string_helper
from utils.label_file import LabelFile

from dateutil.tz import UTC

_key_to_handbrake = {}

_observer = {
    "path": "",
    "cached": False
}


def _enumerate_labels(label_fn):
    def get_shape_name():
        return shape["label"] if shape and "label" in shape and shape["label"] else None

    label = LabelFile(label_fn)
    if label.shapes:
        try:
            for shape in label.shapes:
                shape_name = get_shape_name()
                if shape_name:
                    yield shape_name
        except GeneratorExit:
            del label


def _label_has_fault(label_fn):
    for label_name in _enumerate_labels(label_fn):
        if label_name.lower() != "hatasız":
            return True
    return False


def _create_key(barcode, dir_path):
    return hash(f"{barcode}:{dir_path}".encode("utf-8"))


def _get_datetime_from_barcode(barcode):
    try:
        if barcode:
            # res = re.search("_(.([0-9])*)\.(.([0-9])*)\.(.([0-9])*)_", barcode)
            res = re.search(r"_(.(\d)*)\.(.(\d)*)\.(.(\d)*)_", barcode)
            if res:
                txt = res.group()
                if txt:
                    txt = txt.replace("_", "")
                    date = dateutil.parser.parse(txt)
                    return date.isoformat()
    except:  # noqa
        return None


def _create_handbrake(barcode, dir_path):
    """
    :return: None or
    {
        "key": int,
        "barcode": string,
        "has_fault": boolean,
        "scan_date": iso format datetime
        "barcode_date": iso format datetime
        "type": string
        "cam0":
            {
                "image_fn": None or string,
                "label_fn": None or string,
            },
        "cam1": same with cam0
        "cam2": same with cam0
        "cam3": same with cam0
    }
    """
    img_exists = False
    has_fault = False
    handbrake = {
        "key": _create_key(barcode, dir_path),
        "barcode": barcode
    }
    times = []
    for i, suffix in enumerate(["_cam0", "_cam1", "_cam2", "_cam3"]):
        cam_data = {
            "image_fn": None,
            "label_fn": None
        }
        handbrake[f"cam{i}"] = cam_data
        try:
            img_fn = file_helper.path_join(dir_path, f"{barcode}{suffix}.png")
            if not os.path.isfile(img_fn):
                continue
            img_exists = True
            # times.append(time.ctime(os.path.getmtime(img_fn)))
            times.append(os.path.getmtime(img_fn))
            cam_data["image_fn"] = img_fn
            label_fn = file_helper.path_join(dir_path, f"{barcode}{suffix}.json")
            if not os.path.isfile(label_fn):
                continue

            cam_data["label_fn"] = label_fn
            if not has_fault:
                has_fault = _label_has_fault(label_fn)

        except:  # noqa
            logging.exception(sys.exc_info()[2])

    if not img_exists:
        return None
    handbrake["scan_date"] = datetime.datetime.fromtimestamp(min(times)).isoformat()
    handbrake["barcode_date"] = _get_datetime_from_barcode(barcode)
    handbrake["type"] = barcode_type(barcode)
    handbrake["has_fault"] = has_fault
    return handbrake


def barcode_type(barcode):
    return "crm" if string_helper.wildcard(barcode, "*_crm_*", case_insensitive=True) else "blk"


def _watch_workspace():
    observer = Observer()
    event_handler = Handler()
    observer.schedule(event_handler, _observer["path"], recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(5)
    except:  # noqa
        observer.stop()
        print("Error")
    observer.join()


class Handler(FileSystemEventHandler):

    @staticmethod
    def on_any_event(event):  # noqa
        _workspace_changed()
        # print(event)
        # if event.is_directory:
        #     return None
        #
        # elif event.event_type == 'created':
        #     # Take any action here when a file is first created.
        #     print("Received created event - %s." % event.src_path)
        #
        # elif event.event_type == 'modified':
        #     # Taken any action here when a file is modified.
        #     print("Received modified event - %s." % event.src_path)


def _workspace_changed():
    _observer["cached"] = False


def _update_workspace_cache_if_required():
    if _observer["cached"]:
        return
    try:
        workspace_dir = _observer["path"]
        _key_to_handbrake.clear()
        for dir_path in file_helper.enumerate_directories(workspace_dir, recursive=False):
            for fn in file_helper.enumerate_files(dir_path, recursive=False, wildcard_pattern="*_cam0.png", case_insensitive=True):
                dir_name, name, extension = file_helper.get_file_name_extension(fn)
                barcode = name[:-5]
                handbrake = _create_handbrake(barcode, dir_path)
                if handbrake:
                    key = handbrake["key"]
                    _key_to_handbrake[key] = handbrake
    finally:
        _observer["cached"] = True


def set_workspace_dir(workspace_dir):
    logging.info(f"workspace_dir: {workspace_dir}")
    if _observer["path"] != workspace_dir:
        _observer["path"] = workspace_dir
        background_thread = threading.Thread(target=_watch_workspace, args=())
        background_thread.daemon = True
        background_thread.start()
    _workspace_changed()


def get_handbrake_info(handbrake, options):
    if options and "only_barcode" in options:
        return handbrake["barcode"]
    res = {
        "key": handbrake["key"],
        "barcode": handbrake["barcode"],
        "scan_date": handbrake["scan_date"],
        "barcode_date": handbrake["barcode_date"],
        "has_fault": handbrake["has_fault"],
        "type": handbrake["type"],
    }
    if options and "include_thumbs" in options:
        raise NotImplementedError()
    return res


def _handbrake_sort_key(handbrake, sort_active):
    res = handbrake[sort_active]
    return res if res else ""


def search(options):
    def is_ok():
        barcode = handbrake["barcode"]
        if not (no_pattern or string_helper.wildcard(barcode, pattern, case_insensitive=True)):
            return False

        if not include_fault or not include_no_fault:
            if not include_fault and handbrake["has_fault"]:
                return False
            if not include_no_fault and not handbrake["has_fault"]:
                return False

        if not type_crm or not type_blk:
            btype = barcode_type(barcode)
            if not type_crm and btype == "crm":
                return False
            if not type_blk and btype == "blk":
                return False

        if date_start or date_end or not date_shift1 or not date_shift2 or not date_shift3:
            scan_date = dateutil.parser.isoparse(handbrake["scan_date"]).astimezone(UTC)
            if date_start:
                start = dateutil.parser.isoparse(date_start).astimezone(UTC)
                if scan_date < start:
                    return False
            if date_end:
                end = dateutil.parser.isoparse(date_end).astimezone(UTC) + datetime.timedelta(days=1)
                if scan_date > end:
                    return False

            hour = scan_date.astimezone().hour
            if not date_shift1 and 8 < hour < 16:
                return False
            if not date_shift2 and 16 < hour:
                return False
            if not date_shift3 and hour < 8:
                return False

        if barcode_date_start or barcode_date_end:
            barcode_date = handbrake["barcode_date"]
            if not barcode_date:
                return False
            barcode_date = dateutil.parser.isoparse(handbrake["barcode_date"]).astimezone(UTC)
            if barcode_date_start:
                start = dateutil.parser.isoparse(barcode_date_start).astimezone(UTC)
                if barcode_date < start:
                    return False
            if barcode_date_end:
                end = dateutil.parser.isoparse(barcode_date_end).astimezone(UTC) + datetime.timedelta(days=1)
                if barcode_date > end:
                    return False

        return True

    _update_workspace_cache_if_required()
    barcode_filter = options.get("barcode_filter", "")
    include_fault = options.get("include_fault", True)
    include_no_fault = options.get("include_no_fault", True)
    type_crm = options.get("type_crm", True)
    type_blk = options.get("type_blk", True)

    date_start = options.get("date_start", None)
    date_end = options.get("date_end", None)
    date_shift1 = options.get("date_shift1", True)
    date_shift2 = options.get("date_shift2", True)
    date_shift3 = options.get("date_shift3", True)

    barcode_date_start = options.get("barcode_date_start", None)
    barcode_date_end = options.get("barcode_date_end", None)

    sort_asc = options.get("sort_asc", True)
    sort_active = options.get("sort_active", True)
    page_index = options.get("page_index", 0)
    page_size = options.get("page_size", 0)

    pattern = f"*{barcode_filter}*" if barcode_filter else None
    no_pattern = pattern is None

    logging.info(f"barcode_filter: {barcode_filter}")

    if sort_active not in ["scan_date", "barcode_date", "barcode"]:
        sort_active = "scan_date"
    handbrakes = sorted(_key_to_handbrake.values(), key=lambda x: _handbrake_sort_key(x, sort_active), reverse=not sort_asc)

    res_handbrakes = []
    res_count = 0
    res_count_fault = 0
    res_count_no_fault = 0

    current_page = 0
    current_page_count = 0
    count_fault = 0
    count_no_fault = 0
    for handbrake in handbrakes:
        if is_ok():
            res_count += 1
            if handbrake["has_fault"]:
                count_fault += 1
            else:
                count_no_fault += 1
            if current_page == page_index:
                res_handbrakes.append(get_handbrake_info(handbrake, options))
            current_page_count += 1
            if current_page_count >= page_size:
                current_page += 1
                current_page_count = 0
    return {
        "handbrakes": res_handbrakes,
        "count": res_count,
        "fault_results": [
            {
                "name": "Hatalı",
                "value": count_fault,
            },
            {
                "name": "Hatasız",
                "value": count_no_fault,
            }
        ]
    }



#
# def search(options):
#     def is_ok():
#         barcode = handbrake["barcode"]
#         if not (no_pattern or string_helper.wildcard(barcode, pattern, case_insensitive=True)):
#             return False
#
#         if not include_fault or not include_no_fault:
#             if not include_fault and handbrake["has_fault"]:
#                 return False
#             if not include_no_fault and not handbrake["has_fault"]:
#                 return False
#
#         if not type_crm or not type_blk:
#             btype = barcode_type(barcode)
#             if not type_crm and btype == "crm":
#                 return False
#             if not type_blk and btype == "blk":
#                 return False
#
#         if date_start or date_end or not date_shift1 or not date_shift2 or not date_shift3:
#             scan_date = dateutil.parser.isoparse(handbrake["scan_date"]).astimezone(UTC)
#             if date_start:
#                 start = dateutil.parser.isoparse(date_start).astimezone(UTC)
#                 if scan_date < start:
#                     return False
#             if date_end:
#                 end = dateutil.parser.isoparse(date_end).astimezone(UTC) + datetime.timedelta(days=1)
#                 if scan_date > end:
#                     return False
#
#             hour = scan_date.astimezone().hour
#             if not date_shift1 and 8 < hour < 16:
#                 return False
#             if not date_shift2 and 16 < hour:
#                 return False
#             if not date_shift3 and hour < 8:
#                 return False
#
#         if barcode_date_start or barcode_date_end:
#             barcode_date = handbrake["barcode_date"]
#             if not barcode_date:
#                 return False
#             barcode_date = dateutil.parser.isoparse(handbrake["barcode_date"]).astimezone(UTC)
#             if barcode_date_start:
#                 start = dateutil.parser.isoparse(barcode_date_start).astimezone(UTC)
#                 if barcode_date < start:
#                     return False
#             if barcode_date_end:
#                 end = dateutil.parser.isoparse(barcode_date_end).astimezone(UTC) + datetime.timedelta(days=1)
#                 if barcode_date > end:
#                     return False
#
#         return True
#
#     _update_workspace_cache_if_required()
#     only_count = options.get("only_count", False)
#     barcode_filter = options.get("barcode_filter", "")
#     include_fault = options.get("include_fault", True)
#     include_no_fault = options.get("include_no_fault", True)
#     type_crm = options.get("type_crm", True)
#     type_blk = options.get("type_blk", True)
#
#     date_start = options.get("date_start", None)
#     date_end = options.get("date_end", None)
#     date_shift1 = options.get("date_shift1", True)
#     date_shift2 = options.get("date_shift2", True)
#     date_shift3 = options.get("date_shift3", True)
#
#     barcode_date_start = options.get("barcode_date_start", None)
#     barcode_date_end = options.get("barcode_date_end", None)
#
#     sort_asc = options.get("sort_asc", True)
#     sort_active = options.get("sort_active", True)
#     page_index = options.get("page_index", 0)
#     page_size = options.get("page_size", 0)
#
#     pattern = f"*{barcode_filter}*" if barcode_filter else None
#     no_pattern = pattern is None
#
#     logging.info(f"barcode_filter: {barcode_filter}")
#
#     if sort_active not in ["scan_date", "barcode_date", "barcode"]:
#         sort_active = "scan_date"
#     handbrakes = sorted(_key_to_handbrake.values(), key=lambda x: _handbrake_sort_key(x, sort_active), reverse=not sort_asc)
#
#     if only_count:
#         count = 0
#         for handbrake in handbrakes:
#             if is_ok():
#                 count += 1
#         return count
#     else:
#         res = []
#         current_page = 0
#         current_page_count = 0
#         for handbrake in handbrakes:
#             if current_page > page_index:
#                 break
#             if is_ok():
#                 if current_page == page_index:
#                     res.append(get_handbrake_info(handbrake, options))
#                 current_page_count += 1
#                 if current_page_count >= page_size:
#                     current_page += 1
#                     current_page_count = 0
#         return res
