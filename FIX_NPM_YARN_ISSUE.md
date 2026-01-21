# Fix: Don't Use npm - This is a Yarn Project!

## ❌ Problem

You ran `npm i` but this project uses **Yarn**, not npm. This causes:
- Conflicts between npm and yarn
- Permission errors
- Wrong lockfile (npm creates package-lock.json, but we need yarn.lock)

## ✅ Solution: Use Yarn Only

### Step 1: Clean up npm artifacts

```powershell
# Remove package-lock.json if it exists
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Remove node_modules to start fresh
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
```

**If you get permission errors:**
1. Close VS Code/IDE completely
2. Close all Node.js processes (check Task Manager)
3. Run PowerShell as Administrator
4. Then run the cleanup commands above

### Step 2: Use Yarn to Install

```powershell
# Install yarn globally if not installed
npm install -g yarn

# Or use npx to run yarn
npx --yes yarn install
```

### Step 3: Commit the Updated yarn.lock

```bash
git add yarn.lock
git commit -m "Update yarn.lock to sync with package.json resolutions"
git push
```

## 🚫 Never Use npm in This Project

- ❌ `npm install` - DON'T USE
- ❌ `npm i` - DON'T USE  
- ❌ `npm audit` - DON'T USE
- ✅ `yarn install` - USE THIS
- ✅ `yarn add <package>` - USE THIS
- ✅ `yarn audit` - USE THIS

## Why This Matters

- CI/CD uses `yarn install --frozen-lockfile`
- The project has `yarn.lock` (not package-lock.json)
- Mixing npm and yarn causes conflicts and errors

## Quick Fix Commands

```powershell
# 1. Clean up
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 2. Install with yarn
npx --yes yarn install

# 3. Commit
git add yarn.lock
git commit -m "Update yarn.lock"
git push
```

