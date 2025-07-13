#!/bin/bash

SESSION_ID="test-session-123"
echo "Session: $SESSION_ID"

# Create room
ROOM_ID=$(curl -s -X POST -H "Content-Type: application/json" -d "\"$SESSION_ID\"" http://localhost:8080/rooms/ | jq -r '.roomId')
echo "Created room: $ROOM_ID"

# Join room
curl -X POST -H "Content-Type: application/json" -d "\"$SESSION_ID\"" http://localhost:8080/rooms/$ROOM_ID/members

# Start SSE stream (run this in a separate terminal for live output)
echo "Run this in another terminal to listen for messages:"
echo "curl -N \"http://localhost:8080/rooms/$ROOM_ID/message-stream?sessionId=$SESSION_ID\""

# Send a message
curl -X POST -H "Content-Type: application/json" \
  -d '{"grid":[["A","B"],["C","D"]],"senderSessionId":"'"$SESSION_ID"'","timeStamp":'$(date +%s)'}' \
  http://localhost:8080/rooms/$ROOM_ID/messages
