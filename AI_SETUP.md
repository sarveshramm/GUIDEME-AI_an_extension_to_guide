# AI Setup Guide - ClickGuide Extension

## 🤖 AI-Powered Task Guidance

ClickGuide now uses AI to generate personalized step-by-step guides for **any task** you describe! The AI analyzes your task description and the current website to create custom instructions.

## 🚀 Quick Setup

### Step 1: Get an API Key

You need an API key from one of these providers:

#### Option A: OpenAI (Recommended for beginners)
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. **Important:** Save it immediately - you won't see it again!

**Cost:** ~$0.15 per 1M tokens (very affordable for personal use)
**Model Used:** GPT-4o-mini (fast and cost-effective)

#### Option B: Anthropic (Claude)
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

**Cost:** ~$0.25 per 1M tokens
**Model Used:** Claude 3 Haiku (fast and efficient)

### Step 2: Configure in Extension

1. **Open ClickGuide popup** (click the extension icon)
2. **Paste your API key** in the "AI API Key" field
3. **Select your provider** (OpenAI or Anthropic)
4. **Click "Save API Key"**
5. You should see: "✓ API key saved successfully!"

### Step 3: Use AI Guide

1. **Open any website** (e.g., github.com, amazon.com, etc.)
2. **Click ClickGuide icon**
3. **Enter your task** (e.g., "Create a GitHub repository", "Add item to cart", "Sign up for account")
4. **Click "Start AI Guide"**
5. **Wait a few seconds** for AI to generate steps
6. **Follow the personalized guide!**

## 💡 Example Tasks

Try these examples to see AI in action:

- **"Create a GitHub repository called 'my-project'"**
- **"Sign up for a new account on this website"**
- **"Add this product to my shopping cart"**
- **"Search for laptops under $1000"**
- **"Upload a profile picture"**
- **"Change my account password"**
- **"Subscribe to the newsletter"**
- **"Download the mobile app"**

## 🔄 Fallback System

If you don't configure an API key, ClickGuide automatically falls back to the **keyword-based system** which works for common tasks like:
- GitHub repository creation
- Sign up / Registration
- Login
- Search

The AI system is much more powerful and can handle any task!

## 🔒 Security & Privacy

- **API keys are stored locally** in your browser (Chrome sync storage)
- **Never shared** with anyone except the API provider
- **All API calls** go directly from your browser to the provider
- **No data** is stored on external servers

## 💰 Cost Estimation

### OpenAI (GPT-4o-mini)
- **Per guide:** ~$0.0001 - $0.001 (less than 1 cent!)
- **100 guides:** ~$0.01 - $0.10
- **1000 guides:** ~$0.10 - $1.00

### Anthropic (Claude Haiku)
- **Per guide:** ~$0.0002 - $0.002
- **100 guides:** ~$0.02 - $0.20
- **1000 guides:** ~$0.20 - $2.00

**Most users will spend less than $1/month** for regular use!

## 🛠️ Troubleshooting

### "API key not configured"
- Make sure you've entered and saved your API key
- Check that you selected the correct provider
- Try refreshing the extension

### "AI generation failed"
- Check your API key is valid
- Ensure you have credits/quota available
- Check your internet connection
- The extension will automatically fallback to keyword-based guide

### "Error: Invalid API key"
- Verify your API key is correct (no extra spaces)
- Make sure you're using the right provider
- Check if your API key has expired

### API Rate Limits
- Free tier users may have rate limits
- If you hit limits, wait a few minutes and try again
- Consider upgrading your API plan for higher limits

## 🎯 How It Works

1. **You enter a task** (e.g., "Create a GitHub repo")
2. **AI analyzes** your task and the current website
3. **AI generates** 3-7 personalized steps with:
   - Clear instructions
   - CSS selectors to find elements
   - Fallback guidance
4. **Extension highlights** elements on the page
5. **You follow** the step-by-step guide

## 🔧 Advanced Configuration

### Using Different Models

Edit `background.js` to change models:

**OpenAI:**
- `gpt-4o-mini` (default, cheapest)
- `gpt-4o` (better quality, more expensive)
- `gpt-3.5-turbo` (older, cheaper)

**Anthropic:**
- `claude-3-haiku-20240307` (default, fastest)
- `claude-3-sonnet-20240229` (better quality)
- `claude-3-opus-20240229` (best quality, expensive)

### Custom Prompts

You can modify the prompt in `background.js` → `buildPrompt()` function to customize how AI generates guides.

## 📚 API Documentation

- **OpenAI:** [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Anthropic:** [https://docs.anthropic.com](https://docs.anthropic.com)

## ❓ FAQ

**Q: Do I need to pay for API access?**
A: Most providers offer free credits to start. OpenAI gives $5 free credit, Anthropic offers free tier.

**Q: Can I use my own AI model?**
A: Yes! Modify `background.js` to use any OpenAI-compatible API endpoint.

**Q: Is my data private?**
A: Yes! Only your task description and current URL are sent to the API. No personal data is stored.

**Q: Can I use without API key?**
A: Yes! The extension falls back to keyword-based guides automatically.

**Q: How accurate are AI-generated guides?**
A: Very accurate! The AI is trained on web navigation patterns and generates context-aware steps.

---

**Ready to get started?** Configure your API key and try it out! 🚀

