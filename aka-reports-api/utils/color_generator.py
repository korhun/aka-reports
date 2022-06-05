import numpy as np
from imgviz import rgb2hsv, hsv2rgb


class ColorGenerator:

    def __init__(self, label_colors):
        self._label_colors = label_colors if label_colors else {}
        self._lst_rgb = self._generate_colors()
        self._i = 0
        # self._color_map_value = 200
        # self._color_map = self._label_colormap(256, self._color_map_value)

    def get_color(self, label_name: str):
        if label_name in self._label_colors:
            return self._label_colors[label_name], True
        else:
            rgb = self._lst_rgb[self._i % len(self._lst_rgb)]
            self._i += 1
            self._label_colors[label_name] = rgb
            return rgb, False

    @staticmethod
    def _generate_colors():
        res = []
        colors = ColorGenerator._label_colormap(256, 200)
        for r, g, b in colors:
            if r > 0 or g > 0 or b > 0:
                rgb = [int(r), int(g), int(b)]
                if rgb not in res:
                    res.append(rgb)

        colors = ColorGenerator._label_colormap(512, 180)
        for r, g, b in colors:
            if r > 0 or g > 0 or b > 0:
                rgb = [int(r), int(g), int(b)]
                if rgb not in res:
                    res.append(rgb)

        # colors = ColorGenerator._label_colormap(1024, 150)
        # for r, g, b in colors:
        #     if r > 0 or g > 0 or b > 0:
        #         rgb = [r, g, b]
        #         if rgb not in res:
        #             res.append(rgb)
        return res

    @staticmethod
    def _label_colormap(n_label=256, value=None):
        """Label colormap.
        Parameters
        ----------
        n_label: int
            Number of labels (default: 256).
        value: float or int
            Value scale or value of label color in HSV space.
        Returns
        -------
        cmap: numpy.ndarray, (N, 3), numpy.uint8
            Label id to colormap.
        """

        def bitget(byteval, idx):
            shape = byteval.shape + (8,)
            return np.unpackbits(byteval).reshape(shape)[..., -1 - idx]

        i = np.arange(n_label, dtype=np.uint8)
        # r = np.full_like(i, 0)
        # g = np.full_like(i, 0)
        # b = np.full_like(i, 0)

        i = np.repeat(i[:, None], 8, axis=1)
        i = np.right_shift(i, np.arange(0, 24, 3)).astype(np.uint8)
        j = np.arange(8)[::-1]
        r = np.bitwise_or.reduce(np.left_shift(bitget(i, 0), j), axis=1)
        g = np.bitwise_or.reduce(np.left_shift(bitget(i, 1), j), axis=1)
        b = np.bitwise_or.reduce(np.left_shift(bitget(i, 2), j), axis=1)

        cmap = np.stack((r, g, b), axis=1).astype(np.uint8)

        if value is not None:
            hsv = rgb2hsv(cmap.reshape((1, -1, 3)))
            if isinstance(value, float):
                hsv[:, 1:, 2] = hsv[:, 1:, 2].astype(float) * value
            else:
                assert isinstance(value, int)
                hsv[:, 1:, 2] = value
            cmap = hsv2rgb(hsv).reshape(-1, 3)
        return cmap
