// Background service worker for ClickGuide Extension
// Handles AI API calls and message routing

// Import AI Service (in a real extension, this would be loaded as a module)
// For now, we'll include the AI service logic here

/**
 * AI Service - Simplified version for background script
 */
class AIService {
  constructor() {
    this.apiKey = null;
    this.apiProvider = 'openai';
  }

  async initialize() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['aiApiKey', 'aiProvider'], (result) => {
        this.apiKey = result.aiApiKey || null;
        this.apiProvider = result.aiProvider || 'openai';
        resolve();
      });
    });
  }

  isConfigured() {
    return this.apiKey !== null && this.apiKey.trim().length > 0;
  }

  buildPrompt(taskDescription, currentUrl) {
    const domain = currentUrl ? new URL(currentUrl).hostname : 'any website';
    
    return `You are a web navigation assistant. Generate a step-by-step guide to help a user complete this task: "${taskDescription}"

Current website: ${domain}

Generate 3-7 clear, actionable steps. Each step should:
1. Have a clear title (e.g., "Step 1: Find the Login Button")
2. Have a detailed description of what to do
3. Include CSS selectors that might help find the relevant element (common patterns like buttons, inputs, links)
4. Include a fallback description if the element isn't found

Format your response as a JSON array with this exact structure:
[
  {
    "title": "Step 1: [Action]",
    "description": "[Detailed instruction]",
    "selector": "[CSS selector or comma-separated selectors]",
    "fallback": "[What to look for if selector doesn't match]"
  },
  ...
]

Be specific with selectors. Common patterns:
- Buttons: button, a[href*='keyword'], button[aria-label*='keyword']
- Inputs: input[type='email'], input[name*='email'], input[placeholder*='email']
- Links: a[href*='keyword']
- Forms: form, input[type='submit'], button[type='submit']

Return ONLY the JSON array, no other text.`;
  }

  async callOpenAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful web navigation assistant. Always respond with valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  async callAnthropic(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0].text.trim();
  }

  parseAIResponse(content) {
    try {
      let jsonText = content;
      
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          jsonText = arrayMatch[0];
        }
      }

      const steps = JSON.parse(jsonText);
      
      if (!Array.isArray(steps)) {
        throw new Error('Response is not an array');
      }

      return steps.map((step, index) => ({
        title: step.title || `Step ${index + 1}`,
        description: step.description || '',
        selector: step.selector || 'body',
        fallback: step.fallback || step.description || ''
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return [{
        title: 'Step 1: Follow Instructions',
        description: content.substring(0, 200) + '...',
        selector: 'body',
        fallback: 'Follow the instructions provided'
      }];
    }
  }

  async generateGuide(taskDescription, currentUrl) {
    if (!this.isConfigured()) {
      throw new Error('API key not configured');
    }

    const prompt = this.buildPrompt(taskDescription, currentUrl);
    let content;
    
    if (this.apiProvider === 'openai') {
      content = await this.callOpenAI(prompt);
    } else if (this.apiProvider === 'anthropic') {
      content = await this.callAnthropic(prompt);
    } else {
      throw new Error('Unknown API provider');
    }

    return this.parseAIResponse(content);
  }
}

// Initialize AI service
const aiService = new AIService();
aiService.initialize();

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GENERATE_GUIDE') {
    // Generate guide using AI
    aiService.generateGuide(message.taskDescription, message.currentUrl)
      .then(steps => {
        sendResponse({ success: true, steps });
      })
      .catch(error => {
        console.error('AI generation error:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'SET_API_KEY') {
    // Save API key
    chrome.storage.sync.set({
      aiApiKey: message.apiKey,
      aiProvider: message.provider || 'openai'
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving API key:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      // Update AI service instance
      aiService.apiKey = message.apiKey;
      aiService.apiProvider = message.provider || 'openai';
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'GET_API_STATUS') {
    // Check if API is configured
    aiService.initialize().then(() => {
      sendResponse({ 
        configured: aiService.isConfigured(),
        provider: aiService.apiProvider 
      });
    });
    return true;
  }
});

