#!/bin/bash

# KidneyWise - Push to GitHub Script
# This script will push your code with all the new features to GitHub

echo "🚀 KidneyWise - Push to GitHub"
echo "================================"
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    echo "Please run this script from the kidneywise-app directory"
    exit 1
fi

# Ask for GitHub repository URL if not already set
REMOTE=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE" ]; then
    echo "📝 GitHub repository URL needed"
    echo ""
    echo "Please provide your GitHub repository URL:"
    echo "Example: https://github.com/ankitsharma/kidneywise-app"
    echo "OR: git@github.com:ankitsharma/kidneywise-app.git"
    echo ""
    read -p "Repository URL: " REPO_URL

    if [ -z "$REPO_URL" ]; then
        echo "❌ No URL provided. Exiting."
        exit 1
    fi

    echo ""
    echo "Adding remote origin..."
    git remote add origin "$REPO_URL"

    if [ $? -ne 0 ]; then
        echo "❌ Failed to add remote"
        exit 1
    fi

    echo "✅ Remote added successfully"
fi

echo ""
echo "📦 Pushing code to GitHub..."
echo ""

# Push to main branch
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Code pushed to GitHub"
    echo ""
    echo "🎉 All your new features are now on GitHub:"
    echo "   - Symptom Management"
    echo "   - Meal History"
    echo "   - Bottom Navigation"
    echo "   - Food Analysis with Claude AI"
    echo "   - Complete Authentication"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Railway will auto-deploy the backend"
    echo "2. Vercel will auto-deploy the frontend"
    echo "3. Wait 2-3 minutes for deployments to complete"
    echo "4. Visit your Vercel URL to see the new features!"
    echo ""
else
    echo ""
    echo "❌ Push failed. Common reasons:"
    echo "1. Authentication issue - you may need to login to GitHub"
    echo "2. Repository doesn't exist - create it first on GitHub"
    echo "3. Branch protection - check repository settings"
    echo ""
    echo "💡 Try:"
    echo "- Visit: https://github.com/new"
    echo "- Create a new repository called 'kidneywise-app'"
    echo "- Then run this script again"
    exit 1
fi
