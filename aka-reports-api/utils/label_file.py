import contextlib
import io
import json
import os.path
import os.path as osp

import PIL.Image

from utils import file_helper

PIL.Image.MAX_IMAGE_PIXELS = None


@contextlib.contextmanager
def open_json(name, mode):
    assert mode in ["r", "w"]
    encoding = "utf-8"
    yield io.open(name, mode, encoding=encoding)
    return


class LabelFileError(Exception):
    pass


class LabelFile(object):
    suffix = ".json"

    def __init__(self, filename: str):
        self.flags = None
        self.otherData = None
        self.shapes = []
        self.imagePath = None

        self.filename = filename
        if filename and os.path.isfile(filename):
            self.load(filename)

    @staticmethod
    def image_pil_to_image_data(image_pil):
        with io.BytesIO() as f:
            format_ = "PNG"
            image_pil.save(f, format=format_)
            f.seek(0)
            return f.read()

    @staticmethod
    def get_image_path(labelfile_filename, data):
        image_path = data["imagePath"]
        if not os.path.isfile(image_path):
            image_path = osp.join(osp.dirname(labelfile_filename), data["imagePath"])
        if not os.path.isfile(image_path):
            for ext in ["png", "jpg", "jpeg"]:
                fn = file_helper.change_file_extension(labelfile_filename, ext)
                if os.path.isfile(fn):
                    image_path = fn
                    break
        return image_path

    def load(self, filename):
        keys = [
            "version",
            "imageData",
            "imagePath",
            "shapes",  # polygonal annotations
            "flags",  # image level flags
            "imageHeight",
            "imageWidth",
        ]
        shape_keys = [
            "label",
            "points",
            "group_id",
            "shape_type",
            "flags",
        ]
        try:
            with open_json(filename, "r") as f:
                try:
                    data = json.load(f)
                finally:
                    f.close()
            image_path = self.get_image_path(filename, data)
            flags = data.get("flags") or {}
            shapes = [
                dict(
                    label=s["label"],
                    points=s["points"],
                    shape_type=s.get("shape_type", "polygon"),
                    flags=s.get("flags", {}),
                    group_id=s.get("group_id"),
                    other_data={
                        k: v for k, v in s.items() if k not in shape_keys
                    },
                )
                for s in data["shapes"]
            ]
        except Exception as e:
            raise LabelFileError(e)

        other_data = {}
        for key, value in data.items():
            if key not in keys:
                other_data[key] = value

        # Only replace data after everything is loaded.
        self.flags = flags
        self.shapes = shapes
        self.imagePath = image_path
        self.filename = filename
        self.otherData = other_data

    @staticmethod
    def is_label_file(filename):
        return osp.splitext(filename)[1].lower() == LabelFile.suffix
