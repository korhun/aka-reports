import json
import os
import random
import string
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

    # def __init__(
    #         self,
    #         application: "Application",
    #         request: httputil.HTTPServerRequest,
    #         **kwargs: Any
    # ):
    #     super(HandbrakeHandler, self).__init__(application, request, **kwargs)

    def get(self):
        args = self.request.arguments if self.request and self.request.arguments else None
        if args is None:
            self.set_status(404)
        else:
            search_text = self.get_argument('search_text', None)
            limit = self.get_argument('limit', None)
            if not limit:
                limit = 50
            else:
                limit = int(limit)
            # res = [x["barcode"] for x in handbrake_manager.find_handbrakes_by_barcode(search_text, limit)]
            res = list(handbrake_manager.find_handbrakes_by_barcode(search_text, limit))
            self.set_header('Content-Type', 'application/json')
            self.write(json.dumps(res))

#     prj = self.db.find_project(prj_id)
#     if prj is None:
#         self.set_status(404)
#     else:
#         self.set_header('Content-Type', 'application/json')
#         self.write(json.dumps(prj))


# def post(self):
#     self.write({
#         "deneme": "aaaaaaaaaaaa"
#     })

# def post(self):
#     file = self.request.files['file'][0]
#     module_name = self.request.arguments['moduleName'][0].decode("utf-8")
#     if module_name == "medigrafi":
#         img = HeatmapHandler.get_img(file.body)
#         h, w = img.shape[:2]
#         self.write({
#             "width": str(w),
#             "height": str(h),
#             "heatmaps": medigrafi.medigrafi_runner.singleton.process(img),
#         })
#     elif module_name == "mura":
#         img = HeatmapHandler.get_img(file.body)
#         h, w = img.shape[:2]
#
#         self.write({
#             "width": str(w),
#             "height": str(h),
#             "heatmaps": mura.mura_runner.singleton.process(img),
#         })
#
# @staticmethod
# def get_img(file_body):
#     img = None
#     try:
#         # return cv2.imdecode(numpy.fromstring(file_body, numpy.uint8), cv2.IMREAD_UNCHANGED)
#         img = cv2.imdecode(numpy.fromstring(file_body, numpy.uint8), cv2.IMREAD_COLOR)
#     except:
#         pass
#
#     if img is None:
#         img = dicom_utils.read_dicom_from_file(file_body)
#
#     return img

# def get(self, prj_id):
#     prj = self.db.find_project(prj_id)
#     if prj is None:
#         self.set_status(404)
#     else:
#         self.set_header('Content-Type', 'application/json')
#         self.write(json.dumps(prj))
#
# def put(self, prj_id):
#     try:
#         prj = json_decode(self.request.body)
#         if prj is not None:
#             self.db.update_project(prj)
#             prj = self.db.find_project(prj_id)
#             self.set_header('Content-Type', 'application/json')
#             self.write(json.dumps(prj))
#         else:
#             self.set_status(500)
#     except Exception as e:
#         logger.error(str(e))
#         self.set_status(400)
#
# def delete(self, prj_id, *args, **kwargs):
#     self.db.delete_project(prj_id)
