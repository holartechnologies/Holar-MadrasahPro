@echo off
title Ihya'us Sunnah School Management System
echo Starting server in background...
start "ISMS Server" /MIN npm start
echo Server started at http://localhost:3000
timeout /t 2 /nobreak >nul
