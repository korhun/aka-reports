import base64

import numpy as np
import cv2

from utils import image_helper
from utils.color_generator import ColorGenerator

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


def _draw_shapes(frame, guess_shape_results, h_pixmap):
    if guess_shape_results is not None:
        shapes = guess_shape_results["shapes"] if "shapes" in guess_shape_results else None
        elapsed = guess_shape_results["time"] if "time" in guess_shape_results else None
        h0 = frame.shape[0]
        h = 600 * h0 / h_pixmap
        font_scale = h / 1024.0
        thickness = int(h / 240.0)
        thickness7 = thickness * 7
        thickness_back = int(thickness * 2.0)
        txt_thickness = int(thickness * 0.67)
        txt_thickness_back = int(txt_thickness * 2.0)
        shift = thickness * 2.0
        if shapes and len(shapes) > 0:
            for shape in shapes:
                rect = shape["rect"]
                class_name = shape["class_name"]
                rgb = _get_rgb_by_label(class_name)
                # col = [rgb[2], rgb[1], rgb[0]]
                col = [rgb[2], rgb[1], rgb[0]]
                c = np.array(rect[:4], dtype=np.int32)
                c1, c2 = [c[1], c[0]], [c[3], c[2]]
                cv2.rectangle(frame, c1, c2, color=[1, 1, 1], thickness=thickness_back)
                cv2.rectangle(frame, c1, c2, color=col, thickness=thickness)
                # c = [c[1] - shift, c[0] - shift * 1.4]
                c = [c[1], max(thickness7, c[0] - shift * 1.4)]
                image_helper.put_text(frame, class_name, c, color=col, back_color=[1, 1, 1], font_scale=font_scale, thickness=txt_thickness, thickness_back=txt_thickness_back)
        if elapsed:
            image_helper.put_text(frame, "{:.2f}sec.".format(elapsed), [thickness7, thickness7 * 2], color=[255, 255, 255], back_color=[1, 1, 1], font_scale=font_scale, thickness=txt_thickness, thickness_back=txt_thickness_back)


def get_preview(handbrake):
    res = {}
    for i in range(4):
        image_fn = handbrake[f"cam{i}"]["image_fn"]
        label_fn = handbrake[f"cam{i}"]["label_fn"]

        res[f"cam{i}"] = {
            "preview": image_helper.to_base64(image_helper.read(image_fn)).decode("utf-8")
        }

    return res
