#!/bin/bash
# Start the backend server
cd server && npm start &
# Start the frontend
cd .. && npm run dev
