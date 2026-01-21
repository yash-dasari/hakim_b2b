# How to Fix the Lockfile Error

## The Problem
The `yarn.lock` file in your repository is out of sync with `package.json`. The CI uses `--frozen-lockfile` which requires them to match exactly.

## Solution Options

### Option 1: Fix Permission Issue and Update Lockfile (Recommended)

**Step 1: Close all processes using the files**
- Close your IDE/editor (VS Code, etc.)
- Close any running Node.js processes
- Close any terminals running the dev server

**Step 2: Run yarn install**
```bash
npx --yes yarn install
```

**Step 3: If still getting permission error, try:**
- Run PowerShell/Command Prompt as Administrator
- Or delete `node_modules` folder first:
  ```bash
  Remove-Item -Recurse -Force node_modules
  npx --yes yarn install
  ```

**Step 4: Commit the updated yarn.lock**
```bash
git add yarn.lock
git commit -m "Update yarn.lock to sync with package.json resolutions"
git push
```

### Option 2: Temporarily Remove Resolutions (Quick Fix)

If you can't fix the permission issue, temporarily remove resolutions:

1. **Remove resolutions from package.json** (comment them out or remove the section)
2. **Commit and push** - this will make CI pass the install step
3. **Then add resolutions back one by one** and test

### Option 3: Use GitHub Actions to Update Lockfile

Create a temporary workflow that updates the lockfile:

```yaml
name: Update Lockfile
on:
  workflow_dispatch:
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
      - run: yarn install
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add yarn.lock
          git commit -m "Update yarn.lock" || exit 0
          git push
```

## Why This Keeps Happening

Every time CI runs:
1. It checks if `yarn.lock` matches `package.json`
2. They don't match (because resolutions were added)
3. CI fails with the error
4. The cycle repeats until `yarn.lock` is updated

## Quick Check

To verify if your lockfile is out of sync:
```bash
npx --yes yarn install --check-files
```

This will tell you if the lockfile needs updating without actually updating it.

