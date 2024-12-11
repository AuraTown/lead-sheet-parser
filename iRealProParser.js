// iRealProParser.js

class IRealProParser {
  constructor() {
    this.songData = null;
  }

  // Main parsing function that handles both URLs and file content
  parse(input) {
    // Remove URL encoding if present
    const decodedInput = decodeURIComponent(input);
    
    // Check if it's an iReal URL
    if (decodedInput.startsWith('irealb://')) {
      return this.parseURL(decodedInput);
    }
    
    // Assume it's file content
    return this.parseFileContent(decodedInput);
  }

  parseURL(url) {
    // Remove the protocol
    const content = url.replace('irealb://', '');
    
    // Split the content by = and get components
    const [title, composer, style, key, ...rest] = content.split('=');
    
    // The last part contains the chord progression and additional metadata
    const progression = rest.join('=');
    
    return this.parseProgression(title, composer, style, key, progression);
  }

  parseFileContent(content) {
    // Similar to URL parsing but handles file-specific format
    // This would need to be adjusted based on actual file format
    const [title, composer, style, key, progression] = content.split('=');
    return this.parseProgression(title, composer, style, key, progression);
  }

  parseProgression(title, composer, style, key, progression) {
    // Initialize the song structure
    this.songData = {
      title,
      composer,
      style,
      key,
      timeSignature: this.getTimeSignature(style),
      sections: [],
      tempo: 0,
      repeats: 0
    };

    // Split the progression into sections
    const sections = this.splitIntoSections(progression);
    
    // Parse each section
    sections.forEach((section, index) => {
      const sectionName = String.fromCharCode(65 + index); // A, B, C, etc.
      const bars = this.parseBars(section);
      
      this.songData.sections.push({
        name: sectionName,
        bars
      });
    });

    return this.songData;
  }

  getTimeSignature(style) {
    // Map common styles to time signatures
    const timeSignatures = {
      'Waltz': '3/4',
      'Swing': '4/4',
      'Latin': '4/4',
      // Add more style mappings
    };
    return timeSignatures[style] || '4/4';
  }

  splitIntoSections(progression) {
    // Split the progression into sections based on delimiters
    // This is a simplified version - would need to handle all iReal Pro section markers
    return progression.split('|');
  }

  parseBars(section) {
    const bars = [];
    let currentBar = { bar: bars.length + 1, chords: [] };
    let currentBeats = 0;
    
    // Split the section into chord symbols
    const chordSymbols = this.tokenizeChords(section);
    
    chordSymbols.forEach(chord => {
      const chordLength = this.getChordLength(chord);
      
      if (currentBeats + chordLength > this.getBeatsPerBar()) {
        // Start a new bar
        bars.push(currentBar);
        currentBar = { bar: bars.length + 1, chords: [] };
        currentBeats = 0;
      }
      
      currentBar.chords.push({
        chord,
        beats: chordLength
      });
      
      currentBeats += chordLength;
    });
    
    // Add the last bar if it has content
    if (currentBar.chords.length > 0) {
      bars.push(currentBar);
    }
    
    return this.normalizeBarStructure(bars);
  }

  tokenizeChords(section) {
    // Split section into individual chord symbols
    // This would need sophisticated regex to handle all iReal Pro chord symbols
    return section.match(/[A-G][^A-G]*/g) || [];
  }

  getChordLength(chord) {
    // Determine the length of the chord based on symbols
    // This is a simplified version - would need to handle all iReal Pro duration markers
    if (chord.includes('h')) return 2;
    if (chord.includes('q')) return 1;
    return this.getBeatsPerBar();
  }

  getBeatsPerBar() {
    // Get beats per bar based on time signature
    const [beats] = this.songData.timeSignature.split('/').map(Number);
    return beats;
  }

  normalizeBarStructure(bars) {
    // Convert bars with single chord to simpler structure
    return bars.map(bar => {
      if (bar.chords.length === 1) {
        return {
          bar: bar.bar,
          chord: bar.chords[0].chord,
          beats: bar.chords[0].beats
        };
      }
      return bar;
    });
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IRealProParser;
} else {
  window.IRealProParser = IRealProParser;
}
