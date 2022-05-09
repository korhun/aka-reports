debugging = None


def is_debugging():
    global debugging
    if debugging is None:
        try:
            import pydevd
            debugging = True
        except ImportError:
            debugging = False
    return debugging
