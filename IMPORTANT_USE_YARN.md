# ⚠️ IMPORTANT: Use YARN, NOT npm!

## ❌ You Just Ran `npm install` - This is WRONG!

This project uses **Yarn**, not npm. Running `npm install` causes:
- Creates `package-lock.json` (conflicts with `yarn.lock`)
- CI/CD will fail (it uses `yarn install --frozen-lockfile`)
- Security vulnerabilities shown are from npm, not yarn

## ✅ Correct Way: Use Yarn

### Step 1: Remove npm artifacts

I've already deleted `package-lock.json` for you. Make sure it stays deleted.

### Step 2: Use Yarn to Install

```powershell
# Use yarn (not npm!)
npx --yes yarn install
```

### Step 3: Check Security with Yarn

```powershell
# Use yarn audit (not npm audit!)
npx --yes yarn audit --level moderate
```

### Step 4: Commit yarn.lock

```bash
git add yarn.lock
git commit -m "Update yarn.lock to sync with package.json"
git push
```

## 🚫 NEVER Use These Commands

- ❌ `npm install` or `npm i`
- ❌ `npm audit`
- ❌ `npm audit fix`
- ❌ `npm update`

## ✅ ALWAYS Use These Commands

- ✅ `yarn install` or `npx --yes yarn install`
- ✅ `yarn audit`
- ✅ `yarn add <package>`
- ✅ `yarn upgrade <package>`

## Why This Matters

Your CI/CD pipeline runs:
```bash
yarn install --frozen-lockfile
```

If you use npm, it creates `package-lock.json` which:
- Conflicts with `yarn.lock`
- Causes CI to fail
- Shows wrong vulnerability counts

## Next Steps

1. ✅ `package-lock.json` has been deleted
2. ⏭️ Run: `npx --yes yarn install`
3. ⏭️ Run: `npx --yes yarn audit --level moderate`
4. ⏭️ Commit and push `yarn.lock`

