# ARchive GitHub Pages edition

Deliver upload-ready static files only. The user will upload to GitHub themselves. Do not publish, push, or create repositories.

The deployed site must not contact localhost, the user's computer, external CDNs, external APIs, or separate backend servers. All runtime assets must ship with the site. Only same-site static assets and in-browser Blob/IndexedDB data are allowed. Keep the CSP and relative base path.

Keep the sibling archive/ local edition and its saved data unchanged. Keep components, styling, storage, domain validation, and viewer logic separate. Sources in the project sources/ directory are read-only.
