#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Running Custom Build Script for Puppeteer..."

# Install standard dependencies
npm install

# Force install Puppeteer browsers (Chrome)
echo "Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome

echo "Build complete."
