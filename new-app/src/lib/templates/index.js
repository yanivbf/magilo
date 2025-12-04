// Central Templates Export
import { storeTemplate } from './store';
import { eventTemplate } from './event';
import { serviceTemplate } from './service';
import { courseTemplate } from './course';
import { messageTemplate } from './message';
import { artistTemplate } from './artist';
import { restaurantTemplate } from './restaurant';
import { workshopTemplate } from './workshop';
import { quickTemplate } from './quick';
import { faqTemplate } from './faq';

export const templates = {
	onlineStore: storeTemplate,
	event: eventTemplate,
	serviceProvider: serviceTemplate,
	course: courseTemplate,
	artist: artistTemplate,
	messageInBottle: messageTemplate,
	restaurant: restaurantTemplate,
	workshop: workshopTemplate,
	quick: quickTemplate,
	faq: faqTemplate
};

export const templatesList = [
	storeTemplate,
	eventTemplate,
	serviceTemplate,
	courseTemplate,
	artistTemplate,
	messageTemplate,
	restaurantTemplate,
	workshopTemplate,
	quickTemplate,
	faqTemplate
];

// Helper function to get template by ID
/**
 * @param {string} id
 */
export function getTemplateById(id) {
	// @ts-ignore - Dynamic template lookup
	return templates[id] || null;
}
