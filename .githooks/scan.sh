#!/bin/sh
# Shared scanner for the pre-commit hook and the Claude guard hook.
# Reads text on stdin, prints one line per rule that matched (never the matched value),
# and exits 1 if anything matched. A line containing "scan:allow" is ignored.
text=$(grep -v 'scan:allow')
found=0
while IFS='|' read -r label re; do
  [ -z "$label" ] && continue
  n=$(printf '%s\n' "$text" | grep -ciE -e "$re")
  if [ "$n" -gt 0 ]; then echo "  - $label ($n line(s))"; found=1; fi
done <<'RULES'
Private key|-----BEGIN [A-Z ]*PRIVATE KEY-----
AWS access key|AKIA[0-9A-Z]{16}
GitHub token|(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})
Slack token|xox[baprs]-[A-Za-z0-9-]{10,}
Hard-coded secret|(password|passwd|pwd|secret|api[_-]?key|token)["']?[[:space:]]*[:=][[:space:]]*["'][^"'[:space:]]{8,}["']
Connection-string password|(password|pwd)=[^;"'[:space:]]{3,}
US SSN (PII)|\b[0-9]{3}-[0-9]{2}-[0-9]{4}\b
Payment card number (PII)|\b(4[0-9]{3}|5[1-5][0-9]{2}|3[47][0-9]{2}|6011)([ -]?[0-9]{4}){2,3}\b
Patient or identity field with a value (PHI/PII)|(ssn|mrn|dob|date[_ ]of[_ ]birth|medical[_ ]record[_ ]number)["']?[[:space:]]*[:=][[:space:]]*["']?[0-9]
RULES
exit $found
