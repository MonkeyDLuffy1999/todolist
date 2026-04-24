# Safeguard Rails (Repo Safety)

This file documents the safety rules and expectations for changes made in this workspace/repository.

## File operations

- Prefer **non-destructive changes** (edit/add) over delete/rename.
- When deleting, first **list what will be deleted**, then delete, then **verify**.
- For any deletion, always ask for an explicit **yes/no confirmation immediately before deleting**, even if the user requested the deletion earlier. (Exception: the user explicitly says to delete **without confirmation**.)
- Avoid broad deletes like `rm -rf *` / `Remove-Item -Recurse` unless explicitly requested.
- Do not delete build artifacts or caches outside the workspace.

## Secrets & sensitive data

- Do **not** commit or share secrets (API keys, tokens, passwords, `.env`, private keys, credentials files).
- If a secret is discovered, **stop** and recommend rotation/removal, and add to `.gitignore` where appropriate.
- Prefer placeholder values like `YOUR_TOKEN_HERE` in examples.

## Dependency changes

- Add dependencies only when needed and prefer the package manager (pip/npm/etc.).
- Avoid pinning unusual/unknown versions without a reason.
- Record setup steps in `README.md` when introducing new tooling.

## Network & external actions

- Avoid actions with side effects (publishing packages, pushing to remotes, deploying) unless explicitly requested.
- For web content or downloaded artifacts, keep them in the workspace and document provenance.

## Running commands

- Prefer safe, inspectable commands first (`--help`, `--version`, `--dry-run` where available).
- Avoid forceful/destructive flags unless explicitly requested (e.g., `--force`, `--hard`, `--reset`, `--purge`).

## Verification

- After changes, verify the outcome (re-read files, re-run minimal checks, confirm outputs).
- When possible, include a quick “how to run/test” note in the relevant docs.

## Communication

- Summarize what changed and where (file paths).
- Call out any irreversible actions before they happen.
- For destructive/risky actions (delete, overwrite, moving many files, running commands with side effects), **explicitly paste the exact target list or pattern in chat first**, then proceed, then post a verification result.

