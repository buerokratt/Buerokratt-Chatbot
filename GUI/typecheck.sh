#!/bin/bash

# TypeScript type checking script that filters out errors from node_modules
#
# WHY THIS WORKAROUND EXISTS:
# The @buerokratt-ria/header and @buerokratt-ria/menu libraries publish TypeScript
# source files (.ts/.tsx) instead of compiled JavaScript with declaration files (.d.ts).
# The --skipLibCheck flag only skips .d.ts files, not .ts/.tsx source files, so TypeScript
# still checks the library source code, leading to type errors in node_modules we cannot fix.
#
# IDEAL SOLUTION:
# The best approach would be a monorepo with no npm packages at all. Alternatively, the
# libraries should build and publish declaration files (.d.ts) with "main": "dist/index.js"
# and "types": "dist/index.d.ts" in package.json, and fix the actual type errors.
#
# TEMPORARY WORKAROUND:
# Filter TypeScript output to only show errors from our code (src/ and vite.config.ts),
# ignoring all errors from node_modules. This allows CI to fail on our errors while
# ignoring library errors.

# Run TypeScript type checking and capture errors from our code only
# The || true prevents grep from causing the script to exit when no matches are found
ERRORS=$(tsc --noEmit --skipLibCheck 2>&1 | grep -E "^(src/|vite\.config\.ts)" || true)

# If errors were found, print them and exit with failure code
if [ -n "$ERRORS" ]; then
  echo "$ERRORS"
  exit 1
fi

# No errors found, exit successfully
exit 0
