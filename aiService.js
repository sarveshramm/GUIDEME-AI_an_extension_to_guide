// AI Service for ClickGuide Extension
// Handles AI API calls and response parsing

/**
 * AI Service - Generates step-by-step guides using AI
 */
class AIService {
  constructor() {
    this.apiKey = null;
    this.apiProvider = 'openai'; // 'openai' or 'anthropic'
    this.cache = new Map(); // Simple cache for similar queries
  }

  /**
   * Initialize the AI service with API key from storage
   */
  async initialize() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['aiApiKey', 'aiProvider'], (result) => {
        this.apiKey = result.aiApiKey || null;
        this.apiProvider = result.aiProvider || 'openai';
        resolve();
      });
    });
  }

  /**
   * Check if API is configured
   */
  isConfigured() {
    return this.apiKey !== null && this.apiKey.trim().length > 0;
  }

  /**
   * Generate step-by-step guide using AI
   * @param {string} taskDescription - User's task description
   * @param {string} currentUrl - Current page URL
   * @returns {Promise<Array>} - Array of step objects
   */
  async generateGuide(taskDescription, currentUrl = '') {
    if (!this.isConfigured()) {
      throw new Error('API key not configured');
    }

    // Check cache first
    const cacheKey = `${taskDescription.toLowerCase()}_${currentUrl}`;
    if (this.cache.has(cacheKey)) {
      console.log('Using cached guide');
      return this.cache.get(cacheKey);
    }

    try {
      const steps = await this.callAI(taskDescription, currentUrl);
      
      // Cache the result
      this.cache.set(cacheKey, steps);
      
      return steps;
    } catch (error) {
      console.error('AI generation error:', error);
      throw error;
    }
  }

  /**
   * Call the AI API to generate steps
   * @param {string} taskDescription - User's task
   * @param {string} currentUrl - Current URL
   * @returns {Promise<Array>} - Parsed steps
   */
  async callAI(taskDescription, currentUrl) {
    const prompt = this.buildPrompt(taskDescription, currentUrl);
    
    if (this.apiProvider === 'openai') {
      return await this.callOpenAI(prompt);
    } else if (this.apiProvider === 'anthropic') {
      return await this.callAnthropic(prompt);
    } else {
      throw new Error('Unknown API provider');
    }
  }

  /**
   * Build the prompt for AI
   * @param {string} taskDescription - User's task
   * @param {string} currentUrl - Current URL
   * @returns {string} - Formatted prompt
   */
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
- Links: a[href*='keyword'], a:contains('text')
- Forms: form, input[type='submit'], button[type='submit']

Return ONLY the JSON array, no other text.`;
  }

  /**
   * Call OpenAI API
   * @param {string} prompt - The prompt
   * @returns {Promise<Array>} - Parsed steps
   */
  async callOpenAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cheaper model, can be changed to gpt-4 for better results
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
    const content = data.choices[0].message.content.trim();
    
    return this.parseAIResponse(content);
  }

  /**
   * Call Anthropic API (Claude)
   * @param {string} prompt - The prompt
   * @returns {Promise<Array>} - Parsed steps
   */
  async callAnthropic(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast and affordable
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
    const content = data.content[0].text.trim();
    
    return this.parseAIResponse(content);
  }

  /**
   * Parse AI response into step objects
   * @param {string} content - AI response text
   * @returns {Array} - Array of step objects
   */
  parseAIResponse(content) {
    try {
      // Try to extract JSON from the response (might have markdown code blocks)
      let jsonText = content;
      
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else {
        // Try to find JSON array in the text
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          jsonText = arrayMatch[0];
        }
      }

      const steps = JSON.parse(jsonText);
      
      // Validate and normalize steps
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
      console.log('Raw content:', content);
      
      // Fallback: create a simple step from the text
      return [{
        title: 'Step 1: Follow Instructions',
        description: content.substring(0, 200) + '...',
        selector: 'body',
        fallback: 'Follow the instructions provided'
      }];
    }
  }

  /**
   * Set API key
   * @param {string} apiKey - API key
   * @param {string} provider - API provider ('openai' or 'anthropic')
   */
  async setApiKey(apiKey, provider = 'openai') {
    this.apiKey = apiKey;
    this.apiProvider = provider;
    
    await chrome.storage.sync.set({
      aiApiKey: apiKey,
      aiProvider: provider
    });
  }
}

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIService;
}

