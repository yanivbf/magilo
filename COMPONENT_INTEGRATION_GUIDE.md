# 🔌 Component Integration Guide

## Overview
This guide explains how to integrate the newly ported components into the existing application.

---

## 1. EventForm Component

### Location
`new-app/src/lib/components/EventForm.svelte`

### Integration Point
**File:** `new-app/src/lib/components/DynamicForm.svelte`

### How to Integrate

Add EventForm to the dynamic fields section when template type is 'event':

```svelte
<script>
	import EventForm from './EventForm.svelte';
	// ... other imports
</script>

<!-- In the dynamic fields section -->
{#if selectedTemplate?.id === 'event'}
	<EventForm bind:formData={formData} />
{/if}
```

### Data Flow
- EventForm binds to `formData` object
- Fields: `eventName`, `eventDate`, `eventTime`, `location`, `maxGuests`, `phone`, `whatsapp`
- All fields are automatically included in form submission

---

## 2. DaySettingsManager Component

### Location
`new-app/src/lib/components/DaySettingsManager.svelte`

### Integration Point
**File:** `new-app/src/lib/components/DynamicForm.svelte` (for service/appointment templates)

### How to Integrate

Add DaySettingsManager as an optional section in service/appointment forms:

```svelte
<script>
	import DaySettingsManager from './DaySettingsManager.svelte';
	// ... other imports
</script>

<!-- After main form fields -->
{#if selectedTemplate?.id === 'service' || selectedTemplate?.id === 'appointment'}
	<div class="mt-8">
		<h3 class="text-xl font-bold text-purple-600 mb-4">⚙️ הגדרות זמינות</h3>
		<DaySettingsManager pageId={pageId} />
	</div>
{/if}
```

### Data Flow
- Component manages its own state
- Saves directly to API endpoint: `/api/day-settings/[pageId]`
- Loads settings on mount if pageId exists

### API Requirements
- **GET** `/api/day-settings/[pageId]` - Load settings
- **POST** `/api/day-settings/[pageId]` - Save settings
- Already implemented in `new-app/src/routes/api/day-settings/[pageId]/+server.js`

---

## 3. GuestListRSVPManager Component

### Location
`new-app/src/lib/components/manage/GuestListRSVPManager.svelte`

### Integration Point
**File:** `new-app/src/routes/manage/[pageId]/+page.svelte`

### How to Integrate

Already integrated! Component is loaded when page type is 'event':

```svelte
{#if pageData.type === 'event'}
	<GuestListRSVPManager data={{ page: pageData }} />
{/if}
```

### Data Flow
- Component receives page data via props
- Loads guests from API: `/api/guests/[pageId]`
- Manages table assignments via API
- Updates expected guests limit

### API Requirements
- **GET** `/api/guests/[pageId]` - Load guests
- **POST** `/api/update-guest-table` - Update single guest table
- **POST** `/api/save-all-tables` - Save all table assignments
- **POST** `/api/update-expected-guests` - Update guest limit

---

## 4. StavBotFullScreen Component

### Location
`new-app/src/lib/components/StavBotFullScreen.svelte`

### Integration Point
**Multiple locations** - Any page that needs the full-screen bot

### How to Integrate

Add to any page/component:

```svelte
<script>
	import StavBotFullScreen from '$lib/components/StavBotFullScreen.svelte';
	
	let isBotOpen = $state(false);
</script>

<!-- Trigger button -->
<button onclick={() => isBotOpen = true}>
	💬 פתח צ'אט עם סתיו
</button>

<!-- Bot modal -->
<StavBotFullScreen bind:isOpen={isBotOpen} />
```

### Data Flow
- Component manages its own state
- Calls `/api/stav-search` for bot responses
- Calls `/api/tts` for voice synthesis
- Uses browser Speech Recognition API for voice input

### API Requirements
- **POST** `/api/stav-search` - Get bot response
- **POST** `/api/tts` - Text-to-speech (Google TTS)
- Already implemented

---

## 🎨 CSS Requirements

### Global Fonts
Ensure these fonts are loaded in `new-app/src/routes/+layout.svelte`:

```html
<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700&family=Heebo:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</svelte:head>
```

### Tailwind Config
Ensure Tailwind is configured with purple colors in `tailwind.config.js`:

```js
module.exports = {
	theme: {
		extend: {
			colors: {
				purple: {
					500: '#8b5cf6',
					600: '#7c3aed',
					700: '#6d28d9'
				}
			}
		}
	}
}
```

---

## 🧪 Testing Checklist

### EventForm
- [ ] Form appears when creating event page
- [ ] All fields are editable
- [ ] Required fields show validation
- [ ] Date/time pickers work correctly
- [ ] Form data is included in submission

### DaySettingsManager
- [ ] Component loads for service/appointment pages
- [ ] Can toggle working days on/off
- [ ] Can set working hours
- [ ] Can add/remove breaks
- [ ] Can add/remove closed dates
- [ ] Save button persists data
- [ ] Data loads correctly on page refresh

### GuestListRSVPManager
- [ ] Statistics display correctly
- [ ] Guest list loads from API
- [ ] Can switch between card/table view
- [ ] Search and filter work
- [ ] Can set expected guests limit
- [ ] Alert shows when limit exceeded
- [ ] Table arrangement tab works
- [ ] Auto-arrange distributes guests correctly
- [ ] Manual guest movement works
- [ ] Table capacity warnings show

### StavBotFullScreen
- [ ] Modal opens when triggered
- [ ] Chat interface displays correctly
- [ ] Can send text messages
- [ ] Bot responds with relevant answers
- [ ] Voice input button works (if supported)
- [ ] Voice output plays (TTS)
- [ ] Typing indicator shows during response
- [ ] Speaking indicator shows during TTS
- [ ] Can close modal
- [ ] Messages scroll automatically

---

## 🚨 Common Issues

### Issue: Styles not applying
**Solution:** Ensure `:global()` modifiers are present and `!important` flags are used

### Issue: Fonts not loading
**Solution:** Check that Google Fonts link is in `+layout.svelte`

### Issue: API endpoints not found
**Solution:** Verify API routes exist in `new-app/src/routes/api/`

### Issue: Component not rendering
**Solution:** Check that component is imported and template condition is correct

### Issue: Data not persisting
**Solution:** Verify Strapi backend is running and API token is configured

---

## 📝 Next Steps

1. **Test each component individually** in isolation
2. **Test integration** with existing pages
3. **Verify API connectivity** for all endpoints
4. **Test responsive behavior** on mobile devices
5. **Verify accessibility** (keyboard navigation, screen readers)
6. **Performance testing** (load times, animations)

---

## ✅ Success Criteria

- All components render without errors
- Visual appearance matches legacy system exactly
- All interactive elements work (buttons, inputs, toggles)
- Data persists correctly to backend
- Responsive design works on all screen sizes
- No console errors or warnings
- Smooth animations and transitions

