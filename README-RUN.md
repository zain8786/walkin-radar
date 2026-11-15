# Running discovery

## Tests (no network needed)
    cd discovery
    pip install -r requirements.txt
    python -m unittest discover -s tests -v

## Dry run (parses and reports, writes nothing)
    cd discovery
    python -m walkin_discovery run --dry-run

## Live run (needs environment variables)
    export SUPABASE_URL=https://YOUR-PROJECT.supabase.co
    export SUPABASE_SERVICE_ROLE_KEY=...   # never commit this
    python -m walkin_discovery expire
    python -m walkin_discovery run
    python -m walkin_discovery verify

## GitHub secrets needed
In the repository settings, add Actions secrets named SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The workflow reads them from there.

## Adding the first source
1. A person checks the site's terms of use and robots.txt, then records the date in config/sources.yaml.
2. Copy parsers/template.py to parsers/<company>.py, write extraction for the real page, and register it in parsers/__init__.py.
3. Set `allowed: true` and point `url` at the careers page.
4. Run the dry run and confirm the output matches what the page says before enabling live runs.
