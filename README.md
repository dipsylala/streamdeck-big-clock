# StreamDeck Big Clock Plugin

A StreamDeck plugin that displays individual time components (hours, minutes, seconds, colons) on separate buttons, allowing you to create custom large digital clock layouts on your Stream Deck with perfect synchronization and smooth animations.

## Features

### Time Component Action
Display individual components of the current time that update in real-time with perfect synchronization across all buttons:

- **Individual Digits**: Show single digits from hours, minutes, or seconds
  - Hour (First Digit) - Shows the first digit of the hour (e.g., "1" from "12:34:56")
  - Hour (Second Digit) - Shows the second digit of the hour (e.g., "2" from "12:34:56")
  - Minute (First Digit) - Shows the first digit of the minute (e.g., "3" from "12:34:56")
  - Minute (Second Digit) - Shows the second digit of the minute (e.g., "4" from "12:34:56")
  - Second (First Digit) - Shows the first digit of the second (e.g., "5" from "12:34:56")
  - Second (Second Digit) - Shows the second digit of the second (e.g., "6" from "12:34:56")

- **Full Components**: Show complete time units
  - Hour (Full) - Shows the complete hour (e.g., "12" from "12:34:56")
  - Minute (Full) - Shows the complete minute (e.g., "34" from "12:34:56")
  - Second (Full) - Shows the complete second (e.g., "56" from "12:34:56")

- **Separators**: Show colon separators with smooth blinking animation
  - Colon (:) Hours/Minutes - Blinking separator between hours and minutes
  - Colon (:) Minutes/Seconds - Blinking separator between minutes and seconds

### Customization Options
- **Time Component**: Select which part of the time to display from dropdown
- **Time Format**: Choose between 12-hour and 24-hour format
- **Colon Blinking**: Enable/disable smooth colon blinking animation (500ms intervals)
- **Text Color**: Customize the color of digits and colons with color picker
- **Background Color**: Customize the button background color with color picker
- **Font Size**: Adjust text size with slider (20-144px range, default: 96px)
- **Font Family**: Choose from multiple font options (Arial, Helvetica, Georgia, etc.)

### Technical Features
- **Synchronized Timer System**: Single global timer ensures all buttons update simultaneously
- **Smooth Colon Animation**: Colons blink every 500ms for authentic digital clock feel
- **Performance Optimized**: Cached settings system with minimal API calls
- **Drag & Drop Resilient**: Timer continues running when moving buttons around
- **SVG Rendering**: Crisp, scalable graphics rendered directly on button canvas
- **Real-time Updates**: Display updates every second with perfect synchronization
- **Settings Persistence**: All customizations are saved and restored automatically

## Example Usage

To create a large digital clock display across 8 Stream Deck buttons, arrange them in a 8x1 grid and configure each button as follows:

```
[1] [2] [:] [3] [4] [:] [5] [6]
```

Where:
- Button 1: Hour (First Digit)
- Button 2: Hour (Second Digit)  
- Button 3: Colon
- Button 4: Minute (First Digit)
- Button 5: Minute (Second Digit)
- Button 6: Colon
- Button 7: Second (First Digit)
- Button 8: Second (Second Digit)

This would display something like: `1 2 : 3 4 : 5 6` for the time 12:34:56

## Development

### Prerequisites
- Node.js 18+ 
- StreamDeck Software 6.5+
- TypeScript knowledge for modifications

### Building from Source
```bash
# Clone the repository
git clone https://github.com/dipsylala/streamdeck-big-clock.git
cd streamdeck-big-clock

# Install dependencies
npm install

# Build the plugin
npm run build
```

### Development with Hot Reload
```bash
npm run watch
```

The watch command will automatically rebuild the plugin and restart it in StreamDeck when files change.

### Project Structure
```
streamdeck-big-clock/
├── src/
│   ├── actions/
│   │   └── time-component.ts    # Main plugin logic with synchronized timer
│   └── plugin.ts                # Plugin entry point
├── com.github.dipsylala.big-clock.sdPlugin/
│   ├── manifest.json           # Plugin configuration
│   ├── ui/
│   │   ├── time-component.html # Property Inspector with SDPI components
│   │   └── time-component.css  # Property Inspector styling
│   └── imgs/                   # Plugin icons and assets
├── package.json                # Node.js dependencies and scripts
├── rollup.config.js           # Build configuration
└── tsconfig.json              # TypeScript configuration
```

## Installation

### From Releases (Recommended)
1. Download the latest `.streamDeckPlugin` file from [Releases](https://github.com/dipsylala/streamdeck-big-clock/releases)
2. Double-click the file to install automatically
3. The plugin will appear in StreamDeck under "BigTime" category

### Manual Installation
1. Build from source (see Development section above)
2. Copy the `com.github.dipsylala.big-clock.sdPlugin` folder to your StreamDeck plugins directory:
   - **Windows**: `%appdata%\Elgato\StreamDeck\Plugins\`
   - **macOS**: `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`

## Contributing

1. Fork the repository on GitHub
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript typing
4. Test thoroughly with different StreamDeck configurations
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request with detailed description

## Support & Issues

- **Bug Reports**: Use [GitHub Issues](https://github.com/dipsylala/streamdeck-big-clock/issues) with detailed reproduction steps
- **Feature Requests**: Open an issue with the "enhancement" label
- **Questions**: Check existing issues or start a discussion

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0 (Current)
- ✅ Individual time component display with full customization
- ✅ Synchronized global timer system for perfect synchronization  
- ✅ Smooth colon blinking animation (500ms intervals)
- ✅ Performance optimized with settings caching
- ✅ Drag & drop resilient timer system
- ✅ Official SDPI components for Property Inspector
- ✅ Support for 12/24 hour formats
- ✅ Full color and font customization
- ✅ SVG-based crisp rendering

---

🕐 **Create your perfect digital clock layout with StreamDeck Big Clock!**

Legacy Actions

### Counter Action
The original counter action is still available for backwards compatibility. It displays a count that increments by one each time the button is pressed.
