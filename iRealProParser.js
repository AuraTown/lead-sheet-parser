// iRealProParser.js

class IRealProParser {
  constructor() {
    this.SONG_SEPARATOR = '==';
  }

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
    const content = url.replace('irealb://', '');
    
    // Check if it's a playlist (multiple songs)
    if (content.includes(this.SONG_SEPARATOR + this.SONG_SEPARATOR)) {
      return this.parsePlaylist(content);
    }
    
    return this.parseSong(content);
  }

  parsePlaylist(content) {
    // Split content into individual songs
    const songs = content.split(this.SONG_SEPARATOR + this.SONG_SEPARATOR)
      .filter(song => song.trim().length > 0);

    return {
      type: 'playlist',
      songs: songs.map(song => this.parseSong(song + this.SONG_SEPARATOR))
    };
  }

  parseSong(content) {
    // Split the content by = and get components
    const parts = content.split('=');
    
    // Basic song info is always in the same positions
    const [title, composer, unused, style, key, ...rest] = parts;
    
    // The last parts contain progression and additional metadata
    const progression = rest.join('=');
    
    // Parse the chord progression into measures
    const measures = this.parseProgression(progression);

    return {
      type: 'song',
      title: this.cleanText(title),
      composer: this.cleanText(composer),
      style: this.cleanText(style),
      key: this.cleanKey(key),
      timeSignature: this.getTimeSignature(style),
      measures,
      tempo: this.extractTempo(rest),
      repeats: this.extractRepeats(rest)
    };
  }

  cleanText(text) {
    return text.replace(/\+/g, ' ')
      .replace(/%20/g, ' ')
      .replace(/%23/g, '#')
      .replace(/%2D/g, '-')
      .trim();
  }

  cleanKey(key) {
    return key.replace(/\^/g, 'maj')
      .replace(/h/g, 'm7b5')
      .replace(/o/g, 'dim');
  }

  parseProgression(progression) {
    // Remove iReal markup
    const cleaned = progression.replace(/\{.*?\}/g, '')  // Remove comments/annotations
      .replace(/\[.*?\]/g, '')  // Remove section markers
      .replace(/[lnpsx]/g, '')  // Remove special characters
      .replace(/Y/g, '')        // Remove placeholder
      .replace(/XyQ/g, '');     // Remove end markers

    // Split into measures
    const measures = cleaned.split('|')
      .filter(measure => measure.trim().length > 0)
      .map(measure => this.parseMeasure(measure));

    return measures;
  }

  parseMeasure(measure) {
    const chords = [];
    let currentChord = '';
    let duration = 1;  // Default duration (whole measure)

    // Parse each character
    for (let char of measure) {
      if (this.isChordChar(char)) {
        if (currentChord) {
          chords.push({ chord: currentChord, duration });
          currentChord = '';
        }
        currentChord = char;
      } else {
        currentChord += char;
      }
    }

    // Add the last chord if exists
    if (currentChord) {
      chords.push({ chord: currentChord, duration });
    }

    return {
      chords: chords.map(chord => ({
        ...chord,
        chord: this.cleanChord(chord.chord)
      }))
    };
  }

  isChordChar(char) {
    return /[A-G]/.test(char);
  }

  cleanChord(chord) {
    return chord
      .replace(/h/g, 'm7b5')
      .replace(/o/g, 'dim')
      .replace(/\^/g, 'maj')
      .trim();
  }

  getTimeSignature(style) {
    const timeSignatures = {
      'Waltz': '3/4',
      'Jazz Waltz': '3/4',
      'Bossa Nova': '4/4',
      'Samba': '4/4',
      'Swing': '4/4',
      'Latin': '4/4',
      'Ballad': '4/4',
      'Medium Swing': '4/4',
      'Choro': '2/4'
    };
    return timeSignatures[style] || '4/4';
  }

  extractTempo(metadata) {
    const tempoMatch = metadata.join('=').match(/=(\d+)=/);
    return tempoMatch ? parseInt(tempoMatch[1]) : 0;
  }

  extractRepeats(metadata) {
    const repeatMatch = metadata.join('=').match(/=(\d+)=$/);
    return repeatMatch ? parseInt(repeatMatch[1]) : 0;
  }
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IRealProParser;
} else {
  window.IRealProParser = IRealProParser;
}
