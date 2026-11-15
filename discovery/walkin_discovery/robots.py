"""robots.txt checks. Fails closed: if the policy cannot be read, the page is not fetched."""
from __future__ import annotations

from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser


def allowed_by_robots_text(robots_text: str, user_agent: str, url: str) -> bool:
    parser = RobotFileParser()
    parser.parse(robots_text.splitlines())
    return parser.can_fetch(user_agent, url)


def is_fetch_allowed(url: str, user_agent: str, timeout: int = 10) -> bool:
    import requests  # imported here so pure logic stays testable without network libraries

    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        response = requests.get(robots_url, headers={"User-Agent": user_agent}, timeout=timeout)
    except requests.RequestException:
        return False
    if response.status_code == 404:
        return True  # no robots.txt published: allowed by convention, terms still apply
    if response.status_code != 200:
        return False  # 401, 403, 5xx: fail closed
    return allowed_by_robots_text(response.text, user_agent, url)
