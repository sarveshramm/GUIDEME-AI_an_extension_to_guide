// Content script for ClickGuide extension
// Handles overlay creation and step-by-step guide with intelligent task parsing

// ============================================================================
// TASK LIBRARY - Predefined task flows
// ============================================================================

const taskLibrary = {
  // GitHub Repository Creation
  'github': {
    keywords: ['github', 'repository', 'repo', 'create repo', 'new repository', 'git repo'],
    steps: [
      {
        title: "Step 1: Navigate to GitHub",
        description: "Make sure you're on github.com. If not, navigate to https://github.com",
        selector: "body",
        urlPattern: /github\.com/
      },
      {
        title: "Step 2: Sign In",
        description: "Click the 'Sign in' button at the top right corner of the page.",
        selector: "a[href*='login'], a[href*='signin'], a[href='/login'], button[data-ga-click*='Sign in'], .HeaderMenu-link[href*='login']",
        fallback: "Look for the Sign in link in the top navigation"
      },
      {
        title: "Step 3: Create New Repository",
        description: "After signing in, click the '+' icon in the top right, then select 'New repository', or look for a green 'New' button.",
        selector: "a[href*='/new'], button[aria-label*='New'], summary[aria-label*='New'], .btn-primary[href*='new'], a[href='/new']",
        fallback: "Find the 'New' or '+' button in the top navigation bar"
      },
      {
        title: "Step 4: Name Your Repository",
        description: "Enter a repository name in the 'Repository name' field.",
        selector: "input[name='repository[name]'], input[id*='repository_name'], input[placeholder*='repository name'], input[type='text'][name*='name']",
        fallback: "Find the repository name input field"
      },
      {
        title: "Step 5: Create Repository",
        description: "Scroll down and click the green 'Create repository' button at the bottom.",
        selector: "button[type='submit'], button.btn-primary[type='submit']",
        fallback: "Click the green 'Create repository' button"
      }
    ]
  },

  // Sign Up / Registration
  'signup': {
    keywords: ['sign up', 'signup', 'register', 'create account', 'new account', 'join'],
    steps: [
      {
        title: "Step 1: Find Sign Up Button",
        description: "Look for a 'Sign up', 'Register', 'Create account', or 'Join' button on the page.",
        selector: "a[href*='signup'], a[href*='register'], a[href*='sign-up'], button[aria-label*='Sign up'], button[aria-label*='Register'], .signup-button, .register-button, a:contains('Sign up'), a:contains('Register')",
        fallback: "Look for registration or sign up links/buttons"
      },
      {
        title: "Step 2: Enter Email",
        description: "Enter your email address in the email field.",
        selector: "input[type='email'], input[name*='email'], input[id*='email'], input[placeholder*='email'], input[placeholder*='Email']",
        fallback: "Find the email input field"
      },
      {
        title: "Step 3: Enter Password",
        description: "Create and enter a password in the password field.",
        selector: "input[type='password'], input[name*='password'], input[id*='password']",
        fallback: "Find the password input field"
      },
      {
        title: "Step 4: Complete Registration",
        description: "Click the 'Sign up', 'Register', or 'Create account' button to complete registration.",
        selector: "button[type='submit'], input[type='submit']",
        fallback: "Click the submit or register button"
      }
    ]
  },

  // Login / Sign In
  'login': {
    keywords: ['login', 'sign in', 'signin', 'log in', 'sign into'],
    steps: [
      {
        title: "Step 1: Find Login Button",
        description: "Look for a 'Sign in', 'Login', or 'Log in' button or link.",
        selector: "a[href*='login'], a[href*='signin'], button[aria-label*='Sign in'], button[aria-label*='Login'], .login-button, .signin-button",
        fallback: "Look for login or sign in links/buttons"
      },
      {
        title: "Step 2: Enter Username/Email",
        description: "Enter your username or email address in the username/email field.",
        selector: "input[type='text'][name*='user'], input[type='email'], input[name*='username'], input[name*='email'], input[id*='username'], input[id*='email'], input[placeholder*='username'], input[placeholder*='email'], input[placeholder*='Username'], input[placeholder*='Email']",
        fallback: "Find the username or email input field"
      },
      {
        title: "Step 3: Enter Password",
        description: "Enter your password in the password field.",
        selector: "input[type='password'], input[name*='password'], input[id*='password']",
        fallback: "Find the password input field"
      },
      {
        title: "Step 4: Submit Login",
        description: "Click the 'Sign in', 'Login', or 'Log in' button to sign in.",
        selector: "button[type='submit'], button:contains('Sign in'), button:contains('Login'), input[type='submit']",
        fallback: "Click the login or sign in button"
      }
    ]
  },

  // Search
  'search': {
    keywords: ['search', 'find', 'look for', 'lookup'],
    steps: [
      {
        title: "Step 1: Locate Search Box",
        description: "Find the search box or search bar on the page. It's usually at the top.",
        selector: "input[type='search'], input[name*='search'], input[id*='search'], input[placeholder*='search'], input[placeholder*='Search'], textarea[name*='search'], .search-box, .search-input, [role='search'] input",
        fallback: "Look for a search box or search bar"
      },
      {
        title: "Step 2: Enter Search Term",
        description: "Type your search query into the search box.",
        selector: "input[type='search'], input[name*='search'], input[id*='search'], input[placeholder*='search'], input[placeholder*='Search']",
        fallback: "Enter your search term in the search box"
      },
      {
        title: "Step 3: Execute Search",
        description: "Press Enter or click the search button (magnifying glass icon).",
        selector: "button[type='submit'], button[aria-label*='Search'], button[aria-label*='search'], .search-button, input[type='submit'][value*='Search'], button:has(svg[aria-label*='search'])",
        fallback: "Press Enter or click the search button"
      }
    ]
  },

  // Generic Navigation Guide
  'generic': {
    keywords: ['navigate', 'go to', 'open', 'visit'],
    steps: [
      {
        title: "Step 1: Identify Your Goal",
        description: "Look at the page and identify what you want to accomplish.",
        selector: "body",
        fallback: "Review the page content"
      },
      {
        title: "Step 2: Find Relevant Links/Buttons",
        description: "Look for links, buttons, or menu items that relate to your task.",
        selector: "a, button, [role='button'], [role='link']",
        fallback: "Look for clickable elements related to your task"
      },
      {
        title: "Step 3: Click and Proceed",
        description: "Click on the relevant element and continue with your task.",
        selector: "a, button",
        fallback: "Click on the element that matches your goal"
      }
    ]
  }
};

/**
 * Parses user input to identify the task type
 * @param {string} userInput - The task description from user
 * @returns {string} - Task type key or 'generic'
 */
function parseTask(userInput) {
  if (!userInput || userInput.trim().length === 0) {
    return 'github'; // Default to GitHub demo
  }

  const input = userInput.toLowerCase().trim();
  
  // Check each task type
  for (const [taskKey, taskData] of Object.entries(taskLibrary)) {
    if (taskKey === 'generic') continue; // Skip generic, use as fallback
    
    for (const keyword of taskData.keywords) {
      if (input.includes(keyword)) {
        return taskKey;
      }
    }
  }
  
  // Check for URL patterns
  if (input.includes('github')) return 'github';
  if (input.includes('sign up') || input.includes('register')) return 'signup';
  if (input.includes('login') || input.includes('sign in')) return 'login';
  if (input.includes('search')) return 'search';
  
  // Default to generic guide
  return 'generic';
}

/**
 * Gets the steps for a given task type
 * @param {string} taskType - The task type key
 * @param {string} currentUrl - Current page URL
 * @returns {Array} - Array of step objects
 */
function getTaskSteps(taskType, currentUrl = '') {
  const task = taskLibrary[taskType] || taskLibrary['generic'];
  
  // Filter steps based on URL if needed
  let steps = [...task.steps]; // Clone array
  
  // If task requires specific URL, check if we're on the right page
  if (taskType === 'github' && !currentUrl.includes('github.com')) {
    // Add a preliminary step to navigate
    steps = [{
      title: "Step 0: Navigate to GitHub",
      description: "Please navigate to https://github.com first, then start the guide again.",
      selector: "body",
      isUrlCheck: true
    }, ...steps];
  }
  
  return steps;
}

// ============================================================================
// OVERLAY AND GUIDE MANAGEMENT
// ============================================================================

// State management
let currentStepIndex = 0;
let currentSteps = [];
let overlayContainer = null;
let highlightedElement = null;
let pageOverlay = null;

/**
 * Creates the main overlay container for the guide
 */
function createOverlay() {
  // Remove existing overlay if present
  if (overlayContainer) {
    overlayContainer.remove();
  }

  // Create overlay container
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'clickguide-overlay';
  
  // Create step content container
  const stepContent = document.createElement('div');
  stepContent.className = 'step-content';
  
  const stepTitle = document.createElement('h2');
  stepTitle.className = 'step-title';
  stepTitle.id = 'clickguide-step-title';
  
  const stepDescription = document.createElement('p');
  stepDescription.className = 'step-description';
  stepDescription.id = 'clickguide-step-description';
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  
  const prevButton = document.createElement('button');
  prevButton.className = 'nav-button prev-button';
  prevButton.textContent = 'Previous';
  prevButton.id = 'clickguide-prev';
  
  const nextButton = document.createElement('button');
  nextButton.className = 'nav-button next-button';
  nextButton.textContent = 'Next';
  nextButton.id = 'clickguide-next';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.textContent = '×';
  closeButton.id = 'clickguide-close';
  closeButton.title = 'Close guide';
  
  // Assemble overlay
  buttonContainer.appendChild(prevButton);
  buttonContainer.appendChild(nextButton);
  stepContent.appendChild(stepTitle);
  stepContent.appendChild(stepDescription);
  stepContent.appendChild(buttonContainer);
  overlayContainer.appendChild(closeButton);
  overlayContainer.appendChild(stepContent);
  
  // Add event listeners
  prevButton.addEventListener('click', () => navigateStep(-1));
  nextButton.addEventListener('click', () => navigateStep(1));
  closeButton.addEventListener('click', closeGuide);
  
  // Append to body
  document.body.appendChild(overlayContainer);
  
  // Render initial step
  renderStep(0);
}

/**
 * Renders a specific step
 * @param {number} stepIndex - Index of the step to render
 */
function renderStep(stepIndex) {
  if (!currentSteps || stepIndex < 0 || stepIndex >= currentSteps.length) {
    return;
  }
  
  currentStepIndex = stepIndex;
  const step = currentSteps[stepIndex];
  
  // Update step title and description
  const stepTitle = document.getElementById('clickguide-step-title');
  const stepDescription = document.getElementById('clickguide-step-description');
  const prevButton = document.getElementById('clickguide-prev');
  const nextButton = document.getElementById('clickguide-next');
  
  if (stepTitle) stepTitle.textContent = step.title;
  if (stepDescription) {
    // Show fallback message if element not found
    const descriptionText = step.description;
    if (step.fallback && !findElement(step.selector)) {
      stepDescription.textContent = descriptionText + ' (' + step.fallback + ')';
      stepDescription.style.color = '#ff6b6b';
    } else {
      stepDescription.textContent = descriptionText;
      stepDescription.style.color = '#555';
    }
  }
  
  // Update button states
  if (prevButton) {
    prevButton.disabled = stepIndex === 0;
    prevButton.style.opacity = stepIndex === 0 ? '0.5' : '1';
  }
  
  if (nextButton) {
    nextButton.disabled = stepIndex === currentSteps.length - 1;
    nextButton.textContent = stepIndex === currentSteps.length - 1 ? 'Finish' : 'Next';
  }
  
  // Clear previous highlight
  clearHighlight();
  
  // Highlight element if selector is provided
  if (step.selector) {
    highlightElement(step.selector);
  }
}

/**
 * Finds an element using a selector (tries multiple selectors if comma-separated)
 * @param {string} selector - CSS selector(s) for the element
 * @returns {HTMLElement|null} - Found element or null
 */
function findElement(selector) {
  if (!selector) return null;
  
  // Split by comma and try each selector
  const selectors = selector.split(',').map(s => s.trim());
  
  for (const sel of selectors) {
    try {
      const element = document.querySelector(sel);
      if (element) {
        return element;
      }
    } catch (error) {
      // Invalid selector, try next one
      continue;
    }
  }
  
  return null;
}

/**
 * Highlights an element on the page
 * @param {string} selector - CSS selector for the element to highlight
 */
function highlightElement(selector) {
  try {
    const element = findElement(selector);
    
    if (element) {
      highlightedElement = element;
      
      // Add highlight class to the element
      element.classList.add('clickguide-highlighted');
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Create page overlay for focus effect
      createPageOverlay(element);
    } else {
      // Element not found, just show the overlay without highlight
      console.log('Element not found for selector:', selector);
    }
  } catch (error) {
    console.error('Error highlighting element:', error);
  }
}

/**
 * Creates a semi-transparent overlay over the page
 * @param {HTMLElement} element - Element to keep visible
 */
function createPageOverlay(element) {
  // Remove existing page overlay
  if (pageOverlay) {
    pageOverlay.remove();
  }
  
  // Create overlay
  pageOverlay = document.createElement('div');
  pageOverlay.id = 'clickguide-page-overlay';
  
  // Create overlay with simple dark background
  // The highlighted element will appear above it due to z-index
  pageOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999998;
    pointer-events: none;
  `;
  
  document.body.appendChild(pageOverlay);
}

/**
 * Clears the highlight from any previously highlighted element
 */
function clearHighlight() {
  if (highlightedElement) {
    highlightedElement.classList.remove('clickguide-highlighted');
    highlightedElement = null;
  }
  
  if (pageOverlay) {
    pageOverlay.remove();
    pageOverlay = null;
  }
}

/**
 * Navigates to the next or previous step
 * @param {number} direction - 1 for next, -1 for previous
 */
function navigateStep(direction) {
  const newIndex = currentStepIndex + direction;
  
  if (newIndex >= 0 && newIndex < currentSteps.length) {
    renderStep(newIndex);
  } else if (newIndex >= currentSteps.length) {
    // Finished all steps
    closeGuide();
  }
}

/**
 * Closes the guide and cleans up
 */
function closeGuide() {
  clearHighlight();
  
  if (overlayContainer) {
    overlayContainer.remove();
    overlayContainer = null;
  }
  
  currentStepIndex = 0;
  currentSteps = [];
}

/**
 * Starts the guide with a given task instruction
 * @param {string} instruction - User's task instruction
 * @param {boolean} useAI - Whether to use AI or keyword-based system
 * @param {string} currentUrl - Current page URL
 */
async function startGuide(instruction, useAI = false, currentUrl = '') {
  if (!currentUrl) {
    currentUrl = window.location.href;
  }

  if (useAI) {
    // Use AI to generate steps
    try {
      console.log('Generating AI guide for:', instruction);
      
      // Show loading overlay
      showLoadingOverlay();
      
      // Request AI-generated steps from background script
      chrome.runtime.sendMessage({
        type: 'GENERATE_GUIDE',
        taskDescription: instruction,
        currentUrl: currentUrl
      }, (response) => {
        hideLoadingOverlay();
        
        if (chrome.runtime.lastError) {
          console.error('Error generating AI guide:', chrome.runtime.lastError);
          // Fallback to keyword-based
          fallbackToKeywordGuide(instruction, currentUrl);
          return;
        }
        
        if (response && response.success && response.steps) {
          console.log('AI generated steps:', response.steps.length);
          currentSteps = response.steps;
          createOverlay();
        } else {
          console.error('AI generation failed:', response?.error);
          // Fallback to keyword-based
          fallbackToKeywordGuide(instruction, currentUrl);
        }
      });
    } catch (error) {
      console.error('Error in AI guide generation:', error);
      hideLoadingOverlay();
      // Fallback to keyword-based
      fallbackToKeywordGuide(instruction, currentUrl);
    }
  } else {
    // Use keyword-based system
    fallbackToKeywordGuide(instruction, currentUrl);
  }
}

/**
 * Fallback to keyword-based guide system
 * @param {string} instruction - User's task instruction
 * @param {string} currentUrl - Current page URL
 */
function fallbackToKeywordGuide(instruction, currentUrl) {
  console.log('Using keyword-based guide system');
  
  // Parse the task
  const taskType = parseTask(instruction);
  
  // Get steps for the task
  currentSteps = getTaskSteps(taskType, currentUrl);
  
  console.log('Starting guide for task type:', taskType);
  console.log('Steps:', currentSteps.length);
  
  // Create and show the overlay
  createOverlay();
}

/**
 * Show loading overlay while AI generates steps
 */
function showLoadingOverlay() {
  // Remove existing overlay if present
  if (overlayContainer) {
    overlayContainer.remove();
  }

  overlayContainer = document.createElement('div');
  overlayContainer.id = 'clickguide-overlay';
  overlayContainer.innerHTML = `
    <div class="step-content">
      <h2 class="step-title">Generating AI Guide...</h2>
      <p class="step-description">Please wait while we create your personalized step-by-step guide.</p>
      <div style="text-align: center; margin-top: 20px;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4a90e2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      </div>
    </div>
  `;
  
  // Add spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(overlayContainer);
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
  if (overlayContainer && overlayContainer.querySelector('.step-description')?.textContent.includes('Generating')) {
    // Don't remove if it's already been replaced with actual content
    return;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_GUIDE') {
    console.log('Received START_GUIDE message, instruction:', message.rawInstruction);
    console.log('Use AI:', message.useAI);
    
    // Start the guide with the user's instruction
    startGuide(
      message.rawInstruction || '', 
      message.useAI || false,
      message.currentUrl || window.location.href
    );
    
    // Send response immediately (AI generation is async)
    sendResponse({ success: true });
    return true; // Keep message channel open for async response
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  closeGuide();
});
