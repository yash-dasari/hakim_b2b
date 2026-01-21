# How to Fix the Lockfile Error - Step by Step

## Why You're Getting This Error Multiple Times

The error repeats because:
1. ✅ `package.json` has resolutions added
2. ❌ `yarn.lock` in the repository is **out of sync** with `package.json`
3. ❌ CI uses `--frozen-lockfile` which **requires** them to match exactly
4. ❌ Every CI run fails until `yarn.lock` is updated and committed

## Solution: Use GitHub Actions to Update Lockfile

Since you're having permission issues locally, use this automated solution:

### Step 1: Push the workflow file
The file `.github/workflows/update-lockfile.yml` has been created. Commit and push it:

```bash
git add .github/workflows/update-lockfile.yml
git commit -m "Add workflow to update yarn.lock"
git push
```

### Step 2: Run the workflow
1. Go to your GitHub repository
2. Click on **Actions** tab
3. Find **"Update Yarn Lockfile"** workflow on the left
4. Click **"Run workflow"** button
5. Click the green **"Run workflow"** button

### Step 3: Wait for completion
- The workflow will update `yarn.lock` automatically
- It will commit and push the changes
- Your CI should now pass!

### Step 4: Delete the workflow (optional)
After the lockfile is updated, you can delete `.github/workflows/update-lockfile.yml` since it's a one-time fix.

## Alternative: Fix Locally

If you prefer to fix it locally:

1. **Close VS Code/IDE completely**
2. **Close all Node.js processes** (check Task Manager)
3. **Run PowerShell as Administrator**
4. **Navigate to project folder**
5. **Run:**
   ```powershell
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   npx --yes yarn install
   ```
6. **Commit and push:**
   ```bash
   git add yarn.lock
   git commit -m "Update yarn.lock to sync with package.json"
   git push
   ```

## After Lockfile is Updated

Once `yarn.lock` is updated and committed:
- ✅ **Install step** will pass
- ❌ **Security audit** will still fail until vulnerability is fixed (0 vulnerabilities needed)

Then you'll need to identify and fix the remaining security vulnerability.

