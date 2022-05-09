import sys

from api import app
import logging

from utils import app_helper

logger = logging.getLogger(__name__)


def main():
    try:
        # import logging.config
        # logging.config.fileConfig('logging.conf')
        if app_helper.is_debugging():
            logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
        app.start(9090)
    except Exception as e:
        logger.error(repr(e))
        app.stop()


if __name__ == "__main__":
    main()
