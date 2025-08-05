import { action, KeyDownEvent, SingletonAction, WillAppearEvent, WillDisappearEvent, DidReceiveSettingsEvent, SendToPluginEvent } from "@elgato/streamdeck";
import streamDeck from "@elgato/streamdeck";

/**
 * An action that displays individual components of the current time (hours, minutes, seconds, or separators).
 */
@action({ UUID: "com.github.dipsylala.big-clock.time-component" })
export class TimeComponent extends SingletonAction<TimeComponentSettings> {
	private intervals = new Map<string, NodeJS.Timeout>();
	private static globalTimer: NodeJS.Timeout | null = null;
	private static activeActions = new Map<any, TimeComponentSettings>(); // Cache settings with actions
	private static isSettingUpTimer = false;

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

		// Update the display immediately
		await this.updateDisplay(ev.action, settings);

		// Add this action to the global set with its settings
		TimeComponent.activeActions.set(ev.action, settings);
		streamDeck.logger.info(`Action added, ${TimeComponent.activeActions.size} total actions`);

		// Set up global synchronized timer if not already running
		this.setupGlobalTimer();

		// If timer seems to have stopped, restart it after a delay
		setTimeout(() => {
			if (TimeComponent.activeActions.size > 0 && !TimeComponent.globalTimer && !TimeComponent.isSettingUpTimer) {
				streamDeck.logger.info('Timer was missing - restarting');
				this.setupGlobalTimer();
			}
		}, 2000); // Check after 2 seconds
	}

	/**
	 * Called when the action becomes invisible. Cleans up the timer.
	 */
	override onWillDisappear(ev: WillDisappearEvent<TimeComponentSettings>): void {
		// Remove this action from the global set
		TimeComponent.activeActions.delete(ev.action);
		streamDeck.logger.info(`Action removed, ${TimeComponent.activeActions.size} actions remaining`);

		// Use a longer delay before cleaning up the global timer to handle button moves/recreations
		setTimeout(() => {
			if (TimeComponent.activeActions.size === 0 && TimeComponent.globalTimer) {
				streamDeck.logger.info('Cleaning up global timer - no active actions');
				clearInterval(TimeComponent.globalTimer);
				TimeComponent.globalTimer = null;
				TimeComponent.isSettingUpTimer = false;
			}
		}, 2000); // 2 second delay to handle button moves/recreations

		const interval = this.intervals.get(ev.action.id);
		if (interval) {
			clearInterval(interval);
			this.intervals.delete(ev.action.id);
		}
	}

	/**
	 * Sets up a single global timer that updates all active actions synchronously
	 */
	private setupGlobalTimer(): void {
		// Use a flag to prevent multiple simultaneous setups
		if (TimeComponent.globalTimer !== null || TimeComponent.isSettingUpTimer) {
			streamDeck.logger.info('Global timer already exists or is being set up, skipping');
			return;
		}

		TimeComponent.isSettingUpTimer = true;
		streamDeck.logger.info(`Setting up global timer for ${TimeComponent.activeActions.size} actions`);

		const now = new Date();
		const msUntilNextSecond = 1000 - now.getMilliseconds();
		
		// Wait until the next full second, then start regular interval
		setTimeout(() => {
			// Double-check that no timer was created while we were waiting
			if (TimeComponent.globalTimer !== null) {
				streamDeck.logger.info('Timer was created while waiting, aborting setup');
				TimeComponent.isSettingUpTimer = false;
				return;
			}

			// Set up interval that runs every 100ms for smooth colon blinking
			// but only update non-colon components every second
			let lastSecond = -1;
			
			TimeComponent.globalTimer = setInterval(async () => {
				const currentTime = new Date();
				const currentSecond = currentTime.getSeconds();
				const currentMillisecond = currentTime.getMilliseconds();
				const shouldUpdateAll = currentSecond !== lastSecond;
				
				// Don't clean up timer from within the timer callback - this can cause race conditions
				// Timer cleanup is handled in onWillDisappear with a delay
				if (TimeComponent.activeActions.size === 0) {
					// Just skip this update cycle, don't clean up timer
					return;
				}
				
				// Update all active actions at the same time using cached settings
				for (const [action, settings] of TimeComponent.activeActions) {
					try {
						// Update colons every 100ms for smooth blinking, others only when seconds change
						const isColon = settings.component === 'colon1' || settings.component === 'colon2';
						
						if (shouldUpdateAll || (isColon && settings.blinkColons)) {
							await this.updateDisplay(action, settings);
						}
					} catch (error) {
						streamDeck.logger.error('Error updating action:', error);
					}
				}
				
				if (shouldUpdateAll) {
					lastSecond = currentSecond;
				}
			}, 100); // Update every 100ms for smooth colon animation
			
			TimeComponent.isSettingUpTimer = false;
			streamDeck.logger.info('Global timer started successfully');
		}, msUntilNextSecond);
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
			case "colon1":
			case "colon2":
				// Blink the colon every second, showing for first 500ms of each second
				if (!blinkColons) {
					return ":";
				}
				const milliseconds = date.getMilliseconds();
				return milliseconds < 500 ? ":" : " ";
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
		streamDeck.logger.info('Plugin: onDidReceiveSettings called', ev.payload.settings);
		
		// Update cached settings immediately
		TimeComponent.activeActions.set(ev.action, ev.payload.settings);
		
		// Force immediate display update to clear any stale state
		await this.updateDisplay(ev.action, ev.payload.settings);
		
		// Also trigger a second update after a brief delay to ensure consistency
		setTimeout(async () => {
			await this.updateDisplay(ev.action, ev.payload.settings);
		}, 50);
	}

	/**
	 * Called when the property inspector sends data to the plugin.
	 */
	override async onSendToPlugin(ev: SendToPluginEvent<TimeComponentSettings, TimeComponentSettings>): Promise<void> {
		streamDeck.logger.info('Plugin: onSendToPlugin called', ev.payload);
		// Handle immediate updates from property inspector
		if (ev.payload) {
			// Update cached settings immediately
			TimeComponent.activeActions.set(ev.action, ev.payload);
			
			// Force immediate display update
			await this.updateDisplay(ev.action, ev.payload);
			
			// Also trigger a second update after a brief delay to ensure consistency
			setTimeout(async () => {
				await this.updateDisplay(ev.action, ev.payload);
			}, 50);
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
	| "minute1"    // First digit of minute
	| "minute2"    // Second digit of minute
	| "second1"    // First digit of second
	| "second2"    // Second digit of second
	| "colon1"     // Colon separator (between hours and minutes)
	| "colon2"     // Colon separator (between minutes and seconds)
	| "fullHour"   // Full hour (HH)
	| "fullMinute" // Full minute (MM)
	| "fullSecond"; // Full second (SS)
