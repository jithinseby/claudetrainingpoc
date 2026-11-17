#!/usr/bin/env bash
# PostToolUse (Edit|Write): format the edited file. Reads the hook JSON from stdin.
command -v jq >/dev/null || { echo "format.sh: jq not found, skipping format" >&2; exit 1; }

file=$(jq -r '.tool_input.file_path // empty')
file=$(printf "%s" "$file" | tr '\\' '/')   # Windows paths -> forward slashes
[ -f "$file" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

case "$file" in
  */Migrations/*|*/node_modules/*|*/bin/*|*/obj/*) ;;   # generated or vendored: leave alone
  *.cs)
    dotnet format whitespace TicketingPoc.slnx --include "$file" --verbosity quiet ;;
  */web/*.ts|*/web/*.html|*/web/*.css|*/web/*.json)
    web/node_modules/.bin/prettier --write --log-level warn "$file" ;;
esac
exit 0
