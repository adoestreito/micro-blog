# Blog

Minimal static blog with a terminal aesthetic. Bright orange on dark, monospace, green/red accents.

## Structure

- **index.html** — Feed of all posts (newest first)
- **post.html** — Individual post view (for long posts)
- **write.html** — Compose new posts; copy the JSON output and paste into `posts.json`
- **posts.json** — All posts (add new entries here)
- **ai/posts.md** — AI-friendly Markdown export (generated)
- **scripts/generate_ai_markdown.py** — Generator for `ai/posts.md`

## Adding a post

1. Open `write.html`
2. Fill in title and content, click "Generate JSON"
3. Copy the output
4. Open `posts.json` and add the entry to the array (with a comma between entries)

Posts longer than 500 characters get a "read more" link to their own page.

## AI / Markdown export

Generate a Markdown version of your posts (useful for sharing with AIs or indexing):

```bash
python3 scripts/generate_ai_markdown.py
```

This writes `ai/posts.md` (newest first).

## Run locally

```bash
# Any static server, e.g.
python3 -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000

## Deploy to GitHub Pages

`write.html` is in `.gitignore` — it stays local only and is never published.

1. **Create a repo on GitHub**  
   Go to [github.com/new](https://github.com/new), name it (e.g. `blog`), don’t add a README.

2. **Init git and push (from your blog folder):**
   ```bash
   cd /Users/andresdoestreito/Documents/cursor/blog
   git init
   git add .
   git commit -m "Initial blog"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name.

3. **Turn on GitHub Pages**  
   Repo → **Settings** → **Pages** (sidebar) → **Source**: Deploy from branch → **Branch**: `main`, **Folder**: `/ (root)` → Save.

4. **Wait a minute or two**, then open:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO/
   ```
