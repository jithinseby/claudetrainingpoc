#!/usr/bin/env bash
# Stop: block finishing if the API build or tests fail. Reads the hook JSON from stdin.
command -v jq >/dev/null || { echo "verify.sh: jq not found, skipping verify" >&2; exit 1; }

# Already blocked once this turn: let Claude stop rather than loop forever.
[ "$(jq -r '.stop_hook_active // false')" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
stamp=.claude/.verify-stamp

# Fast path: nothing C# changed since the last green run.
if [ -f "$stamp" ] && [ -z "$(find api api.Tests \( -name bin -o -name obj \) -prune -o \
     \( -name '*.cs' -o -name '*.csproj' \) -newer "$stamp" -print -quit)" ]; then
  exit 0
fi

# Separate artifacts dir so a running `dotnet run` can't lock the normal bin/obj output.
out=$(dotnet test api.Tests --artifacts-path .claude/.artifacts -nologo -v q 2>&1)
if [ $? -eq 0 ]; then
  touch "$stamp"
  exit 0
fi

jq -n --arg out "$(echo "$out" | tail -n 30)" \
  '{decision: "block", reason: ("API build or tests failed. Fix before finishing:\n" + $out)}'
exit 0
