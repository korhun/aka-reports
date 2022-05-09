import json
import os
import random
import string
import cv2
import numpy
from abc import ABC

from tornado.escape import json_decode

from api.base_handler import BaseHandler

import logging


logger = logging.getLogger(__name__)


class ReportsHandler(BaseHandler, ABC):

    def post(self):
        self.write({
            "deneme": "aaaaaaaaaaaa"
        })
