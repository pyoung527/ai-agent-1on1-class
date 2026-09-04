#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
PORT="${PORT:-4390}"
printf 'AI 에이전트 1:1 교육 자료: http://127.0.0.1:%s\n' "$PORT"
python3 -m http.server "$PORT" --bind 127.0.0.1
