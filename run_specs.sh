#!/bin/bash
node app.js & SERVICE=$!
node spec/support/test_server.js & CLIENT=$!
sleep 4
node_modules/jasmine-node/bin/jasmine-node spec/
kill $SERVICE
kill $CLIENT
