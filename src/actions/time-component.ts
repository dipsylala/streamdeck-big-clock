import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent, SendToPluginEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

/**
 * An action that displays individual components of the current time (hours, minutes, seconds, or separators).
 */
@action({ UUID: "com.github.dipsylala.big-clock.time-component" })
export class TimeComponent extends SingletonAction<TimeComponentSettings> {
	private static globalTimer: NodeJS.Timeout | null = null;
	private static activeActions = new Map<string, { action: any, settings: TimeComponentSettings }>();

	/**
	 * Called when the action becomes visible. Sets up the timer and initial display.
	 */
	override async onWillAppear(ev: WillAppearEvent<TimeComponentSettings>): Promise<void> {
		const settings = ev.payload.settings;
		settings.component ??= "hour1";
		settings.format24Hour ??= false;
		settings.blinkColons ??= true;
		settings.textColor ??= "#FFFFFF";
		settings.backgroundColor ??= "#000000";
		settings.fontSize ??= 96;
		settings.fontFamily ??= "Arial";

		// Save the updated settings
		await ev.action.setSettings(settings);

		// Add this action to the global set with its settings using action ID as key
		const actionKey = ev.action.id;
		TimeComponent.activeActions.set(actionKey, { action: ev.action, settings });
		streamDeck.logger.info(`Action added with key ${actionKey}, ${TimeComponent.activeActions.size} total actions`);

		// Update the display immediately
		await this.updateDisplay(ev.action, settings);

		// Set up global synchronized timer if not already running
		this.setupGlobalTimer();
	}

	/**
	 * Called when the action becomes invisible. Cleans up the timer.
	 */
	override onWillDisappear(ev: WillDisappearEvent<TimeComponentSettings>): void {
		// Remove this action from the global set using action ID as key
		const actionKey = ev.action.id;
		const wasRemoved = TimeComponent.activeActions.delete(actionKey);
		streamDeck.logger.info(`Action ${wasRemoved ? 'removed' : 'not found'} with key ${actionKey}, ${TimeComponent.activeActions.size} actions remaining`);

		// Clean up timer if no actions remain
		if (TimeComponent.activeActions.size === 0 && TimeComponent.globalTimer) {
			streamDeck.logger.info('Cleaning up global timer - no active actions');
			clearInterval(TimeComponent.globalTimer);
			TimeComponent.globalTimer = null;
		}
	}

	/**
	 * Sets up a single global timer that updates all active actions synchronously
	 */
	private setupGlobalTimer(): void {
		// Don't create multiple timers
		if (TimeComponent.globalTimer !== null) {
			streamDeck.logger.info('Global timer already exists, skipping');
			return;
		}

		streamDeck.logger.info(`Setting up global timer for ${TimeComponent.activeActions.size} actions`);

		// Set up interval that runs every second
		let lastSecond = -1;
		
		TimeComponent.globalTimer = setInterval(async () => {
			const currentTime = new Date();
			const currentSecond = currentTime.getSeconds();
			
			// Only update when seconds actually change
			if (currentSecond === lastSecond) {
				return;
			}
			
			// Skip if no actions
			if (TimeComponent.activeActions.size === 0) {
				streamDeck.logger.info('No active actions, cleaning up timer');
				if (TimeComponent.globalTimer) {
					clearInterval(TimeComponent.globalTimer);
					TimeComponent.globalTimer = null;
				}
				return;
			}
			
			streamDeck.logger.info(`Timer tick: updating ${TimeComponent.activeActions.size} actions`);
			
			// Update all active actions at the same time
			// Get fresh settings from each action instead of using cache
			for (const [actionKey, actionData] of TimeComponent.activeActions) {
				try {
					// Get the latest settings from the action (this ensures we have the most recent settings)
					const currentSettings = await actionData.action.getSettings();
					
					// Merge with cached settings to ensure we have all defaults
					const settings = { ...actionData.settings, ...currentSettings };
					
					// Update the cache with the latest settings
					TimeComponent.activeActions.set(actionKey, { action: actionData.action, settings });
					
					// Update the display
					await this.updateDisplay(actionData.action, settings);
				} catch (error) {
					streamDeck.logger.error('Error updating action:', error);
					// Remove problematic action to prevent repeated errors
					TimeComponent.activeActions.delete(actionKey);
				}
			}
			
			lastSecond = currentSecond;
		}, 1000); // Update every second
		
		streamDeck.logger.info('Global timer started successfully');
	}

	/**
	 * Updates the display with the current time component.
	 */
	private async updateDisplay(action: any, settings: TimeComponentSettings): Promise<void> {
		streamDeck.logger.info('Plugin: updateDisplay called with settings:', settings);
		const now = new Date();
		const component = this.getTimeComponent(now, settings.component!, settings.format24Hour!, settings.blinkColons ?? true);
		
		streamDeck.logger.info('Plugin: Generated component text:', component);
		
		// Create canvas and draw the component
		const canvas = this.createCanvas(component, settings);
		await action.setImage(canvas);
		
		// Clear the title since we're drawing on canvas
		await action.setTitle("");
		
		streamDeck.logger.info('Plugin: Display updated successfully');
	}

	/**
	 * Creates a canvas with the time component rendered on it.
	 */
	private createCanvas(text: string, settings: TimeComponentSettings): string {
		const size = 144; // Stream Deck button size
		const fontSize = this.getFontSize(text, settings);
		const fontFamily = settings.fontFamily || "Arial";
		
		// Calculate precise center position accounting for font metrics
		const centerX = size / 2;
		const centerY = size / 2 + fontSize * 0.35; // Adjust based on typical font metrics
		
		// Create a simple SVG without complex formatting
		const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
			<rect width="${size}" height="${size}" fill="${settings.backgroundColor || '#000000'}" rx="8"/>
			<text x="${centerX}" y="${centerY}" 
				font-family="${fontFamily}" 
				font-size="${fontSize}px" 
				font-weight="bold"
				fill="${settings.textColor || '#FFFFFF'}" 
				text-anchor="middle" 
				dominant-baseline="auto">${text}</text>
		</svg>`;
		
		// Convert to base64 data URL
		try {
			return `data:image/svg+xml;base64,${btoa(svg)}`;
		} catch (e) {
			console.error('Error creating canvas:', e);
			// Fallback: return a simple colored rectangle
			return `data:image/svg+xml;base64,${btoa(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="red" rx="8"/></svg>`)}`;
		}
	}

	/**
	 * Determines the appropriate font size based on the text content.
	 */
	private getFontSize(text: string, settings: TimeComponentSettings): number {
		const baseFontSize = settings.fontSize || 96;
		const isDoubleDigit = text.length === 2;
		
		if (isDoubleDigit) {
			return baseFontSize * 0.75; // Make double digits 75% of base size to fit better
		} else {
			return baseFontSize;
		}
	}

	/**
	 * Extracts the specified component from the current time.
	 */
	private getTimeComponent(date: Date, component: TimeComponentType, format24Hour: boolean, blinkColons: boolean): string {
		let hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();

		// Convert to 12-hour format if needed
		if (!format24Hour) {
			if (hours > 12) {
				hours -= 12;
			} else if (hours === 0) {
				hours = 12;
			}
		}

		// Format numbers with leading zeros
		const hoursStr = hours.toString().padStart(2, '0');
		const minutesStr = minutes.toString().padStart(2, '0');
		const secondsStr = seconds.toString().padStart(2, '0');

		switch (component) {
			case "hour1":
				return hoursStr[0];
			case "hour2":
				return hoursStr[1];
			case "minute1":
				return minutesStr[0];
			case "minute2":
				return minutesStr[1];
			case "second1":
				return secondsStr[0];
			case "second2":
				return secondsStr[1];
			case "colon":
				// Blink the colon every second - show for first 500ms, hide for last 500ms
				if (!blinkColons) {
					return ":";
				}
				// Use seconds instead of milliseconds for more predictable blinking
				return (seconds % 2 === 0) ? ":" : " ";
			case "fullHour":
				return hoursStr;
			case "fullMinute":
				return minutesStr;
			case "fullSecond":
				return secondsStr;
			default:
				return "?";
		}
	}

	/**
	 * Handles key down events - currently just refreshes the display.
	 */
	override async onKeyDown(ev: KeyDownEvent<TimeComponentSettings>): Promise<void> {
		await this.updateDisplay(ev.action, ev.payload.settings);
	}

	/**
	 * Called when settings are updated from the property inspector.
	 */
	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<TimeComponentSettings>): Promise<void> {
		streamDeck.logger.info('Plugin: onDidReceiveSettings called with:', ev.payload.settings);
		
		// Update cached settings immediately using action ID as key
		const actionKey = ev.action.id;
		const oldActionData = TimeComponent.activeActions.get(actionKey);
		const newActionData = { action: ev.action, settings: ev.payload.settings };
		TimeComponent.activeActions.set(actionKey, newActionData);
		
		streamDeck.logger.info('Settings updated from:', oldActionData?.settings, 'to:', ev.payload.settings);
		
		// Force immediate display update with new settings
		await this.updateDisplay(ev.action, ev.payload.settings);
	}

	/**
	 * Called when the property inspector sends data to the plugin.
	 */
	override async onSendToPlugin(ev: SendToPluginEvent<TimeComponentSettings, TimeComponentSettings>): Promise<void> {
		streamDeck.logger.info('Plugin: onSendToPlugin called', ev.payload);
		// Handle immediate updates from property inspector
		if (ev.payload) {
			// Update cached settings immediately using action ID as key
			const actionKey = ev.action.id;
			TimeComponent.activeActions.set(actionKey, { action: ev.action, settings: ev.payload });
			
			// Single immediate display update (remove the double update that was causing flashing)
			await this.updateDisplay(ev.action, ev.payload);
		}
	}
}

/**
 * Settings for {@link TimeComponent}.
 */
type TimeComponentSettings = {
	component?: TimeComponentType;
	format24Hour?: boolean;
	blinkColons?: boolean;
	textColor?: string;
	backgroundColor?: string;
	fontSize?: number;
	fontFamily?: string;
};

/**
 * Available time component types.
 */
type TimeComponentType = 
	| "hour1"      // First digit of hour
	| "hour2"      // Second digit of hour
	| "fullHour"   // Full hour (HH)
	| "minute1"    // First digit of minute
	| "minute2"    // Second digit of minute
	| "fullMinute" // Full minute (MM)
	| "second1"    // First digit of second
	| "second2"    // Second digit of second
	| "fullSecond" // Full second (SS)
	| "colon";     // Colon separator



