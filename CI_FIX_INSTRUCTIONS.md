# CI/CD Fix Instructions

## Current Issues

1. **Lockfile Out of Sync**: `yarn.lock` needs to be updated to match `package.json` changes (resolutions added)
2. **Security Audit Failing**: `yarn audit --level moderate` exits with code 2 for ANY vulnerability (even low severity)

## Required Actions

### Step 1: Update yarn.lock file

Run locally to update the lockfile:
```bash
yarn install
```

This will:
- Update `yarn.lock` to match the current `package.json`
- Apply all the resolutions we added
- Resolve dependency conflicts

Then commit the updated `yarn.lock`:
```bash
git add yarn.lock
git commit -m "Update yarn.lock to sync with package.json resolutions"
git push
```

### Step 2: Fix the Security Vulnerability

After running `yarn install`, check what vulnerability remains:

```bash
yarn audit --json | grep -A 20 "auditAdvisory"
```

Or use the helper script:
```bash
node scripts/identify-vulnerability.js
```

Once you identify the vulnerable package, add it to the `resolutions` section in `package.json` with the patched version, then:
1. Run `yarn install` again
2. Commit both `package.json` and `yarn.lock`
3. Push to trigger CI

## CI/CD Pipeline Flow

The pipeline will:
1. ✅ **Install Dependencies** - `yarn install --frozen-lockfile` (needs updated yarn.lock)
2. ✅ **Type Check** - `npx tsc --noEmit`
3. ✅ **Lint** - `yarn lint`
4. ❌ **Security Audit** - `yarn audit --level moderate` (will fail until 0 vulnerabilities)
5. ✅ **Dependency Check** - `yarn outdated || true`
6. ✅ **Build & Push** - Docker build and push to ECR

## Why We Can't Change CI

The CI file uses `--frozen-lockfile` which requires:
- `yarn.lock` to be in sync with `package.json`
- All dependencies to be resolvable

The security audit will only pass when there are **0 vulnerabilities** because `yarn audit` exits with code 2 for ANY vulnerability, regardless of severity level.

## Quick Fix Checklist

- [ ] Run `yarn install` locally
- [ ] Commit updated `yarn.lock`
- [ ] Identify remaining vulnerability (if any)
- [ ] Add specific resolution for vulnerable package
- [ ] Run `yarn install` again
- [ ] Commit `package.json` and `yarn.lock`
- [ ] Push and verify CI passes

