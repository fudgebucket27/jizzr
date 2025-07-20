// Popup script for Jizzr extension
class PopupManager {
  constructor() {
    this.wordList = [];
    this.isEnabled = true;
this.defaultWordList = [
    'liquid','fluid','water','seawater','rainwater','distilled water','spring water','mineral water','ice water',
    'juice','orange juice','apple juice','grape juice','pineapple juice','cranberry juice','tomato juice','carrot juice','vegetable juice','pomegranate juice',
    'lemonade','limeade','fruit punch','smoothie','milkshake','iced tea','tea','green tea','black tea','herbal tea','chai',
    'coffee','espresso','americano','latte','cappuccino','mocha','hot chocolate','cocoa','matcha',
    'soda','cola','ginger ale','root beer','tonic water','club soda','sparkling water','energy drink','sports drink',
    'milk','whole milk','skim milk','goat milk','buttermilk','evaporated milk','condensed milk','cream','heavy cream','light cream','half and half',
    'whipping cream','sour cream','yogurt drink','kefir','whey','lactose free milk','almond milk','soy milk','oat milk','rice milk','coconut milk','cashew milk',
    'beer','lager','ale','stout','porter','cider','wine','red wine','white wine','rosé wine','sparkling wine','champagne','mead',
    'sake','soju','vodka','gin','rum','whisky','whiskey','scotch','bourbon','tequila','brandy','cognac','liqueur','absinthe','vermouth',
    'cocktail','martini','margarita','bloody mary','old fashioned','negroni','spritz',
    'broth','chicken broth','beef broth','vegetable broth','stock','bone broth','consomme',
    'soup','stew','gravy','sauce','tomato sauce','marinara','pizza sauce','soy sauce','fish sauce','oyster sauce','worcestershire sauce',
    'barbecue sauce','hot sauce','chili sauce','salsa','pesto','curry sauce','teriyaki sauce','satay sauce','hoisin sauce',
    'vinaigrette','salad dressing','mayonnaise','aioli','ketchup','mustard','hollandaise','bechamel','veloute','demi glace',
    'syrup','maple syrup','simple syrup','corn syrup','golden syrup','molasses','treacle','honey','agave nectar','date syrup','caramel sauce','chocolate syrup',
    'oil','vegetable oil','olive oil','extra virgin olive oil','canola oil','sunflower oil','peanut oil','sesame oil','coconut oil','palm oil',
    'corn oil','avocado oil','grapeseed oil','soybean oil','walnut oil','flaxseed oil','linseed oil','mustard oil','ghee','butter',
    'tahini','liquid smoke','miso','mirin','rice vinegar','vinegar','white vinegar','apple cider vinegar','balsamic vinegar','malt vinegar',
    'custard','egg wash','glaze','icing','whipped cream','sugar syrup',
    'brine','pickle juice','fermented brine','marinade','drippings','reduction',
    'blood','plasma','serum','saliva','sweat','urine','bile','gastric juice','lymph','cerebrospinal fluid','tears','amniotic fluid','synovial fluid',
    'detergent','bleach solution','fabric softener','dish soap','hand soap','shampoo','conditioner','mouthwash','hand sanitizer','ink','printer ink',
    'lotion','toner','perfume','aftershave','nail polish remover','makeup remover',
    'gasoline','petrol','diesel','biodiesel','kerosene','jet fuel','aviation gasoline','fuel oil','motor oil','engine oil','transmission fluid','brake fluid',
    'power steering fluid','coolant','antifreeze','windshield washer fluid','gear oil','hydraulic fluid','lubricant','grease',
    'solvent','acetone','isopropanol','isopropyl alcohol','ethanol','methanol','propanol','butanol','glycerol','glycerin','propylene glycol','ethylene glycol',
    'formaldehyde solution','acetic acid','citric acid solution','hydrochloric acid','sulfuric acid','nitric acid','phosphoric acid','ammonia solution','bleach',
    'sodium hypochlorite solution','hydrogen peroxide','developer solution','photo fixer','brake cleaner',
    'latex','resin','epoxy','polyurethane resin','acrylic monomer','silicone oil','mineral oil','paraffin oil',
    'fertilizer solution','pesticide solution','herbicide solution','insecticide solution','nutrient solution','hydroponic solution',
    'crude oil','light crude','heavy crude','naphtha','bitumen','tar','asphalt','transformer oil',
    'liquid nitrogen','liquid oxygen','liquid helium','liquid hydrogen','liquid argon','liquid carbon dioxide',
    'molten iron','molten steel','molten aluminum','molten copper','molten lead','molten zinc','molten tin','molten gold','molten silver','molten sodium','molten sulfur','molten glass',
    'saline','electrolyte solution','battery acid','mercury','gallium','bromine',
    'paint','latex paint','enamel paint','varnish','wood stain','sealant','primer','fountain pen ink',
    'kombucha','ginger beer','kvass','yerba mate','bubble tea','protein shake',
    'oral rehydration solution','electrolyte drink','cough syrup','tincture',
    'sap','resin','lava','magma','mud','slurry','sludge',
    'cooling liquid','heat transfer fluid','dielectric fluid','liquid crystal','liquid metal','solder','flux',
    'fog juice','bubble solution','slime','ink wash'
    ];

    this.initElements();
    this.loadSettings();
    this.bindEvents();
  }

  initElements() {
    this.enableToggle = document.getElementById('enableToggle');
    this.addWordBtn = document.getElementById('addWordBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.replaceNowBtn = document.getElementById('replaceNowBtn');
    this.dictionaryContainer = document.getElementById('dictionaryContainer');
    this.statusMessage = document.getElementById('statusMessage');
    this.searchInput = document.getElementById('searchInput');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['wordList', 'isEnabled']);
      this.wordList = result.wordList || this.defaultWordList;
      this.isEnabled = result.isEnabled !== false;
      
      this.updateToggleState();
      this.renderWordList();
    } catch (error) {
      console.error('Error loading settings:', error);
      this.wordList = this.defaultWordList;
      this.renderWordList();
    }
  }

  bindEvents() {
    this.enableToggle.addEventListener('click', () => {
      this.isEnabled = !this.isEnabled;
      this.updateToggleState();
      this.saveSettings(); // Save immediately when toggle is clicked
    });

    this.addWordBtn.addEventListener('click', () => {
      this.addWord('');
    });

    this.saveBtn.addEventListener('click', () => {
      this.saveSettings();
    });

    this.resetBtn.addEventListener('click', () => {
      this.resetToDefault();
    });

    this.replaceNowBtn.addEventListener('click', () => {
      this.replaceWordsNow();
    });
    
    this.searchInput.addEventListener('input', () => {
      this.filterWordList();
    });
  }

  updateToggleState() {
    if (this.isEnabled) {
      this.enableToggle.classList.add('active');
    } else {
      this.enableToggle.classList.remove('active');
    }
  }
  
  filterWordList() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    const wordPairs = this.dictionaryContainer.querySelectorAll('.word-pair');
    
    wordPairs.forEach(wordPair => {
      const input = wordPair.querySelector('.original-word');
      const word = input.value.toLowerCase();
      
      if (searchTerm === '' || word.includes(searchTerm)) {
        wordPair.style.display = 'flex';
      } else {
        wordPair.style.display = 'none';
      }
    });
  }

  renderWordList() {
    this.dictionaryContainer.innerHTML = '';
    
    // Render in reverse order so that first words appear at the top
    for (let i = this.wordList.length - 1; i >= 0; i--) {
      this.addWord(this.wordList[i]);
    }
  }

  addWord(word = '') {
    const wordPair = document.createElement('div');
    wordPair.className = 'word-pair';
    
    wordPair.innerHTML = `
      <input type="text" class="original-word" value="${word}" placeholder="Word to replace">
      <button class="remove-btn" title="Remove word">×</button>
    `;

    // Add remove functionality
    const removeBtn = wordPair.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
      wordPair.remove();
    });

    // Insert at the top of the container
    if (this.dictionaryContainer.firstChild) {
      this.dictionaryContainer.insertBefore(wordPair, this.dictionaryContainer.firstChild);
    } else {
      this.dictionaryContainer.appendChild(wordPair);
    }
  }

  collectWordList() {
    const wordList = [];
    const wordPairs = this.dictionaryContainer.querySelectorAll('.word-pair');
    
    wordPairs.forEach(pair => {
      const word = pair.querySelector('.original-word').value.trim().toLowerCase();
      
      if (word) {
        wordList.push(word);
      }
    });

    return wordList;
  }

  async saveSettings() {
    try {
      const oldWordList = [...this.wordList]; // Save old list for comparison
      this.wordList = this.collectWordList();
      const wordListChanged = JSON.stringify(oldWordList) !== JSON.stringify(this.wordList);
      
      await chrome.storage.sync.set({
        wordList: this.wordList,
        isEnabled: this.isEnabled
      });

      // Notify content script of changes
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          wordList: this.wordList,
          isEnabled: this.isEnabled
        }, (response) => {
          if (response && response.reloading) {
            if (!this.isEnabled) {
              this.showStatus('Reloading page to restore original content...', 'success');
            } else if (wordListChanged) {
              this.showStatus('Updating page with new word list...', 'success');
            } else {
              this.showStatus('Settings saved successfully!', 'success');
            }
          } else if (response && response.refreshed) {
            // This is the case where intelligent word updates happened without reloading
            this.showStatus('Words updated without reloading!', 'success');
          } else {
            this.showStatus('Settings saved successfully!', 'success');
          }
        });
      } else {
        this.showStatus('Settings saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showStatus('Error saving settings', 'error');
    }
  }

  async resetToDefault() {
    const oldWordList = [...this.wordList]; // Save old list for comparison
    this.wordList = [...this.defaultWordList];
    this.isEnabled = true;
    
    this.updateToggleState();
    this.renderWordList();
    
    await chrome.storage.sync.set({
      wordList: this.wordList,
      isEnabled: this.isEnabled
    });

    // Notify content script of changes
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateSettings',
        wordList: this.wordList,
        isEnabled: this.isEnabled
      }, (response) => {
        if (response && response.reloading) {
          this.showStatus('Resetting to default words and refreshing page...', 'success');
        } else {
          this.showStatus('Reset to default settings', 'success');
        }
      });
    } else {
      this.showStatus('Reset to default settings', 'success');
    }
  }

  async replaceWordsNow() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'replaceNow'
        });
        this.showStatus('Words replaced on current page!', 'success');
      }
    } catch (error) {
      console.error('Error replacing words:', error);
      this.showStatus('Error replacing words', 'error');
    }
  }

  showStatus(message, type = 'success') {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message status-${type}`;
    
    setTimeout(() => {
      this.statusMessage.textContent = '';
      this.statusMessage.className = '';
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});
