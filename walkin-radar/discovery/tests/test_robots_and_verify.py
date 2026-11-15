import unittest

from walkin_discovery.robots import allowed_by_robots_text
from walkin_discovery.verify import page_confirms

UA = "WalkInRadarBot/0.1"


class RobotsTests(unittest.TestCase):
    def test_disallowed_path_refused(self):
        robots = "User-agent: *\nDisallow: /careers/\n"
        self.assertFalse(allowed_by_robots_text(robots, UA, "https://acme.example/careers/walkin"))

    def test_allowed_path_accepted(self):
        robots = "User-agent: *\nDisallow: /private/\n"
        self.assertTrue(allowed_by_robots_text(robots, UA, "https://acme.example/careers/walkin"))

    def test_bot_specific_block_respected(self):
        robots = "User-agent: WalkInRadarBot\nDisallow: /\n"
        self.assertFalse(allowed_by_robots_text(robots, UA, "https://acme.example/careers"))


class VerifyTests(unittest.TestCase):
    def test_page_confirms_when_title_and_company_present(self):
        html = "<h1>Walk-in: Software Trainee</h1><p>Acme walk-in drive</p>"
        self.assertTrue(page_confirms(html, "Software Trainee", "Acme"))

    def test_page_does_not_confirm_when_drive_removed(self):
        html = "<p>Acme careers: no current walk-ins</p>"
        self.assertFalse(page_confirms(html, "Software Trainee", "Acme"))


if __name__ == "__main__":
    unittest.main()
