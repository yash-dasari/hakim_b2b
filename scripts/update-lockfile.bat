@echo off
REM Script to update yarn.lock file locally on Windows
REM Run this before committing to ensure lockfile is in sync

echo Updating yarn.lock file...
echo.

REM Remove package-lock.json if it exists
if exist package-lock.json (
  echo Removing package-lock.json (yarn-only project)
  del package-lock.json
)

REM Run yarn install to update lockfile
echo Running yarn install...
call yarn install

REM Check if successful
if %ERRORLEVEL% EQU 0 (
  echo.
  echo yarn.lock has been updated successfully!
  echo.
  echo Next steps:
  echo   1. Review the changes: git diff yarn.lock
  echo   2. Add the file: git add yarn.lock
  echo   3. Commit: git commit -m "Update yarn.lock to sync with package.json"
  echo   4. Push: git push
) else (
  echo.
  echo Failed to update yarn.lock
  exit /b 1
)

