#!/bin/bash
node app.js & SERVICE=$!
node spec/support/test_server.js & CLIENT=$!
sleep 4
node_modules/jasmine-node/bin/jasmine-node spec/
EXIT_CODE=$?
kill $SERVICE
kill $CLIENT
exit $EXIT_CODE
