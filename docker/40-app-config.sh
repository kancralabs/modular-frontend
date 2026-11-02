#!/bin/sh
# Writes runtime configuration so one image can be promoted across environments.
# Unset values fall back to the build-time VITE_* defaults inside the bundle.
set -eu

CONFIG_FILE=/usr/share/nginx/html/config.js

# Escape for a JavaScript string literal and drop newlines.
js_string() {
  printf '%s' "$1" | tr -d '\r\n' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

cat > "$CONFIG_FILE" <<CONFIG
window.__APP_CONFIG__ = {
  appName: "$(js_string "${APP_NAME:-}")",
  apiBaseUrl: "$(js_string "${APP_API_BASE_URL:-}")",
}
CONFIG

echo "40-app-config: wrote $CONFIG_FILE"
