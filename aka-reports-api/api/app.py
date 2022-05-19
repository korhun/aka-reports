from tornado.web import Application
from tornado.ioloop import IOLoop

from api.handbrake_handler import HandbrakeHandler


def _get_app():
    urls = [
        # # ("/wfapi/project/", ProjectHandler),
        # # (r"/wfapi/project/(?P<param1>[^\/]+)/?(?P<param2>[^\/]+)?/?(?P<param3>[^\/]+)?", ProjectHandler)
        # ("/wfapi/project", ProjectsHandler),
        # (r"/wfapi/project/([0-9]+)", ProjectHandler),
        # (r"/wfapi/workflow/([0-9]+)", WorkflowHandler),
        # (r"/wfapi/runner", RunnersHandler)

        # ("/api/searchHandbrakes", HandbrakeHandler),
        ("/api/handbrake", HandbrakeHandler),
    ]
    return Application(urls, debug=True)


def start(port):
    app = _get_app()
    app.listen(port)
    IOLoop.instance().start()


def stop():
    IOLoop.instance().stop()
