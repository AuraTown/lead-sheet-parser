# lead-sheet-parser

A lightweight JavaScript library for parsing iReal Pro URLs and files into structured JSON format. Made with ♥ by [Aura.town](https://aura.town)

## Features

- Parse iReal Pro URLs and file content
- Convert complex chord progressions into structured JSON
- Support for multiple sections (A, B, C parts)
- Automatic time signature detection based on style
- Proper handling of bar timings and chord durations
- Browser and Node.js compatible

## Installation

NOT YET - WIP
```bash
npm install lead-sheet-parser
```

## Quick Start

```javascript
const IRealProParser = require('ireal-pro-parser');

// Create a new parser instance
const parser = new IRealProParser();

// Parse an iReal Pro URL
const song = parser.parse('irealb://A%20Taste%20Of%20Honey=Marlow%2DScott==Waltz=D%2D==...');

console.log(song);
```

## Output Format

The parser generates structured JSON that clearly represents the song's structure:

```javascript
{
  "title": "A Taste Of Honey",
  "composer": "Marlow-Scott",
  "style": "Waltz",
  "key": "D-",
  "timeSignature": "3/4",
  "sections": [
    {
      "name": "A",
      "bars": [
        { "bar": 1, "chord": "D-", "beats": 3 },
        { "bar": 2, "chords": [
          { "chord": "Q4D-", "beats": 1.5 },
          { "chord": "XyD", "beats": 1.5 }
        ]},
        // ... more bars
      ]
    },
    // ... more sections
  ],
  "tempo": 0,
  "repeats": 0
}
```

## API Reference

### `IRealProParser`

#### `parse(input: string)`
Main method to parse both URLs and file content.

```javascript
const result = parser.parse('irealb://...');
```

#### `parseURL(url: string)`
Specifically parse iReal Pro URLs.

```javascript
const result = parser.parseURL('irealb://...');
```

#### `parseFileContent(content: string)`
Parse raw iReal Pro file content.

```javascript
const result = parser.parseFileContent('Song Title=Composer=...');
```

## Advanced Usage

### Handling Different Time Signatures

The parser automatically detects time signatures based on style:

```javascript
const waltzSong = parser.parse('irealb://MySong==Waltz...'); // 3/4
const swingSong = parser.parse('irealb://MySong==Swing...'); // 4/4
```

### Working with Sections

Each song can contain multiple sections (A, B, C parts):

```javascript
const song = parser.parse('irealb://...');
const sectionA = song.sections[0];
const sectionBBars = song.sections[1].bars;
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this in your own projects!

## Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/ireal-pro-parser/issues)
- Email: support@aura.town

## Acknowledgments

- Thanks to the iReal Pro team for their amazing app
- All contributors and users of this library

---

Made with ♥ by [Aura.town](https://aura.town)
