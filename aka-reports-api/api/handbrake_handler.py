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

    def get(self):
        """
        options: {
            only_count: boolean,
            barcode_filter: string,
            include_fault: boolean,
            include_no_fault: boolean,

            sort_asc: boolean,
            page_index: number,
            page_size: number
        }
        """
        args = self.request.arguments if self.request and self.request.arguments else None
        if args is None:
            self.set_status(400)
            return

        options = self.get_argument('options', None)
        options = {} if options is None else json.loads(options)
        res = handbrake_manager.search(options)
        self.set_header('Content-Type', 'application/json')
        self.write(json.dumps(res))

        # barcode_filter = options.get("barcode_filter", "")
        # if options.get("only_count", False):
        #     # res = handbrake_manager.get_count(barcode_filter, options)
        #     res = list(handbrake_manager.search(options, barcode_filter, false, page_number, page_size))
        #     self.set_header('Content-Type', 'application/json')
        #     self.write(json.dumps(res))
        # else:
        #     ascending = self.get_argument('sortOrder', "").lower() == "asc"
        #     page_number = int(self.get_argument('pageNumber', "0"))
        #     page_size = int(self.get_argument('pageSize', "5"))
        #
        #     res = list(handbrake_manager.search(options, barcode_filter, ascending, page_number, page_size))
        #
        #     self.set_header('Content-Type', 'application/json')
        #     self.write(json.dumps(res))

    # def __init__(
    #         self,
    #         application: "Application",
    #         request: httputil.HTTPServerRequest,
    #         **kwargs: Any
    # ):
    #     super(HandbrakeHandler, self).__init__(application, request, **kwargs)

    """
    error status
    400 Bad Request – client sent an invalid request, such as lacking required request body or parameter
    401 Unauthorized – client failed to authenticate with the server
    403 Forbidden – client authenticated but does not have permission to access the requested resource
    404 Not Found – the requested resource does not exist
    412 Precondition Failed – one or more conditions in the request header fields evaluated to false
    500 Internal Server Error – a generic error occurred on the server
    503 Service Unavailable – the requested service is not available
    """
    #
    # def get(self):
    #     """
    #     options: {
    #         "include_fault": True
    #         "include_no_fault: True
    #     }
    #     :return:
    #     """
    #     args = self.request.arguments if self.request and self.request.arguments else None
    #     if args is None:
    #         self.set_status(400)
    #         return
    #
    #     barcode_filter = self.get_argument('barcodeFilter', "")
    #
    #     options = self.get_argument('options', None)
    #     if options == "only_count":
    #         res = handbrake_manager.get_count(barcode_filter, options)
    #         self.set_header('Content-Type', 'application/json')
    #         self.write(json.dumps(res))
    #     else:
    #         ascending = self.get_argument('sortOrder', "").lower() == "asc"
    #         page_number = int(self.get_argument('pageNumber', "0"))
    #         page_size = int(self.get_argument('pageSize', "5"))
    #
    #         res = list(handbrake_manager.search(barcode_filter, ascending, page_number, page_size, options))
    #
    #         self.set_header('Content-Type', 'application/json')
    #         self.write(json.dumps(res))

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
