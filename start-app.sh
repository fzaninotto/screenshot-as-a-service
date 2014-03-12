#!/bin/bash

echo "Installing Node.js dependencies..."
npm install --quiet

exec node app.js
