# Polymorphic Management & Full-Screen Stav Bot - Specification Update

## Overview

I've updated the migration spec to include **1:1 fidelity** requirements for:
1. **Polymorphic Management Interfaces** - Distinct management UIs for each page type
2. **Missing Page Templates** - Artist, Business Card, and Portfolio pages
3. **Full-Screen Stav Bot** - Immersive voice-enabled search experience

## What Was Updated

### 1. Requirements Document (requirements.md)

Added three new requirements:

#### Requirement 17: Polymorphic Management Interfaces
- Store pages → Inventory & Order Manager
- Service pages → Appointment/Queue Manager  
- Event pages → Guest List/RSVP Manager
- Course pages → Student & Purchase Manager
- Message pages → Messages Manager
- Standard pages → Leads Manager

Each management interface is specialized for its page type's business model.

#### Requirement 18: New Page Type Templates
- **Artist Page**: Biography, gallery, works showcase
- **Business Card**: Digital vCard with contact buttons
- **Portfolio**: Image gallery with project showcase

#### Requirement 19: Full-Screen Stav Bot with Voice
- Full-screen modal overlay (z-index 9999)
- Google Text-to-Speech API integration
- Browser Speech Recognition for voice input
- Conversation context maintenance
- Voice waveform visualization

### 2. Design Document (design.md)

Added comprehensive architecture sections:

#### Polymorphic Management Architecture
- Router logic that selects component based on `pageType`
- Detailed specifications for each management interface
- Data sources and features for each interface type
- Implementation pattern with Svelte component routing

#### New Page Type Templates
- Complete structure specifications for artist, business card, and portfolio templates
- Metadata requirements for each type
- Integration with existing template system

#### Full-Screen Stav Bot Design
- Component architecture with voice capabilities
- Google TTS integration endpoint (`/api/tts`)
- Speech Recognition implementation
- Visual design specifications (gradient backgrounds, animations)
- User flow from button click to voice interaction

### 3. Tasks Document (tasks.md)

Added three new task sections:

#### Task 27: Implement Polymorphic Management Interfaces (7 subtasks)
- 27.1: Create management component router
- 27.2: InventoryOrderManager (Store/Restaurant/Course)
- 27.3: AppointmentQueueManager (Service Provider)
- 27.4: GuestListRSVPManager (Events)
- 27.5: MessagesManager (Message in Bottle)
- 27.6: Update LeadsManager (Standard pages)
- 27.7: Unit tests for management components

#### Task 28: Add New Page Type Templates (6 subtasks)
- 28.1: Create artist page template
- 28.2: Create business card template
- 28.3: Create portfolio/image gallery template
- 28.4: Update TemplateSelector component
- 28.5: Update page type detection logic
- 28.6: Unit tests for new templates

#### Task 29: Implement Full-Screen Stav Bot with Voice (8 subtasks)
- 29.1: Create StavBotFullScreen component
- 29.2: Implement Google TTS integration
- 29.3: Add voice output to bot responses
- 29.4: Implement voice input with Speech Recognition
- 29.5: Add voice waveform visualization
- 29.6: Update marketplace page
- 29.7: Unit tests for Stav Bot
- 29.8: Integration tests for voice features

#### Task 30: Final Checkpoint
- Test all polymorphic management interfaces
- Test new page templates
- Test full-screen Stav Bot with voice
- Verify Google TTS and Speech Recognition

## Key Design Decisions

### 1. Polymorphic Routing Pattern

Instead of a generic dashboard, the system uses **runtime polymorphism**:

```svelte
<script>
  const managementComponent = $derived(() => {
    switch(data.page.pageType) {
      case 'store': return InventoryOrderManager;
      case 'serviceProvider': return AppointmentQueueManager;
      case 'event': return GuestListRSVPManager;
      // ... etc
    }
  });
</script>

<svelte:component this={managementComponent} {data} />
```

This ensures each page type gets the **exact management interface** it needs.

### 2. Google TTS Integration

The bot uses **Google Cloud Text-to-Speech** for natural Hebrew voice:

```javascript
// API endpoint: /api/tts
const client = new TextToSpeechClient();
const [response] = await client.synthesizeSpeech({
  input: { text },
  voice: { languageCode: 'he-IL', name: 'he-IL-Wavenet-A' },
  audioConfig: { audioEncoding: 'MP3' }
});
```

### 3. Full-Screen Modal Design

The bot is **immersive and prominent**:
- `position: fixed; inset: 0; z-index: 9999`
- Gradient background: `from-purple-900 via-pink-800 to-purple-900`
- Large message bubbles with animations
- Voice waveform visualization
- Microphone button with pulse effect

## Implementation Priority

Based on the user's emphasis on **1:1 fidelity**, I recommend this order:

1. **Task 27** (Polymorphic Management) - Core requirement, affects all page types
2. **Task 28** (New Templates) - Fills gaps in page type coverage
3. **Task 29** (Full-Screen Stav Bot) - Enhances user experience with voice

## Technical Requirements

### New Dependencies
- `@google-cloud/text-to-speech` - For voice output
- Google Cloud credentials file - For TTS API access

### Browser Requirements
- Speech Recognition API support (Chrome, Edge)
- Audio playback capabilities
- Modern CSS support for animations

### Environment Variables
```env
GOOGLE_TTS_KEY_PATH=/path/to/credentials.json
```

## Next Steps

The spec is now complete and ready for implementation. To start:

1. Review the updated requirements, design, and tasks
2. Confirm the approach matches your vision
3. Begin with Task 27 (Polymorphic Management Interfaces)

The spec follows the **same 1:1 fidelity standard** you loved from the login page migration. Each legacy feature is preserved with **exact functionality**, not simplified or reimagined.

---

**Ready to proceed?** Let me know if you'd like any adjustments to the spec before we start implementation!
