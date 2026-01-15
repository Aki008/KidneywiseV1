#!/bin/bash

# KidneyWise Application Startup Script
# This script will set up and run your application

echo "╔═══════════════════════════════════════════════════════╗"
echo "║         KidneyWise Application Setup & Start          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the kidneywise-app directory"
    echo "   Current directory: $(pwd)"
    exit 1
fi

echo "Step 1: Setting up Database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL first."
    echo "   Install: brew install postgresql@14"
    exit 1
fi

# Create database
echo "Creating database..."
psql postgres -c "CREATE DATABASE kidneywise_dev;" 2>/dev/null || echo "  Database already exists (OK)"
psql postgres -c "CREATE USER dev WITH PASSWORD 'devpass';" 2>/dev/null || echo "  User already exists (OK)"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE kidneywise_dev TO dev;" 2>/dev/null

# Enable extension
psql kidneywise_dev -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;" 2>/dev/null
echo "✅ Database setup complete"
echo ""

echo "Step 2: Setting up Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: You need to add your OpenAI API key to backend/.env"
    echo "   Edit the file and set: OPENAI_API_KEY=sk-your-key-here"
    echo ""
    read -p "Press Enter to open .env file in nano editor..."
    nano .env
fi

# Run migrations
echo "Running database migrations..."
npx knex migrate:latest

# Run seeds
echo "Seeding database..."
npx knex seed:run

echo "✅ Backend setup complete"
echo ""

cd ..

echo "Step 3: Setting up Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                  SETUP COMPLETE!                      ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Now starting the application..."
echo ""
echo "You will need to open 2 terminal windows:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd /Users/ankitsharma/Documents/Kidneywise/kidneywise-app/backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd /Users/ankitsharma/Documents/Kidneywise/kidneywise-app/frontend"
echo "  npm run dev"
echo ""
echo "Then open your browser and go to:"
echo "  🌐 http://localhost:3000"
echo ""
echo "Press any key to continue..."
read -n 1
