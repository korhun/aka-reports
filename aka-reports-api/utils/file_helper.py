import re
import unicodedata
from fnmatch import fnmatch
import codecs
import io
import os
import pathlib
import shutil
import uuid
from typing import AnyStr, Tuple
from shutil import copyfile

from utils import string_helper


def read_lines(filename, encoding="utf-8"):
    with io.open(filename, mode="r", encoding=encoding) as f:
        content = f.readlines()
        content = [x.strip() for x in content]
        return content


def write_all(filename, text, encoding="utf-8"):
    write_lines(filename, [text], encoding)


def write_lines(filename, lines, encoding="utf-8"):
    with codecs.open(filename, "w", encoding) as f:
        for item in lines:
            f.write("%s\n" % item)


def enumerate_files(dir_path, recursive=False, wildcard_pattern=None, case_insensitive=True):
    # if not recursive:
    #     from os import listdir
    #     from os.path import isfile, join
    #     if filter is None:
    #         for file_name_with_extension in [f for f in listdir(dir_path) if isfile(join(dir_path, f))]:
    #             yield os.path.join(dir_path, file_name_with_extension), file_name_with_extension
    #     else:
    #         for file_name_with_extension in [f for f in listdir(dir_path) if isfile(join(dir_path, f))]:
    #             if string_helper.wildcard(file_name_with_extension, filter, case_insensitive):
    #                 yield os.path.join(dir_path, file_name_with_extension), file_name_with_extension
    if wildcard_pattern is None:
        for root, sub_dirs, files in os.walk(dir_path):
            for name in files:
                yield path_join(root, name)
            if not recursive:
                break
    else:
        for root, sub_dirs, files in os.walk(dir_path):
            for name in files:
                # name = os.path.basename(fn)
                if string_helper.wildcard(name, wildcard_pattern, case_insensitive=case_insensitive):
                    yield path_join(root, name)
            if not recursive:
                break


def enumerate_directories(dir_path, recursive=False, wildcard_pattern=None, case_insensitive=True):
    if wildcard_pattern is None:
        for root, sub_dirs, files in os.walk(dir_path):
            for dir_name in sub_dirs:
                yield path_join(root, dir_name)
            if not recursive:
                break
    else:
        for root, sub_dirs, files in os.walk(dir_path):
            for dir_name in sub_dirs:
                if wildcard(dir_name, wildcard_pattern, case_insensitive=case_insensitive):
                    yield path_join(root, dir_name)
            if not recursive:
                break


def append_line(filename, line, encoding="utf-8"):
    with codecs.open(filename, "a", encoding) as f:
        f.write("%s\n" % line)


def append_lines(filename, lines, encoding="utf-8"):
    with codecs.open(filename, "a", encoding) as f:
        for line in lines:
            f.write("%s\n" % line)


def get_parent_dir_path(file_name):
    return str(pathlib.Path(file_name).parent.absolute())


def get_parent_dir_name(file_name):
    return str(pathlib.Path(file_name).parent.name)


def get_folder_name(dir_path):
    return os.path.basename(dir_path)


def path_join(a: AnyStr, *paths: AnyStr) -> AnyStr:
    return os.path.join(a, *paths).replace("/", os.path.sep)


def create_dir(dir_name, parents=True, exist_ok=True):
    from pathlib import Path
    Path(dir_name).mkdir(parents=parents, exist_ok=exist_ok)


def copy_file(source, target):
    copyfile(source, target)


def get_file_name_extension(file_full_name) -> Tuple[AnyStr, AnyStr, AnyStr]:
    dir_name, file_name = os.path.split(file_full_name)
    name, extension = os.path.splitext(file_name)
    return dir_name, name, extension


def change_file_extension(file_full_name, extension):
    dir_name, name, _ = get_file_name_extension(file_full_name)
    if extension and extension[0] != ".":
        extension = "." + extension
    return path_join(dir_name, name + extension)


def get_file_name(file_full_name):
    dir_name, file_name = os.path.split(file_full_name)
    name, extension = os.path.splitext(file_name)
    return name


def delete_file(file_name):
    os.remove(file_name)


def get_unique_file_name():
    return str(uuid.uuid4())


def delete_dir(path_to_dir):
    shutil.rmtree(path_to_dir)


def wildcard(txt, pattern, case_insensitive=True):
    if txt == pattern:
        return True
    else:
        txt = txt.replace("[", "_").replace("]", "-")
        pattern = pattern.replace("[", "_").replace("]", "-")
        return fnmatch(txt.lower(), pattern.lower()) if case_insensitive else fnmatch(txt, pattern)


def wildcard_match_count(list_txt, pattern, case_insensitive=True):
    count = 0
    for txt in list_txt:
        if wildcard(txt, pattern, case_insensitive):
            count += 1
    return count


def wildcard_list(list_txt, pattern, case_insensitive=True):
    for txt in list_txt:
        if wildcard(txt, pattern, case_insensitive):
            return True
    return False


def equals_case_insensitive(string1, string2):
    return string1.lower() == string2.lower()


def join(list_of_string, separator):
    return separator.join(list_of_string)


def file_exists(file_full_name: str) -> bool:
    if file_full_name:
        return os.path.isfile(file_full_name)
    return False


def dir_exists(dir_name: str) -> bool:
    if dir_name:
        return os.path.isdir(dir_name)
    return False


def get_valid_path(path):
    if path is not None:
        return path.replace('/', os.sep).replace('\\', os.sep)


def slugify(value, allow_unicode=False, remove_alphanumerics=True):
    """
    ref: https://github.dev/django/django/blob/main/django/utils/text.py
    Convert to ASCII if 'allow_unicode' is False. Convert spaces or repeated
    dashes to single dashes. Remove characters that aren't alphanumerics,
    underscores, or hyphens. Convert to lowercase. Also strip leading and
    trailing whitespace, dashes, and underscores.
    """
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize("NFKC", value)
    else:
        value = (
            unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
        )
    if remove_alphanumerics:
        value = re.sub(r"[^\w\s-]", "", value.lower())
        return re.sub(r"[-\s]+", "-", value).strip("-_")
    else:
        return value.lower()


def get_valid_filename(name):
    """
    ref: https://github.dev/django/django/blob/main/django/utils/text.py
    Return the given string converted to a string that can be used for a clean
    filename. Remove leading and trailing spaces; convert other spaces to
    underscores; and remove anything that is not an alphanumeric, dash,
    underscore, or dot.
    >>> get_valid_filename("John's portrait in 2004.jpg")
    'johns_portrait_in_2004.jpg'
    """
    s = str(name).strip().replace(" ", "_")
    s = re.sub(r"(?u)[^-\w.]", "", s)
    if s in {"", ".", ".."}:
        raise ValueError("Could not derive file name from '%s'" % name)
    return s
