import datetime
import os.path
import logging
import sys
import time

from utils import file_helper, string_helper
from utils.label_file import LabelFile

_dir_to_keys = {}
_key_to_handbrake = {}
_barcode_to_keys = {}


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


def _create_handbrake(barcode, dir_path):
    """
    :return: None or
    {
        "key": int,
        "barcode": string,
        "has_fault": boolean,
        "time": iso format datetime
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
    res = {
        "key": _create_key(barcode, dir_path),
        "barcode": barcode
    }
    times = []
    for i, suffix in enumerate(["_cam0", "_cam1", "_cam2", "_cam3"]):
        cam_data = {
            "image_fn": None,
            "label_fn": None
        }
        res[f"cam{i}"] = cam_data
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
    res["time"] = datetime.datetime.fromtimestamp(min(times)).isoformat()
    res["type"] = "crm" if string_helper.wildcard(barcode, "*_crm_*", case_insensitive=True) else "blk"
    res["has_fault"] = has_fault
    return res


def set_workspace_dir(workspace_dir):
    _dir_to_keys.clear()
    _key_to_handbrake.clear()
    _barcode_to_keys.clear()

    for dir_path in file_helper.enumerate_directories(workspace_dir, recursive=False):
        keys = []
        _dir_to_keys[dir_path] = keys
        for fn in file_helper.enumerate_files(dir_path, recursive=False, wildcard_pattern="*_cam0.png", case_insensitive=True):
            dir_name, name, extension = file_helper.get_file_name_extension(fn)
            barcode = name[:-5]
            handbrake = _create_handbrake(barcode, dir_path)
            if handbrake:
                key = handbrake["key"]
                keys.append(key)
                _key_to_handbrake[key] = handbrake
                if barcode in _barcode_to_keys:
                    _barcode_to_keys[barcode].append(key)
                else:
                    _barcode_to_keys[barcode] = [key]


def get_handbrake_info(key, options):
    """
        options: optional ["only_barcode", "include_thumbs"]
    """
    handbrake = _key_to_handbrake[key]
    if options and "only_barcode" in options:
        return handbrake["barcode"]
    res = {
        "key": handbrake["key"],
        "barcode": handbrake["barcode"],
        "time": handbrake["time"],
        "has_fault": handbrake["has_fault"],
        "type": handbrake["type"],
    }
    if options and "include_thumbs" in options:
        raise NotImplementedError()
    return res


def search(barcode_pattern, limit, options):
    if limit and barcode_pattern:
        limit = int(limit)
        if limit <= 0:
            return
        pattern = f"*{barcode_pattern}*"
        i = 0
        for barcode, keys in _barcode_to_keys.items():
            if string_helper.wildcard(barcode, pattern, case_insensitive=True):
                for key in keys:
                    yield get_handbrake_info(key, options)
                    i += 1
                    if i == limit:
                        return
