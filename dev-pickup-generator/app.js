// Developer Pickup Lines App
class DevPickupLinesApp {
  constructor() {
    // Pickup lines data
    this.pickupLines = [
      {"id": 1, "line": "Are you a semicolon? Because you complete me.", "category": "Basic Programming", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 2, "line": "Are you an exception? Because I can't handle you.", "category": "Basic Programming", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 3, "line": "You must be a loop, because you keep running through my mind.", "category": "Basic Programming", "difficulty": "beginner", "humor_level": "high"},
      {"id": 4, "line": "Are you a function? Because I'd call you anytime.", "category": "Basic Programming", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 5, "line": "Are you a variable? Because my love for you is always dynamic.", "category": "Basic Programming", "difficulty": "beginner", "humor_level": "high"},
      {"id": 6, "line": "You had me at 'Hello World.'", "category": "Basic Programming", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 7, "line": "My love for you is like an infinite loop - it never ends.", "category": "Basic Programming", "difficulty": "beginner", "humor_level": "high"},
      {"id": 8, "line": "Are you a compiler? Because you turn my code into something beautiful.", "category": "Basic Programming", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 9, "line": "You're the exception to my rule.", "category": "Language-Specific", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 10, "line": "Are you a keyboard? Because you're just my type.", "category": "Language-Specific", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 11, "line": "Are you Python? Because you make my life simpler.", "category": "Language-Specific", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 12, "line": "Is your name Java? Because you keep me awake.", "category": "Language-Specific", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 13, "line": "Are you JavaScript? Because you bring my world to life.", "category": "Language-Specific", "difficulty": "beginner", "humor_level": "high"},
      {"id": 14, "line": "You must be HTML, because you structure my world perfectly.", "category": "Language-Specific", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 15, "line": "Are you CSS? Because you make my life style better.", "category": "Language-Specific", "difficulty": "beginner", "humor_level": "medium"},
      {"id": 16, "line": "If they made you in C, you would have a pointer to my heart.", "category": "Language-Specific", "difficulty": "beginner", "humor_level": "high"},
      {"id": 17, "line": "Are you a Swift protocol? Because you define my expectations.", "category": "Git & Version Control", "difficulty": "intermediate", "humor_level": "medium"},
      {"id": 18, "line": "You must be PHP, because you preprocess my heart.", "category": "Git & Version Control", "difficulty": "intermediate", "humor_level": "medium"},
      {"id": 19, "line": "Are you SQL? Because you SELECT my heart.", "category": "Git & Version Control", "difficulty": "intermediate", "humor_level": "medium"},
      {"id": 20, "line": "Are you a Go routine? Because you make my heart run concurrently.", "category": "Git & Version Control", "difficulty": "intermediate", "humor_level": "high"},
      {"id": 21, "line": "Are you Git? Because you've merged perfectly with my heart.", "category": "Git & Version Control", "difficulty": "intermediate", "humor_level": "high"},
      {"id": 22, "line": "I'm not sure if I should commit to you or just push you away.", "category": "Git & Version Control", "difficulty": "intermediate", "humor_level": "medium"},
      {"id": 23, "line": "Are you a repository? Because I can't commit without you.", "category": "Git & Version Control", "difficulty": "intermediate", "humor_level": "medium"},
      {"id": 24, "line": "Let's fork this relationship and see where it goes.", "category": "Git & Version Control", "difficulty": "intermediate", "humor_level": "high"},
      {"id": 25, "line": "You're like a pull request - I want to merge with you.", "category": "Debugging & Errors", "difficulty": "advanced", "humor_level": "high"},
      {"id": 26, "line": "Are you a version control system? Because I can't commit without you.", "category": "Debugging & Errors", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 27, "line": "My heart just ran a successful 'love you' function.", "category": "Debugging & Errors", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 28, "line": "You're the main branch to my repository.", "category": "Debugging & Errors", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 29, "line": "Are you a debugger? Because you just fixed all my problems.", "category": "Debugging & Errors", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 30, "line": "You must be a 404 error, because I've never found anyone like you.", "category": "Debugging & Errors", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 31, "line": "Are you a syntax error? Because you stop my world.", "category": "Debugging & Errors", "difficulty": "advanced", "humor_level": "high"},
      {"id": 32, "line": "I must be a bug, because I can't stop thinking about you.", "category": "Debugging & Errors", "difficulty": "advanced", "humor_level": "high"},
      {"id": 33, "line": "You're the solution to all my compilation errors.", "category": "Data Structures", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 34, "line": "Are you a stack overflow? Because you've completely taken over my thoughts.", "category": "Data Structures", "difficulty": "advanced", "humor_level": "high"},
      {"id": 35, "line": "My code was broken until you came along.", "category": "Data Structures", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 36, "line": "Are you an array? Because you hold everything I need.", "category": "Data Structures", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 37, "line": "You must be a binary tree, because you make my heart search and sort.", "category": "Data Structures", "difficulty": "advanced", "humor_level": "high"},
      {"id": 38, "line": "Are you a hash map? Because you're the key to my heart.", "category": "Data Structures", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 39, "line": "You're like a perfectly optimized algorithm - efficient and beautiful.", "category": "Data Structures", "difficulty": "advanced", "humor_level": "high"},
      {"id": 40, "line": "Are you a linked list? Because I want to traverse through life with you.", "category": "Data Structures", "difficulty": "advanced", "humor_level": "high"},
      {"id": 41, "line": "You must be a queue, because I've been waiting for you.", "category": "Network & Web", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 42, "line": "Are you a stack? Because you're always on top of my mind.", "category": "Network & Web", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 43, "line": "Are you Wi-Fi? Because I'm feeling a strong connection.", "category": "Network & Web", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 44, "line": "You must be HTTP, because you're the request to my response.", "category": "Network & Web", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 45, "line": "Are you a API? Because I want to interface with you.", "category": "Network & Web", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 46, "line": "Is your name Google? Because you have everything I'm searching for.", "category": "Network & Web", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 47, "line": "You're like HTTPS - secure and always protecting my heart.", "category": "Network & Web", "difficulty": "advanced", "humor_level": "high"},
      {"id": 48, "line": "Are you a server? Because my heart responds to your ping.", "category": "Network & Web", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 49, "line": "You must be a firewall, because you're blocking everyone else out.", "category": "Database", "difficulty": "advanced", "humor_level": "high"},
      {"id": 50, "line": "You're the primary key to my database.", "category": "Database", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 51, "line": "Are you a JOIN statement? Because you complete my query.", "category": "Database", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 52, "line": "You must be a foreign key, because you link to my heart.", "category": "Database", "difficulty": "advanced", "humor_level": "high"},
      {"id": 53, "line": "Are you NULL? Because you complete me.", "category": "Database", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 54, "line": "You're like a well-indexed table - fast and efficient.", "category": "Database", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 55, "line": "Are you a database? Because I want to query you all night.", "category": "Database", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 56, "line": "Are you a class? Because I want to instantiate you.", "category": "Database", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 57, "line": "You're the object of my inheritance.", "category": "Object-Oriented", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 58, "line": "Are you polymorphism? Because you can be anything I need.", "category": "Object-Oriented", "difficulty": "advanced", "humor_level": "high"},
      {"id": 59, "line": "You must be encapsulation, because you hide your beauty so well.", "category": "Object-Oriented", "difficulty": "advanced", "humor_level": "high"},
      {"id": 60, "line": "Are you an interface? Because I want to implement everything about you.", "category": "Object-Oriented", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 61, "line": "You're like a singleton - there's only one of you.", "category": "Object-Oriented", "difficulty": "advanced", "humor_level": "high"},
      {"id": 62, "line": "Are you a microservice? Because you're perfectly designed.", "category": "Object-Oriented", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 63, "line": "You must be Docker, because you containerize my heart.", "category": "Object-Oriented", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 64, "line": "Are you cloud computing? Because you make everything scalable.", "category": "Object-Oriented", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 65, "line": "You're like CI/CD - you make everything smooth and automated.", "category": "Modern Development", "difficulty": "advanced", "humor_level": "high"},
      {"id": 66, "line": "Are you machine learning? Because you're training my heart to love you.", "category": "Modern Development", "difficulty": "advanced", "humor_level": "high"},
      {"id": 67, "line": "You must be blockchain, because our connection is immutable.", "category": "Modern Development", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 68, "line": "Do you believe in love at first byte?", "category": "Modern Development", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 69, "line": "You make my software turn into hardware.", "category": "Modern Development", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 70, "line": "You're hotter than my laptop's CPU.", "category": "Modern Development", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 71, "line": "Are you a password? Because you're exactly what I've been looking for.", "category": "Modern Development", "difficulty": "advanced", "humor_level": "medium"},
      {"id": 72, "line": "You must be root access, because you have complete control over my system.", "category": "Modern Development", "difficulty": "advanced", "humor_level": "high"},
      {"id": 73, "line": "Are you a cache? Because you speed up everything in my life.", "category": "Playful & Cheesy", "difficulty": "advanced", "humor_level": "high"},
      {"id": 74, "line": "You're like a well-commented code - beautiful and easy to understand.", "category": "Playful & Cheesy", "difficulty": "advanced", "humor_level": "high"}
    ];

    // Coding tips
    this.codingTips = [
      "Always comment your code like the person maintaining it is a violent psychopath who knows where you live.",
      "The first computer bug was an actual bug - a moth trapped in a relay in 1947.",
      "There are only 10 types of people in this world - those who understand binary and those who don't.",
      "99 little bugs in the code, 99 bugs in the code, take one down, patch it around, 117 little bugs in the code.",
      "It works on my machine ¯\\_(ツ)_/¯",
      "Debugging is like being the detective in a crime movie where you are also the murderer.",
      "The best error message is the one that never appears.",
      "Writing code without tests is like trying to find your keys in the dark.",
      "Programming is 10% writing code and 90% figuring out why it doesn't work.",
      "A good programmer looks both ways before crossing a one-way street."
    ];

    // App state
    this.currentLine = null;
    this.currentFilter = 'all';
    this.favorites = [];
    this.filteredLines = [...this.pickupLines];
    this.isGenerating = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.populateFilterButtons();
    this.showRandomTip();
    
    // Show random tip every 30 seconds
    setInterval(() => this.showRandomTip(), 30000);
  }

  bindEvents() {
    const generateBtn = document.getElementById('generateBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const copyBtn = document.getElementById('copyBtn');

    generateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.generateLine();
    });
    
    favoriteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleFavorite();
    });
    
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.copyToClipboard();
    });

    // Filter buttons event delegation
    document.getElementById('filterButtons').addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-btn')) {
        e.preventDefault();
        this.setFilter(e.target.dataset.category);
      }
    });

    // Favorites list event delegation
    document.getElementById('favoritesList').addEventListener('click', (e) => {
      if (e.target.classList.contains('favorite-remove') || e.target.closest('.favorite-remove')) {
        e.preventDefault();
        const lineId = parseInt(e.target.closest('.favorite-item').dataset.lineId);
        this.removeFavorite(lineId);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' && !e.target.matches('input, textarea, button')) {
        e.preventDefault();
        this.generateLine();
      } else if (e.key === 'f' && e.ctrlKey && this.currentLine) {
        e.preventDefault();
        this.toggleFavorite();
      } else if (e.key === 'c' && e.ctrlKey && this.currentLine && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.copyToClipboard();
      }
    });
  }

  populateFilterButtons() {
    const filterContainer = document.getElementById('filterButtons');
    const categories = [...new Set(this.pickupLines.map(line => line.category))];
    
    // Clear existing buttons except "All"
    filterContainer.innerHTML = '<button class="filter-btn active" data-category="all">All</button>';
    
    categories.forEach(category => {
      const button = document.createElement('button');
      button.className = 'filter-btn';
      button.dataset.category = category;
      button.textContent = category;
      filterContainer.appendChild(button);
    });
  }

  setFilter(category) {
    this.currentFilter = category;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Filter lines
    if (category === 'all') {
      this.filteredLines = [...this.pickupLines];
    } else {
      this.filteredLines = this.pickupLines.filter(line => line.category === category);
    }
    
    // Clear current line if it doesn't match the new filter
    if (this.currentLine && category !== 'all' && this.currentLine.category !== category) {
      this.currentLine = null;
      this.displayPlaceholder();
      this.updateFavoriteButton();
    }
  }

  generateLine() {
    if (this.isGenerating || this.filteredLines.length === 0) return;

    this.isGenerating = true;
    const generateBtn = document.getElementById('generateBtn');
    const lineContainer = document.querySelector('.line-container');
    
    // Disable button and show loading state
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="generate-icon">⏳</span>Generating...';
    
    // Add loading animation
    lineContainer.style.opacity = '0.5';
    lineContainer.style.transform = 'scale(0.98)';
    
    setTimeout(() => {
      // Select random line from filtered lines
      const randomIndex = Math.floor(Math.random() * this.filteredLines.length);
      this.currentLine = this.filteredLines[randomIndex];
      
      this.displayLine(this.currentLine);
      this.updateFavoriteButton();
      
      // Re-enable button
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<span class="generate-icon">⚡</span>Generate Line';
      
      // Reset animations
      lineContainer.style.opacity = '1';
      lineContainer.style.transform = 'scale(1)';
      
      this.isGenerating = false;
    }, 800);
  }

  displayLine(line) {
    const lineText = document.getElementById('lineText');
    const lineMeta = document.getElementById('lineMeta');
    
    // Clear any existing content
    lineText.innerHTML = '';
    lineMeta.innerHTML = '';
    
    // Set the line text
    lineText.textContent = line.line;
    
    // Set the metadata tags
    lineMeta.innerHTML = `
      <span class="meta-tag meta-tag--category">${line.category}</span>
      <span class="meta-tag meta-tag--difficulty">${line.difficulty}</span>
      <span class="meta-tag meta-tag--humor">${line.humor_level} humor</span>
    `;
    
    // Trigger animation
    lineText.style.animation = 'none';
    lineText.offsetHeight; // Trigger reflow
    lineText.style.animation = 'fadeIn 0.5s ease-in-out';
  }

  displayPlaceholder() {
    const lineText = document.getElementById('lineText');
    const lineMeta = document.getElementById('lineMeta');
    
    lineText.textContent = 'Click "Generate Line" to get your first pickup line!';
    lineMeta.innerHTML = '';
  }

  toggleFavorite() {
    if (!this.currentLine) {
      this.showNotification('Generate a line first!');
      return;
    }
    
    const favoriteBtn = document.getElementById('favoriteBtn');
    const existingIndex = this.favorites.findIndex(fav => fav.id === this.currentLine.id);
    
    if (existingIndex >= 0) {
      this.favorites.splice(existingIndex, 1);
      favoriteBtn.innerHTML = '<span class="heart-icon">♡</span>';
      favoriteBtn.classList.remove('active');
      this.showNotification('Removed from favorites ❤️');
    } else {
      this.favorites.push({...this.currentLine});
      favoriteBtn.innerHTML = '<span class="heart-icon">♥</span>';
      favoriteBtn.classList.add('active');
      this.showNotification('Added to favorites ❤️');
    }
    
    this.updateFavoritesList();
    this.updateFavoritesCount();
  }

  updateFavoriteButton() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    if (!this.currentLine) {
      favoriteBtn.innerHTML = '<span class="heart-icon">♡</span>';
      favoriteBtn.classList.remove('active');
      return;
    }
    
    const isFavorite = this.favorites.some(fav => fav.id === this.currentLine.id);
    
    if (isFavorite) {
      favoriteBtn.innerHTML = '<span class="heart-icon">♥</span>';
      favoriteBtn.classList.add('active');
    } else {
      favoriteBtn.innerHTML = '<span class="heart-icon">♡</span>';
      favoriteBtn.classList.remove('active');
    }
  }

  async copyToClipboard() {
    if (!this.currentLine) {
      this.showNotification('Generate a line first!');
      return;
    }
    
    const copyBtn = document.getElementById('copyBtn');
    const originalContent = copyBtn.innerHTML;
    
    try {
      await navigator.clipboard.writeText(this.currentLine.line);
      
      // Show success state
      copyBtn.innerHTML = '<span class="copy-icon">✅</span>';
      copyBtn.classList.add('copied');
      this.showNotification('Copied to clipboard! 📋');
      
      setTimeout(() => {
        copyBtn.innerHTML = originalContent;
        copyBtn.classList.remove('copied');
      }, 2000);
      
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      try {
        const textarea = document.createElement('textarea');
        textarea.value = this.currentLine.line;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
          copyBtn.innerHTML = '<span class="copy-icon">✅</span>';
          copyBtn.classList.add('copied');
          this.showNotification('Copied to clipboard! 📋');
          
          setTimeout(() => {
            copyBtn.innerHTML = originalContent;
            copyBtn.classList.remove('copied');
          }, 2000);
        } else {
          throw new Error('Copy command failed');
        }
      } catch (fallbackError) {
        this.showNotification('Copy failed. Please select and copy manually.');
      }
    }
  }

  removeFavorite(lineId) {
    this.favorites = this.favorites.filter(fav => fav.id !== lineId);
    this.updateFavoritesList();
    this.updateFavoritesCount();
    this.updateFavoriteButton();
    this.showNotification('Removed from favorites 💔');
  }

  updateFavoritesList() {
    const favoritesList = document.getElementById('favoritesList');
    
    if (this.favorites.length === 0) {
      favoritesList.innerHTML = '<div class="empty-favorites">No favorites yet. Heart some lines to save them here!</div>';
      return;
    }
    
    favoritesList.innerHTML = this.favorites.map(line => `
      <div class="favorite-item" data-line-id="${line.id}">
        <div class="favorite-text">"${line.line}"</div>
        <div class="favorite-category">${line.category}</div>
        <button class="favorite-remove" title="Remove from favorites">×</button>
      </div>
    `).join('');
  }

  updateFavoritesCount() {
    const favoritesCount = document.getElementById('favoritesCount');
    favoritesCount.textContent = this.favorites.length;
  }

  showRandomTip() {
    const tipText = document.getElementById('tipText');
    const randomTip = this.codingTips[Math.floor(Math.random() * this.codingTips.length)];
    tipText.textContent = `💡 Pro tip: ${randomTip}`;
  }

  showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DevPickupLinesApp();
  
  // Add some easter eggs
  console.log('%c💖 Dev Pickup Lines App', 'color: #58a6ff; font-size: 20px; font-weight: bold;');
  console.log('%cMade with ❤️ for developers who code and love', 'color: #8b949e; font-size: 14px;');
  console.log('%cKeyboard shortcuts:', 'color: #e6edf3; font-weight: bold;');
  console.log('%c  Space - Generate new line', 'color: #8b949e;');
  console.log('%c  Ctrl+F - Toggle favorite', 'color: #8b949e;');
  console.log('%c  Ctrl+C - Copy line', 'color: #8b949e;');
});