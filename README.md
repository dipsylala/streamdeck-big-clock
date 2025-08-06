# StreamDeck Big Clock Plugin

A StreamDeck plugin that displays individual time components (hours, minutes, seconds, colons) on separate buttons, allowing you to create custom large digital clock layouts on your Stream Deck with perfect synchronization and smooth animations.

This was a coding exercise based on Reddit thread https://www.reddit.com/r/elgato/comments/1mi0s6z/finally_got_the_time_separated_by_digit_onto/

Total kudos to https://www.reddit.com/user/mathewharwich/ for the idea.

## Features

![Examples of how to use the plugin](img/examples.png)

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
  - Colon (:) - Blinking separator between minutes and seconds

- **AM/PM Indicators**: Show time period indicators (only for 12-hour format)
  - AM/PM - Shows "AM" or "PM" based on current time
  - AM Only - Shows "AM" only during morning hours (00:00-11:59), blank during PM
  - PM Only - Shows "PM" only during afternoon/evening hours (12:00-23:59), blank during AM

### Customization Options
- **Time Component**: Select which part of the time to display from dropdown (including AM/PM options)
- **Time Format**: Choose between 12-hour and 24-hour format (AM/PM indicators only show in 12-hour format)
- **Colon Blinking**: Enable/disable smooth colon blinking animation (500ms intervals)
- **Text Color**: Customize the color of digits, colons, and AM/PM indicators with color picker
- **Background Color**: Customize the button background color with color picker
- **Font Size**: Adjust text size with slider (20-144px range, default: 96px)
- **Font Family**: Choose from multiple font options (Arial, Helvetica, Georgia, etc.) color picker
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

To create a large digital clock display across multiple Stream Deck buttons, you can arrange them in various layouts:

### Basic 8-Button Layout (HH:MM:SS)
Arrange buttons in a 7x1 grid:
```
[1] [2] [:] [3] [4] [:] [5] [6]
```

### Extended 9-Button Layout with AM/PM (12-hour format)
Arrange buttons in a 8x1 grid:
```
[1] [2] [:] [3] [4] [:] [5] [6] [AM/PM]
```

### Dual-Row Compact Layout
Arrange buttons in a 4x2 grid:
```
[1] [2] [:] [AM/PM]
[3] [4] [:] [5] [6]
```

Where each button is configured as:
- Button 1: Hour (First Digit)
- Button 2: Hour (Second Digit)  
- Button 3: Colon
- Button 4: Minute (First Digit)
- Button 5: Minute (Second Digit)
- Button 6: Colon
- Button 7: Second (First Digit)
- Button 8: Second (Second Digit)
- Button 9 (optional): AM/PM Indicator

**Example displays:**
- 12-hour format: `1 2 : 3 4 : 5 6 PM` for 12:34:56 PM
- 24-hour format: `1 2 : 3 4 : 5 6` for 12:34:56 (no AM/PM needed)

### Advanced Layouts

**Conditional AM/PM Display:**
- Use "AM Only" button that shows "AM" only during morning hours
- Use "PM Only" button that shows "PM" only during afternoon/evening hours  
- Useful for creating layouts where you want separate AM/PM buttons that activate contextually

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

### Development Setup

#### First Time Setup
After building the plugin, you need to link it to StreamDeck:
```bash
# Link the plugin to StreamDeck (first time only)
npx streamdeck link "com.github.dipsylala.big-clock.sdPlugin"
```

#### Development with Hot Reload
```bash
npm run watch
```

The watch command will automatically rebuild the plugin and restart it in StreamDeck when files change.

#### Useful Development Commands
```bash
# Check if plugin is linked
npx streamdeck list

# Manually restart the plugin
npx streamdeck restart com.github.dipsylala.big-clock

# Complete plugin refresh (if experiencing issues)
npx streamdeck stop com.github.dipsylala.big-clock
npx streamdeck unlink com.github.dipsylala.big-clock
npx streamdeck link "com.github.dipsylala.big-clock.sdPlugin"

# Unlink the plugin (if needed)
npx streamdeck unlink com.github.dipsylala.big-clock

# Enable developer mode (shows debug info)
npx streamdeck dev

# Validate plugin structure
npx streamdeck validate
```

#### Troubleshooting
If you experience display flashing when moving buttons:
1. **Complete plugin refresh**: Stop, unlink, and relink the plugin (see commands above)
2. **Check for multiple instances**: Ensure only one instance of each time component is active
3. **Restart StreamDeck software**: Close and reopen the StreamDeck application if issues persist
4. **Clear browser cache**: If using property inspector, clear browser cache in StreamDeck settings
5. **Enable developer mode**: Run `npx streamdeck dev` to see detailed debug logs in StreamDeck console

#### Advanced Troubleshooting
For persistent multiple timer issues:
```bash
# Nuclear option: Complete reset
npx streamdeck stop com.github.dipsylala.big-clock
npx streamdeck unlink com.github.dipsylala.big-clock
# Close and reopen StreamDeck software completely
npx streamdeck link "com.github.dipsylala.big-clock.sdPlugin"
```

#### Development Workflow
1. **First time setup**: `npx streamdeck link "com.github.dipsylala.big-clock.sdPlugin"`
2. **Development**: `npm run watch` (builds and auto-restarts on changes)
3. **Manual restart**: `npx streamdeck restart com.github.dipsylala.big-clock` (if needed)

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

### v1.0.1 (Current)
- ✅ **NEW: AM/PM Indicators** - Added three new time component options:
  - AM/PM - Shows current time period indicator (AM or PM)
  - AM Only - Shows "AM" only during morning hours, blank during PM hours
  - PM Only - Shows "PM" only during afternoon/evening hours, blank during AM hours
- ✅ Smart 24-hour format handling - AM/PM indicators automatically hidden in 24-hour format
- ✅ Enhanced layout flexibility for 12-hour format displays

### v1.0.0
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
