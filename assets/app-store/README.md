# SuppStack App Store Assets

Generated with `npm run app-store:assets` while the local app is running at `http://127.0.0.1:3000`.

Outputs:
- `iphone-6.9/`: 1320 x 2868 PNG screenshots.
- `iphone-6.5/`: 1284 x 2778 PNG screenshots.
- `ipad-13/`: 2048 x 2732 PNG screenshots.
- `icon/app-store-icon-1024.png`: flattened 1024 x 1024 App Store icon.
- `source-screens/`: raw 430 x 932 iPhone captures used by the framed screenshots.
- `source-screens-ipad/`: raw 1024 x 1366 iPad captures used by the framed screenshots.
- `contact-sheet.png`: quick review sheet for the generated 6.9-inch set.

Set `SUPPSTACK_APP_URL` to capture a different deployment, or pass `--skip-capture` to regenerate frames from existing source screenshots.
