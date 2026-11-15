"""Parser registry. A source's `parser` name in sources.yaml must be a key here.

Each parser has the signature parse(html: str, source: dict) -> list[Listing].
Parsers extract only what the page states. Missing facts stay None.
"""
from . import template

PARSERS = {
    "template": template.parse,
}
