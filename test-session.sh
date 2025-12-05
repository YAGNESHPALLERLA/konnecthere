#!/bin/bash
echo "Testing /api/auth/session endpoint..."
echo ""
echo "1. Testing without authentication:"
curl -v http://localhost:3000/api/auth/session 2>&1 | grep -E "(HTTP|Location|Set-Cookie|Content-Type)" | head -5
echo ""
echo "2. Response body:"
curl -s http://localhost:3000/api/auth/session | jq . 2>/dev/null || curl -s http://localhost:3000/api/auth/session
echo ""




