// Central Templates Export
import { storeTemplate } from './store';
import { eventTemplate } from './event';
import { serviceTemplate } from './service';
import { courseTemplate } from './course';
import { messageTemplate } from './message';
import { artistTemplate } from './artist';

export const templates = {
	onlineStore: storeTemplate,
	event: eventTemplate,
	serviceProvider: serviceTemplate,
	course: courseTemplate,
	artist: artistTemplate,
	messageInBottle: messageTemplate
};

export const templatesList = [
	storeTemplate,
	eventTemplate,
	serviceTemplate,
	courseTemplate,
	artistTemplate,
	messageTemplate
];

// Helper function to get template by ID
/**
 * @param {string} id
 */
export function getTemplateById(id) {
	// @ts-ignore - Dynamic template lookup
	return templates[id] || null;
}
