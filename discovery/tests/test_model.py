import unittest
from datetime import date

from walkin_discovery.model import (
    Listing, ValidationError, dedupe_key, status_for, to_row, validate,
)


def sample(**overrides):
    base = dict(
        title="Software Trainee", company="Acme", category="IT and Software", city="Noida",
        interview_date=date(2026, 11, 22), source_name="Acme careers",
        source_url="https://acme.example/careers/walkin",
    )
    base.update(overrides)
    return Listing(**base)


class ModelTests(unittest.TestCase):
    def test_valid_listing_passes(self):
        validate(sample())

    def test_http_source_rejected(self):
        with self.assertRaises(ValidationError):
            validate(sample(source_url="http://acme.example/x"))

    def test_missing_title_rejected(self):
        with self.assertRaises(ValidationError):
            validate(sample(title="   "))

    def test_unknown_city_rejected(self):
        with self.assertRaises(ValidationError):
            validate(sample(city="Mumbai"))

    def test_dedupe_ignores_case_and_punctuation(self):
        a = dedupe_key(sample(title="Software Trainee!"))
        b = dedupe_key(sample(title="software  trainee"))
        self.assertEqual(a, b)

    def test_dedupe_differs_by_date(self):
        self.assertNotEqual(dedupe_key(sample()), dedupe_key(sample(interview_date=date(2026, 11, 23))))

    def test_past_drive_is_expired(self):
        self.assertEqual(status_for(date(2026, 11, 1), date(2026, 11, 15)), "expired")
        self.assertEqual(status_for(date(2026, 11, 15), date(2026, 11, 15)), "upcoming")

    def test_row_omits_first_seen_so_database_keeps_original(self):
        row = to_row(sample(), "2026-11-15T00:00:00+00:00", date(2026, 11, 15))
        self.assertNotIn("first_seen_at", row)
        self.assertEqual(row["status"], "upcoming")
        self.assertEqual(row["source_url"], "https://acme.example/careers/walkin")

    def test_unknown_values_stay_empty(self):
        row = to_row(sample(), "2026-11-15T00:00:00+00:00", date(2026, 11, 15))
        self.assertIsNone(row["min_percentage"])
        self.assertIsNone(row["venue"])


if __name__ == "__main__":
    unittest.main()
