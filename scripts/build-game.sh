#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
game_root="${project_root}/competition"
game_dist="${game_root}/dist"
public_game="${project_root}/public/play"
archive_temp="$(mktemp -d)"
trap 'rm -rf "${archive_temp}"' EXIT

mkdir -p "${game_dist}" "${public_game}"
"${project_root}/node_modules/.bin/esbuild" "${game_root}/game.js" \
  --bundle \
  --minify \
  --format=esm \
  --target=es2020 \
  '--external:https://*' \
  --outfile="${game_dist}/game.js"
cp "${game_root}/index.html" "${game_dist}/index.html"

cp "${game_dist}/index.html" "${archive_temp}/index.html"
cp "${game_dist}/game.js" "${archive_temp}/game.js"
touch -t 200001010000 "${archive_temp}/index.html" "${archive_temp}/game.js"
(cd "${archive_temp}" && zip -9 -X -q rainbow-herd.zip index.html game.js)
mv "${archive_temp}/rainbow-herd.zip" "${game_root}/rainbow-herd.zip"

archive_bytes="$(wc -c < "${game_root}/rainbow-herd.zip")"
if (( archive_bytes > 13312 )); then
  echo "Rainbow Herd ZIP is ${archive_bytes} bytes; the hard limit is 13,312." >&2
  exit 1
fi

cp "${game_dist}/index.html" "${public_game}/index.html"
cp "${game_dist}/game.js" "${public_game}/game.js"
cp "${game_root}/rainbow-herd.zip" "${public_game}/rainbow-herd.zip"
cp "${project_root}/node_modules/aframe/dist/aframe-v1.8.0.min.js" "${public_game}/aframe.js"
sed -i 's#https://play.js13kgames.com/2026/webxr/aframe.js#/play/aframe.js#' "${public_game}/index.html"
echo "Rainbow Herd competition ZIP: ${archive_bytes} / 13,312 bytes"
