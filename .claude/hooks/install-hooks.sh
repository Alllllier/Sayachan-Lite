#!/bin/sh
#
# Install git hooks for Sayachan Lite
# Usage: bash .claude/hooks/install-hooks.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "Installing git hooks for Sayachan Lite..."

# Check if we're in a git repository
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo "Error: Not a git repository"
    exit 1
fi

# Install pre-commit hook
if [ -f "$SCRIPT_DIR/pre-commit" ]; then
    cp "$SCRIPT_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✓ pre-commit hook installed"
else
    echo "✗ pre-commit hook not found"
    exit 1
fi

echo ""
echo "Hooks installed successfully!"
echo "The pre-commit hook will remind you to update documentation when architecture files change."
