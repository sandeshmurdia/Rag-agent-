#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting new chat session...${NC}"
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/chat/session)
SESSION_ID=$(echo $SESSION_RESPONSE | sed 's/.*"sessionId":"\([^"]*\)".*/\1/')

echo -e "${GREEN}Session ID: $SESSION_ID${NC}"
echo

# Sample queries to test
QUERIES=(
    "Show me laptops under $1500"
    "What kitchen appliances do you have?"
    "Tell me about smartwatches with heart rate monitoring"
    "Compare the blender with other kitchen products"
)

for QUERY in "${QUERIES[@]}"
do
    echo -e "${BLUE}Sending query: $QUERY${NC}"
    curl -s -X POST http://localhost:3000/api/chat/$SESSION_ID \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"$QUERY\"}" | json_pp
    echo -e "\n"
    sleep 2
done

# Get chat history
echo -e "${BLUE}Getting chat history...${NC}"
curl -s -X GET http://localhost:3000/api/chat/$SESSION_ID/history | json_pp
