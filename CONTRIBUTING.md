# Contributing

Thanks for your interest in TokPortal's developer packages.

## Source of truth

The API surface in this repository (generated clients, tool catalogues, request
and response types) is generated from the TokPortal public OpenAPI/schema layer
in the private TokPortal monorepo (maintainers regenerate it with
`npm run verify:developer-surface` and `npm run export:developer-packages`). Generated files (for example
`src/generated.ts`, `tokportal/_generated.py`, `generated.go`) are overwritten
on every release, so please do not hand-edit them — changes there will be lost.

The public OpenAPI document is available at
https://developers.tokportal.com/openapi.json.

## What we welcome as pull requests

- README and documentation improvements
- Examples and quickstarts
- CI / packaging fixes
- Bug fixes in hand-written (non-generated) code — please open an issue first so
  we can mirror the fix upstream

## Bugs and API issues

Please open a GitHub issue with the package version, a minimal reproduction and,
when relevant, the `X-TokPortal-Request-ID` returned by the API. API bugs are
fixed upstream and flow into the next generated release.

## Security

See [SECURITY.md](./SECURITY.md) — never report vulnerabilities in public issues.

## License

By contributing you agree that your contributions are licensed under the MIT
License that covers this repository.
