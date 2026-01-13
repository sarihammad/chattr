#!/bin/bash
# Update README and push

cd /Users/sarihammad/dev/chattr

git add README.md
git commit -m "docs: update README with mermaid diagram and concise format

- Remove emojis and taglines
- Add mermaid architecture diagram
- Simplify to concise format matching reference style
- Remove future extensions section
- Focus on current architecture and features"

BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
git push origin $BRANCH 2>&1 || git push -u origin $BRANCH 2>&1

echo "✅ README updated and pushed!"

