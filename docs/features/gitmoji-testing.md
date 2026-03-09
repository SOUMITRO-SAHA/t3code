# Gitmoji Feature Testing Plan

## Overview

This document provides a comprehensive testing plan for the gitmoji commit message feature.

## Automated Tests

### Unit Tests Location
`apps/server/src/git/Layers/CodexTextGeneration.test.ts`

### Test Coverage
- ✅ Config path reading (`t3code.commitMessageStyle`)
- ✅ Case sensitivity handling
- ✅ Partial match detection
- ✅ Null/undefined config behavior
- ✅ Invalid config values
- ✅ Whitespace handling

## Manual Testing Procedure

### Prerequisites
```bash
# Ensure you're on the feature branch
git checkout feature/gitmoji-commit-support

# Start the dev server
bun dev
```

### Test 1: Enable Gitmoji

```bash
# Create a test repository
mkdir /tmp/test-gitmoji && cd /tmp/test-gitmoji
git init
echo "# Test" > README.md
git add .

# Enable gitmoji for this repository
git config t3code.commitMessageStyle gitmoji

# Verify config is set
git config t3code.commitMessageStyle
# Should output: gitmoji
```

**Expected Result:**
- When you generate a commit message in T3 Code, it should include gitmoji emoji
- The prompt sent to Codex should contain "subject must start with a gitmoji emoji"
- Generated commits should look like: `✨ add initial readme`

### Test 2: Disable Gitmoji (Use Conventional)

```bash
# Set to conventional style
git config t3code.commitMessageStyle conventional

# Verify config
git config t3code.commitMessageStyle
# Should output: conventional
```

**Expected Result:**
- Commit messages should use conventional format
- No gitmoji emojis in generated messages
- Prompt should NOT contain gitmoji instructions
- Generated commits should look like: `add initial readme`

### Test 3: Remove Custom Config

```bash
# Remove the config
git config --unset t3code.commitMessageStyle

# Verify it's gone
git config t3code.commitMessageStyle
# Should output nothing (empty)
```

**Expected Result:**
- Should default to conventional style
- No gitmoji in generated messages

### Test 4: Global Config

```bash
# Set gitmoji globally
git config --global t3code.commitMessageStyle gitmoji

# Test in a new repository
mkdir /tmp/test-global-gitmoji && cd /tmp/test-global-gitmoji
git init
echo "test" > file.txt
git add .

# Generate commit - should use gitmoji even without repo-level config
```

**Expected Result:**
- All repositories should use gitmoji by default
- Unless overridden by repository-level config

### Test 5: Case Insensitive Config

```bash
# Test different cases
git config t3code.commitMessageStyle GITMOJI
git config t3code.commitMessageStyle GitMoji
git config t3code.commitMessageStyle gItMoJi

# All should work the same
```

**Expected Result:**
- All variations should enable gitmoji
- Case insensitive matching

### Test 6: Partial Match

```bash
# Test partial matches
git config t3code.commitMessageStyle use-gitmoji
git config t3code.commitMessageStyle enable-gitmoji

# Should still enable gitmoji
```

**Expected Result:**
- Config values containing "gitmoji" should enable the feature

### Test 7: Invalid Values

```bash
# Test invalid values
git config t3code.commitMessageStyle random-value
git config t3code.commitMessageStyle emoji

# Should default to conventional
```

**Expected Result:**
- Invalid values should safely fall back to conventional style
- No crashes or errors

## Verifying the Prompt

To see what prompt is being sent to Codex:

1. Check the server logs when generating a commit
2. Look for the stdin content being sent to the codex process
3. Verify it contains:
   - **With gitmoji**: "subject must start with a gitmoji emoji" and common gitmoji examples
   - **Without gitmoji**: "subject must be imperative, <= 72 chars, and no trailing period"

## Platform Testing

Test on both platforms:
- ✅ Web App: http://localhost:3773
- ✅ Desktop App: Launch T3 Code desktop

Both should respect the same git config setting.

## Test Scenarios Matrix

| Scenario | Config Value | Expected Subject Pattern | Test Method |
|----------|--------------|------------------------|-------------|
| Feature addition | `gitmoji` | ✨ add new feature | Auto |
| Bug fix | `gitmoji` | 🐛 fix login error | Auto |
| Refactoring | `gitmoji` | ♻️ refactor database layer | Auto |
| Documentation | `gitmoji` | 📝 update API docs | Auto |
| Feature addition | `conventional` | feat: add new feature | Auto |
| Bug fix | `conventional` | fix: fix login error | Auto |
| No config | `(empty)` | feat: add new feature | Auto |
| Case variation | `GITMOJI` | ✨ add new feature | Auto |
| Partial match | `use-gitmoji` | ✨ add new feature | Auto |
| Invalid value | `random` | add new feature | Auto |
| Feature addition | `gitmoji` | ✨ add user auth | Manual |
| Bug fix | `gitmoji` | 🐛 fix crash | Manual |

## Cleanup

```bash
# Remove test repositories
rm -rf /tmp/test-gitmoji /tmp/test-global-gitmoji

# Remove global config if set
git config --global --unset t3code.commitMessageStyle
```

## Running Automated Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test apps/server/src/git/Layers/CodexTextGeneration.test.ts

# Run with verbose output
bun test --verbose

# Check test coverage
bun test --coverage
```

## Expected Test Results

All tests should pass:
```
✅ Typecheck: bun typecheck
✅ Lint: bun lint
✅ Unit Tests: bun test
```

## Notes

- The feature reads git config in real-time when generating commits
- No server restart required after changing config
- Config is repository-specific unless using `--global` flag
- The AI model chooses appropriate gitmoji based on the changes
- All edge cases are tested with unit tests
