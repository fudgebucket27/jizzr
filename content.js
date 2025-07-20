// Content script for Jizzr extension
class WordReplacer {
  constructor() {
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

    this.wordList = [];
    this.isEnabled = true;
    this.replacedNodes = new Map(); // Track replaced nodes and their original content
    this.init();
  }

  async init() {
    await this.loadSettings();
    if (this.isEnabled) {
      this.replaceWords();
      this.observeChanges();
    }
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    
    if (this.isEnabled) {
      this.replaceWords();
      this.observeChanges();
    } else if (this.observer) {
      // Disconnect the observer if it exists and we're disabling
      this.observer.disconnect();
      this.observer = null;
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['wordList', 'isEnabled']);
      this.wordList = result.wordList || this.defaultWordList;
      this.isEnabled = result.isEnabled !== false; // Default to true
    } catch (error) {
      console.log('Using default word list');
      this.wordList = this.defaultWordList;
    }
  }

  replaceWords() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script and style elements
          const parent = node.parentElement;
          if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      const originalText = textNode.textContent;
      let text = originalText;
      let modified = false;
      let matchedWords = []; // Track which words matched this node

      this.wordList.forEach(word => {
        const regex = new RegExp(word, 'gi');
        if (regex.test(text)) {
          text = text.replace(regex, 'jizz');
          modified = true;
          matchedWords.push(word);
        }
      });

      if (modified) {
        // Store the original content and which words matched it
        if (!this.replacedNodes.has(textNode)) {
          this.replacedNodes.set(textNode, {
            originalContent: originalText,
            matchedWords: matchedWords
          });
        } else {
          // Update matched words if the node was already processed
          const nodeInfo = this.replacedNodes.get(textNode);
          nodeInfo.matchedWords = [...new Set([...nodeInfo.matchedWords, ...matchedWords])];
        }
        
        textNode.textContent = text;
      }
    });
  }

  // Restore original text for words that were removed from the word list
  updateRemovedWords(oldWordList, newWordList) {
    // Find words that were removed
    const removedWords = oldWordList.filter(word => !newWordList.includes(word));
    
    if (removedWords.length === 0) {
      return; // No words were removed, nothing to restore
    }
    
    // Go through all tracked nodes and restore text for nodes that only matched removed words
    this.replacedNodes.forEach((info, node) => {
      // Check if this node's matches include any of the removed words
      const matchedRemovedWords = info.matchedWords.filter(word => removedWords.includes(word));
      
      if (matchedRemovedWords.length > 0) {
        // Get remaining matched words that are still in the list
        const remainingMatches = info.matchedWords.filter(word => newWordList.includes(word));
        
        if (remainingMatches.length === 0) {
          // If no remaining matches, restore the original content
          node.textContent = info.originalContent;
          // Remove this node from tracking since it's back to original
          this.replacedNodes.delete(node);
        } else {
          // If some words still match, we need to re-process this node
          let text = info.originalContent;
          
          // Apply only the remaining words
          remainingMatches.forEach(word => {
            const regex = new RegExp(word, 'gi');
            text = text.replace(regex, 'jizz');
          });
          
          // Update the node with selectively replaced text
          node.textContent = text;
          
          // Update tracking info to only include remaining words
          info.matchedWords = remainingMatches;
        }
      }
    });
  }

  observeChanges() {
    // If there's already an observer, don't create another one
    if (this.observer) {
      return;
    }
    
    this.observer = new MutationObserver((mutations) => {
      let shouldReplace = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE || 
                (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE')) {
              shouldReplace = true;
            }
          });
        }
      });

      if (shouldReplace && this.isEnabled) {
        // Debounce the replacement to avoid excessive processing
        clearTimeout(this.replaceTimeout);
        this.replaceTimeout = setTimeout(() => {
          this.replaceWords();
        }, 100);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    const wasEnabled = wordReplacer.isEnabled;
    const willBeEnabled = request.isEnabled;
    const oldWordList = [...wordReplacer.wordList];
    const newWordList = request.wordList;
    const wordListChanged = JSON.stringify(oldWordList) !== JSON.stringify(newWordList);
    
    // If turning off, disconnect observer and reload
    if (wasEnabled && !willBeEnabled) {
      wordReplacer.setEnabled(false);
      // Let the popup know we're about to reload
      sendResponse({success: true, reloading: true});
      // Slight delay to ensure the response is sent before reloading
      setTimeout(() => {
        location.reload();
      }, 100);
      return true;
    }
    
    // Handle word list changes
    if (wordListChanged) {
      // First, update the word list
      wordReplacer.wordList = newWordList;
      
      // If enabled, handle intelligent word updates
      if (willBeEnabled) {
        // First check for words that were removed and need to be restored
        wordReplacer.updateRemovedWords(oldWordList, newWordList);
        
        // Then process any words that were added
        const addedWords = newWordList.filter(word => !oldWordList.includes(word));
        if (addedWords.length > 0) {
          // Re-run replacements since there are new words
          wordReplacer.replaceWords();
        }
        
        sendResponse({success: true, refreshed: true});
      } else {
        sendResponse({success: true});
      }
    } else {
      // Just update the enabled state if no word list changes
      wordReplacer.setEnabled(willBeEnabled);
      sendResponse({success: true});
    }
    
    return true; // Keep the message channel open for async response
  } else if (request.action === 'replaceNow') {
    if (wordReplacer.isEnabled) {
      wordReplacer.replaceWords();
    }
    sendResponse({success: true});
  }
});

// Initialize the word replacer
const wordReplacer = new WordReplacer();
