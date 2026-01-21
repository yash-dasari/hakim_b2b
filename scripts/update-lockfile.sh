#!/bin/bash
# Script to update yarn.lock file locally
# Run this before committing to ensure lockfile is in sync

echo "🔄 Updating yarn.lock file..."
echo ""

# Remove package-lock.json if it exists
if [ -f "package-lock.json" ]; then
  echo "⚠️  Removing package-lock.json (yarn-only project)"
  rm package-lock.json
fi

# Run yarn install to update lockfile
echo "📦 Running yarn install..."
yarn install

# Check if yarn.lock was updated
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ yarn.lock has been updated successfully!"
  echo ""
  echo "📝 Next steps:"
  echo "   1. Review the changes: git diff yarn.lock"
  echo "   2. Add the file: git add yarn.lock"
  echo "   3. Commit: git commit -m 'Update yarn.lock to sync with package.json'"
  echo "   4. Push: git push"
else
  echo ""
  echo "❌ Failed to update yarn.lock"
  exit 1
fi

