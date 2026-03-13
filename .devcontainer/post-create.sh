#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
cd /workspaces/FIT3162_CS_06

# Install backend dependencies
cd back-end
npm install
cd ..

# Install frontend dependencies
cd front-end
npm install
cd ..

echo "All dependencies installed successfully!"
