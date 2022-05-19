import os
import sys

import yaml

from api import app, handbrake_manager
import logging

from utils import app_helper

logger = logging.getLogger(__name__)


def main():
    try:
        # import logging.config
        # logging.config.fileConfig('logging.conf')
        if app_helper.is_debugging():
            logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

        # with open('config.yaml') as f:
        my_path = os.path.abspath(os.path.dirname(__file__))
        path = os.path.join(my_path, "config.yaml")
        assert(os.path.isfile(path))
        with open(path) as f:
            config = yaml.load(f, Loader=yaml.FullLoader)
            workspace_dir = config["workspace_dir"]
            logging.info(f"workspace_dir: {workspace_dir}")
            handbrake_manager.set_workspace_dir(config["workspace_dir"])
        app.start(9090)
    except Exception as e:
        logger.error(repr(e))
        app.stop()


if __name__ == "__main__":
    main()
