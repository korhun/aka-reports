import os.path
import logging
import sys

from utils import file_helper, string_helper
from utils.label_file import LabelFile

_dir_to_keys = {}
_key_to_handbrakes = {}
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


def _create_handbrake(barcode, dir_path):
    """
    :return: None or
    {
        "barcode": string,
        "has_fault": boolean,
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
    res = {"barcode": barcode}
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

    res["has_fault"] = has_fault
    return res


def set_workspace_dir(workspace_dir):
    _dir_to_keys.clear()
    _key_to_handbrakes.clear()
    _barcode_to_keys.clear()

    for dir_path in file_helper.enumerate_directories(workspace_dir, recursive=False):
        keys = []
        _dir_to_keys[dir_path] = keys
        for fn in file_helper.enumerate_files(dir_path, recursive=False, wildcard_pattern="*_cam0.png", case_insensitive=True):
            dir_name, name, extension = file_helper.get_file_name_extension(fn)
            barcode = name[:-5]
            handbrake = _create_handbrake(barcode, dir_path)
            if handbrake:
                key = f"{dir_name}_{barcode}"
                keys.append(key)
                _key_to_handbrakes[key] = handbrake
                if barcode in _barcode_to_keys:
                    _barcode_to_keys[barcode].append(key)
                else:
                    _barcode_to_keys[barcode] = [key]


def find_handbrakes_by_barcode(barcode_pattern, limit):
    if barcode_pattern:
        pattern = f"*{barcode_pattern}*"
        for barcode, keys in _barcode_to_keys.items():
            if string_helper.wildcard(barcode, pattern, case_insensitive=True):
                for key in keys:
                    yield _key_to_handbrakes[key]


def search_barcodes(search_text, limit):
    for handbrake in find_handbrakes_by_barcode(search_text, limit):
        yield handbrake["barcode"]
