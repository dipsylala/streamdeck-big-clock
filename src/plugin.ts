import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { TimeComponent } from "./actions/time-component";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the time component action.
streamDeck.actions.registerAction(new TimeComponent());

// Finally, connect to the Stream Deck.
streamDeck.connect();
