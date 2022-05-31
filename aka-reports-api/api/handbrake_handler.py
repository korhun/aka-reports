import json
import os
import random
import string
import time
from typing import Any

import cv2
import numpy
from abc import ABC

import yaml
from tornado import httputil
from tornado.escape import json_decode

from tornado.web import RequestHandler, Application

from api import handbrake_manager
from api.base_handler import BaseHandler

import logging

from utils import file_helper

logger = logging.getLogger(__name__)


class HandbrakeHandler(BaseHandler, ABC):

    def get(self):
        """
        options: {
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
            sort_active: string,
            page_index: number,
            page_size: number
        }
        """
        # time.sleep(0.1)
        args = self.request.arguments if self.request and self.request.arguments else None
        if args is None:
            self.set_status(400)
            return

        options = self.get_argument('options', None)
        options = {} if options is None else json.loads(options)
        res = handbrake_manager.search(options)
        self.set_header('Content-Type', 'application/json')
        self.write(json.dumps(res))

    # def __init__(
    #         self,
    #         application: "Application",
    #         request: httputil.HTTPServerRequest,
    #         **kwargs: Any
    # ):
    #     super(HandbrakeHandler, self).__init__(application, request, **kwargs)

