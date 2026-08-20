#!/usr/bin/env python3
"""Emit the public v3 OpenAPI spec for the OpenBrowse API.

Imports the FastAPI app from a checkout of lujstn/openbrowse, keeps only the
/v3 surface, and prunes component schemas down to what that surface reaches.
The source repo is never written to.

    python scripts/generate-openapi.py --repo ../browser-use-raspberrypi -o data/openapi.json
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

PUBLIC_PREFIX = "/v3"


def load_spec(repo: Path, python: str) -> dict:
    code = "import json,sys; from openbrowse.main import app; sys.stdout.write(json.dumps(app.openapi()))"
    proc = subprocess.run(
        [python, "-c", code],
        cwd=str(repo),
        capture_output=True,
        text=True,
        timeout=300,
    )
    if proc.returncode != 0:
        sys.exit(f"failed to import the FastAPI app from {repo}:\n{proc.stderr.strip()}")
    return json.loads(proc.stdout)


def referenced_schemas(node, found: set) -> set:
    if isinstance(node, dict):
        ref = node.get("$ref")
        if isinstance(ref, str):
            m = re.fullmatch(r"#/components/schemas/(.+)", ref)
            if m:
                found.add(m.group(1))
        for value in node.values():
            referenced_schemas(value, found)
    elif isinstance(node, list):
        for value in node:
            referenced_schemas(value, found)
    return found


# @nonobvious(mirrors) openbrowse/api/sessions.py declares these on the request model but create_session never forwards them and there is no proxy layer in openbrowse/; the reference is the canonical source we are asking retrievers to trust, so it has to say they do nothing
INERT_FIELDS = {
    "proxyCountryCode": (
        "Accepted for compatibility with browser-use-sdk and ignored. OpenBrowse has no "
        "proxy layer, so requests originate from your own machine's IP address whatever "
        "you set here."
    ),
    "enableRecording": (
        "Accepted for compatibility with browser-use-sdk and ignored. OpenBrowse does not "
        "record sessions, and recordingUrls comes back empty. Use the live view instead."
    ),
    "skills": "Accepted for compatibility with browser-use-sdk and ignored.",
}

INERT_RESPONSE_FIELDS = {
    "recordingUrls": "Always empty. OpenBrowse does not record sessions.",
    "screenshotUrl": "Always null. OpenBrowse does not capture end-of-session screenshots.",
    "workspaceId": "Always null. OpenBrowse has no workspace concept.",
    "proxyCountryCode": "Always null. OpenBrowse has no proxy layer.",
}


def annotate_inert(spec: dict) -> None:
    annotated = []
    for schema in spec.get("components", {}).get("schemas", {}).values():
        for name, prop in (schema.get("properties") or {}).items():
            note = INERT_FIELDS.get(name) or INERT_RESPONSE_FIELDS.get(name)
            if not note or prop.get("description"):
                continue
            prop["description"] = note
            annotated.append(name)
    if annotated:
        print(f"annotated {len(annotated)} compatibility-only fields: {', '.join(sorted(set(annotated)))}")


# @nonobvious(forced-by) pydantic leaves a default_factory out of the JSON schema, so a field the server
# resolves at request time arrives here with no documented default at all. Both of these fields do that,
# and the reference is the only place a reader can find out what omitting them means. Scoped to the
# request model on purpose: the same two names on SessionResponse report what a run used, not a default.
REQUEST_RESOLVED_DEFAULTS = {
    "RunTaskRequest": {
        "model": (
            "Optional. Omit it and the session runs on whatever the instance's DEFAULT_MODEL names, "
            "which is gpt-5.6-terra unless its operator changed it."
        ),
        "reasoningEffort": (
            "Optional. One of default, none, low, medium, high, xhigh or max, validated against the "
            "chosen model. Omit it, or send default, and the session runs at the level recommended for "
            "that model, which is deliberately not always the provider's own: on gpt-5.6-terra it is "
            "none where the provider would use medium."
        ),
    },
}


def annotate_resolved_defaults(spec: dict) -> None:
    schemas = spec.get("components", {}).get("schemas", {})
    for schema_name, fields in REQUEST_RESOLVED_DEFAULTS.items():
        schema = schemas.get(schema_name)
        if schema is None:
            sys.exit(f"{schema_name} is no longer in the spec; this annotation needs updating")
        for name, note in fields.items():
            prop = (schema.get("properties") or {}).get(name)
            if prop is None:
                sys.exit(f"{schema_name}.{name} is gone; this annotation needs updating")
            # @nonobvious(must-hold) a description arriving from the application wins, so adding one
            # upstream retires this note rather than being silently shadowed by it
            if not prop.get("description"):
                prop["description"] = note
    print(f"annotated {sum(len(f) for f in REQUEST_RESOLVED_DEFAULTS.values())} server-resolved defaults")


def prune(spec: dict) -> dict:
    paths = {p: item for p, item in spec.get("paths", {}).items() if p.startswith(PUBLIC_PREFIX)}
    if not paths:
        sys.exit(f"no {PUBLIC_PREFIX} paths found; the API surface moved and this script needs updating")

    all_schemas = spec.get("components", {}).get("schemas", {})
    keep = referenced_schemas(paths, set())
    # @nonobvious(must-hold) schemas reference each other, so widen until the set stops growing or nested models silently 404 in the docs
    while True:
        nested = referenced_schemas({name: all_schemas[name] for name in keep if name in all_schemas}, set())
        if nested <= keep:
            break
        keep |= nested

    components = {"schemas": {name: all_schemas[name] for name in sorted(keep) if name in all_schemas}}
    security = spec.get("components", {}).get("securitySchemes")
    if security:
        components["securitySchemes"] = security

    return {
        "openapi": spec.get("openapi", "3.1.0"),
        "info": spec.get("info", {}),
        "servers": [
            {"url": "http://localhost:8420", "description": "A local OpenBrowse instance"},
            {
                "url": "https://{host}",
                "description": "Your own instance, for example a Tailscale Funnel hostname",
                "variables": {
                    "host": {
                        "default": "your-pi.tail0a1b2c.ts.net",
                        "description": "The hostname your instance is reachable on",
                    }
                },
            },
        ],
        "paths": dict(sorted(paths.items())),
        "components": components,
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default="../browser-use-raspberrypi", type=Path)
    ap.add_argument("--python", default=None)
    ap.add_argument("-o", "--out", default="data/openapi.json", type=Path)
    ap.add_argument("--check", action="store_true", help="exit non-zero if the output would change")
    args = ap.parse_args()

    repo = args.repo.expanduser().resolve()
    if not (repo / "openbrowse" / "main.py").exists():
        sys.exit(f"{repo} does not look like an openbrowse checkout")

    python = args.python
    if python is None:
        venv = repo / ".venv" / "bin" / "python"
        python = str(venv) if venv.exists() else sys.executable

    spec = prune(load_spec(repo, python))
    annotate_inert(spec)
    annotate_resolved_defaults(spec)
    rendered = json.dumps(spec, indent=2, sort_keys=False) + "\n"

    if args.check:
        current = args.out.read_text() if args.out.exists() else ""
        if current != rendered:
            sys.exit(f"{args.out} is out of date with the API in {repo}; regenerate it")
        print(f"{args.out} matches the upstream API")
        return

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(rendered)
    ops = sum(1 for item in spec["paths"].values() for k in item if k in {"get", "post", "put", "patch", "delete"})
    print(f"wrote {args.out}: {len(spec['paths'])} paths, {ops} operations, {len(spec['components']['schemas'])} schemas")


if __name__ == "__main__":
    main()
