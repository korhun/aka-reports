import base64

import numpy as np
import cv2

from utils import image_helper
from utils.color_generator import ColorGenerator
from utils.label_file import LabelFile

_color_generator = ColorGenerator(label_colors={
    "HATALI": [248, 49, 47],
    "HATASIZ": [76, 175, 80],
    "ÇİZİK": [248, 49, 47],
    "DEFORMASYON": [248, 49, 47],
    "KABARMA": [248, 49, 47],
    "LEKELİ": [248, 49, 47],
    "ŞİŞKİNLİK": [248, 49, 47],
})


def _get_rgb_by_label(label):
    rgb, exists = _color_generator.get_color(label)
    return rgb


def _draw_shapes(frame, shapes):
    h = 600
    font_scale = h / 512.0
    thickness = int(h / 240.0)
    thickness_back = int(thickness * 2.0)
    txt_thickness = int(thickness * 0.67)
    txt_thickness_back = int(txt_thickness * 2.0)
    shift = thickness * 2.0
    font = cv2.FONT_HERSHEY_DUPLEX
    if shapes and len(shapes) > 0:
        for shape in shapes:
            rect = shape["points"]
            class_name = shape["label"]
            text_size = cv2.getTextSize(class_name, font, font_scale, txt_thickness)[0]
            rgb = _get_rgb_by_label(class_name)
            col = [rgb[2], rgb[1], rgb[0]]
            c1, c2 = [int(rect[1][0]), int(rect[1][1])], [int(rect[0][0]), int(rect[0][1])]
            cv2.rectangle(frame, c1, c2, color=[1, 1, 1], thickness=thickness_back)
            cv2.rectangle(frame, c1, c2, color=col, thickness=thickness)
            c = [int((c1[0] + c2[0]) * 0.5 - text_size[0] * 0.5), int((c1[1] + c2[1]) * 0.5)]
            image_helper.put_text(frame, class_name, c, color=col, back_color=[1, 1, 1], font_scale=font_scale, thickness=txt_thickness, thickness_back=txt_thickness_back)
    return frame


def get_preview(handbrake):
    res = {}
    for i in range(4):
        image_fn = handbrake[f"cam{i}"]["image_fn"]
        label_fn = handbrake[f"cam{i}"]["label_fn"]

        lbl = LabelFile(label_fn)
        img = _draw_shapes(image_helper.read(image_fn), lbl.shapes)

        res[f"cam{i}"] = {
            "preview": image_helper.to_base64(img).decode("utf-8")
        }

    return res
