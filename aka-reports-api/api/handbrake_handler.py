import json
from abc import ABC
from api import handbrake_manager
from api.base_handler import BaseHandler

import logging

logger = logging.getLogger(__name__)


class HandbrakeHandler(BaseHandler, ABC):

    def get(self):
        args = self.request.arguments if self.request and self.request.arguments else None
        if args is None:
            self.set_status(400)
            return

        key = self.get_argument('key', None)
        handbrake = handbrake_manager.get_handbrake(key)

        self.set_header('Content-Type', 'application/json')
        self.write(json.dumps(handbrake))
