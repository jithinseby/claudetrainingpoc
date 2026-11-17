#!/usr/bin/env bash
# PreToolUse (Edit|Write): stop Claude from writing secrets or PII/PHI into files.
# Exit 2 blocks the tool call and feeds stderr back to Claude. Reads the hook JSON from stdin.
command -v jq >/dev/null || { echo "guard.sh: jq not found, skipping guard" >&2; exit 1; }

input=$(cat)
file=$(jq -r '.tool_input.file_path // empty' <<<"$input" | tr '\\' '/')

case "$file" in *.example|*/.githooks/scan.sh|*package-lock.json) exit 0 ;; esac
case "$file" in
  */.env|*/.env.*|*appsettings.Production.json|*.pem|*.pfx|*.p12|*.key)
    echo "Blocked: $file must not be written by Claude (secrets file)." >&2; exit 2 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
out=$(jq -r '.tool_input.content // .tool_input.new_string // empty' <<<"$input" | sh .githooks/scan.sh)
if [ $? -ne 0 ]; then
  echo "Blocked: the content for $file looks like it contains secrets or PII/PHI:" >&2
  echo "$out" >&2
  echo "Use placeholders or environment variables instead. Add 'scan:allow' to a line only for a confirmed false positive." >&2
  exit 2
fi
exit 0
