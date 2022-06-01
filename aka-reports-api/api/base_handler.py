from typing import Any, Optional, Awaitable

from tornado import httputil
from tornado.web import RequestHandler, Application

# from db.database import Database
from utils import app_helper


class BaseHandler(RequestHandler):
    def __init__(
            self,
            application: "Application",
            request: httputil.HTTPServerRequest,
            **kwargs: Any
    ):
        super().__init__(application, request, **kwargs)
        # self.db = Database.get_instance()

    def initialize(self):
        pass

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Credentials", "true")
        self.set_header("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PATCH, PUT, DELETE, HEAD")
        self.set_header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization, X-Auth-Token")
        self.set_header("Content-Type", 'application/json')

    def data_received(self, chunk: bytes) -> Optional[Awaitable[None]]:
        print("BaseHandler:data_received")
        if app_helper.is_debugging():
            raise NotImplementedError()
        else:
            return None

    # @abc.abstractmethod
    # def get_db_instance(self) -> 'Database':
    #     """Create the database instance that will be stored as self.db"""

    # def options(self, *args, **kwargs):
    #     # no body
    #     self.set_status(204)
    #     self.finish()
