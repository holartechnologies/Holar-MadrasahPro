@echo off
echo Ihya'us Sunnah School Management System - Setup
echo ===============================================
echo.
echo Installing dependencies...
call npm install
echo.
echo Generating Prisma client...
call npx prisma generate
echo.
echo Creating database...
call npx prisma db push
echo.
echo Seeding data...
call npx prisma db seed
echo.
echo Build complete. Starting server...
npm start
