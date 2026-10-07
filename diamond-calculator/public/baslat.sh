#!/usr/bin/env bash
# Diamonds Carat — yerel sunucu (SI Jewels / socialshare-panel değil)
cd "$(dirname "$0")"
echo "Diamonds Carat → http://localhost:5180"
echo "Durdurmak için Ctrl+C"
python3 -m http.server 5180 --bind 0.0.0.0
