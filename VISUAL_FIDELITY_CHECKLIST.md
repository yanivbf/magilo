# ✅ Visual Fidelity Checklist

## Component-by-Component Verification

This document provides a detailed checklist to verify that each component matches the legacy system exactly.

---

## 1. EventForm Component

### Layout Structure
- [x] Fieldset with border and rounded corners
- [x] Legend text in purple (#4c1d95)
- [x] 2-column grid on desktop (sm:grid-cols-2)
- [x] Single column on mobile
- [x] Proper spacing between fields (gap-x-6 gap-y-4)

### Field Styling
- [x] Event Name: Full width (sm:col-span-2)
- [x] Event Date: Half width with date picker
- [x] Event Time: Half width with time picker
- [x] Location: Full width (sm:col-span-2)
- [x] Max Guests: Half width, number input
- [x] Phone: Half width, tel input
- [x] WhatsApp: Full width (sm:col-span-2) with hint text

### Input Styling
- [x] White background
- [x] Border: 1px solid #e2e8f0 (slate-300)
- [x] Rounded corners (rounded-md)
- [x] Padding: 0.5rem 1rem (px-4 py-2)
- [x] Focus: Purple ring (#8b5cf6)
- [x] Placeholder text in gray

### Typography
- [x] Labels: text-sm, font-medium, text-slate-700
- [x] Required asterisk in red
- [x] Hint text: text-xs, text-slate-500

---

## 2. DaySettingsManager Component

### Container
- [x] Max-width: 1200px
- [x] Centered with margin auto
- [x] White background card
- [x] Rounded corners (rounded-lg)
- [x] Shadow: 0 10px 25px rgba(0,0,0,0.1)

### Header Section
- [x] Title: "⚙️ הגדרות ימי עבודה"
- [x] Subtitle explaining functionality
- [x] Border bottom separator
- [x] Proper spacing (pb-4 mb-6)

### Day Cards
- [x] Border: 1px solid #d1d5db (gray-300)
- [x] Rounded corners (rounded-lg)
- [x] Padding: 1rem (p-4)
- [x] Gray background when day is closed (bg-gray-50)
- [x] White background when day is working

### Day Header
- [x] Day name in Hebrew (ראשון, שני, etc.)
- [x] Toggle checkbox on right
- [x] Checkbox: Purple (#8b5cf6)
- [x] Label: "יום עבודה"

### Working Hours
- [x] 2-column grid (grid-cols-2)
- [x] Start time input
- [x] End time input
- [x] Time inputs with proper styling
- [x] Focus state: Purple ring

### Breaks Section
- [x] "הפסקות" label
- [x] "+ הוסף הפסקה" button in purple
- [x] Break items in gray background (bg-gray-50)
- [x] Start/end time inputs side by side
- [x] Delete button (🗑️) on right
- [x] Empty state message when no breaks

### Closed Dates Section
- [x] "תאריכים סגורים" label
- [x] "+ הוסף תאריך" button in purple
- [x] Date items in gray background
- [x] Date input with proper styling
- [x] Delete button (🗑️) on right
- [x] Empty state message when no dates

### Save Button
- [x] Gradient background (purple to pink)
- [x] White text
- [x] Bold font
- [x] Rounded corners (rounded-lg)
- [x] Shadow effect
- [x] Hover: Scale 1.05
- [x] Icon: 💾

### Messages
- [x] Error: Red background, red border, red text
- [x] Success: Green background, green border, green text
- [x] Rounded corners (rounded-lg)
- [x] Padding: 1rem (px-4 py-3)

---

## 3. GuestListRSVPManager Component

### Header Card
- [x] White background
- [x] Rounded corners (rounded-2xl)
- [x] Shadow: 0 10px 25px rgba(0,0,0,0.1)
- [x] Padding: 2rem (p-8)
- [x] Title: "ניהול מוזמנים" in purple
- [x] Subtitle with page name

### Statistics Boxes
- [x] Grid: 5 columns on desktop (lg:grid-cols-5)
- [x] Responsive: 2 columns on tablet, 1 on mobile
- [x] Gradient backgrounds:
  - Default: Purple (#667eea to #764ba2)
  - Total with plus: Purple gradient
  - Confirmed: Green (#10b981 to #059669)
  - Pending: Orange (#f59e0b to #d97706)
  - Declined: Red (#ef4444 to #dc2626)
- [x] White text
- [x] Rounded corners (rounded-16px)
- [x] Padding: 30px
- [x] Shadow effects
- [x] Hover: Lift effect (translateY -5px)
- [x] Large numbers (text-5xl)
- [x] Icon labels

### Guest Limit Control
- [x] White background card
- [x] Rounded corners (rounded-xl)
- [x] Shadow effect
- [x] Padding: 1.5rem (p-6)
- [x] Title: "🎯 מכסת מוזמנים"
- [x] Number input with purple border
- [x] Save button in purple
- [x] Flex layout with space-between

### Alert (Over Limit)
- [x] Red background (bg-red-100)
- [x] Red left border (border-l-4)
- [x] Red text
- [x] Warning icon: ⚠️ (large, 4xl)
- [x] Bold title
- [x] Guest count display

### Tabs
- [x] Two tabs: "👥 רשימת מוזמנים" and "🪑 סידור שולחנות"
- [x] Border bottom (border-b-2)
- [x] Inactive: Gray background (#f3f4f6)
- [x] Active: Purple gradient background
- [x] Active: White text
- [x] Padding: 15px 30px
- [x] Font weight: 600
- [x] Smooth transition

### Guest List Tab

#### Controls
- [x] Search input with 🔍 icon
- [x] Filter dropdown (status)
- [x] View mode dropdown (cards/table)
- [x] Flex layout with gap
- [x] Purple border on focus

#### Card View
- [x] Guest cards with:
  - White background
  - Rounded corners (12px)
  - Padding: 20px
  - Shadow: 0 2px 10px rgba(0,0,0,0.08)
  - Colored right border (5px):
    - Green: Confirmed
    - Orange: Pending
    - Red: Declined
  - Hover: Lift effect (translateY -3px)
  - Hover: Enhanced shadow
- [x] Guest name in bold (text-xl)
- [x] Guest details with icons (📱, 📧, 👥, 🪑, 🎁, 💰, 📝)
- [x] Status badge:
  - Rounded pill shape
  - Colored background (green/orange/red)
  - Bold text
  - Icon + text

#### Table View
- [x] Full-width table
- [x] Header: Purple gradient background
- [x] Header: White text
- [x] Columns: #, שם, טלפון, אימייל, מלווים, סטטוס, שולחן, מתנה, הערות
- [x] Alternating row colors (gray-50/white)
- [x] Hover: Purple tint (bg-purple-50)
- [x] Border top on rows
- [x] Padding: 1rem (p-4)
- [x] Status badges in cells

### Table Arrangement Tab

#### Settings Card
- [x] White background
- [x] Rounded corners (rounded-xl)
- [x] Shadow effect
- [x] Padding: 1.5rem (p-6)
- [x] Title: "⚙️ הגדרות שולחנות"
- [x] 3-column grid (md:grid-cols-3)
- [x] Number inputs:
  - "🪑 מספר שולחנות"
  - "👥 מקומות לשולחן"
- [x] Action buttons:
  - "✨ סידור אוטומטי חכם" (purple gradient)
  - "💾 שמור סידור" (green gradient)
- [x] Hover: Scale 1.05

#### Instructions Box
- [x] Blue background (bg-blue-50)
- [x] Blue border (border-blue-200)
- [x] Rounded corners (rounded-xl)
- [x] Padding: 1rem (p-4)
- [x] Title: "💡 איך להשתמש בסידור שולחנות?"
- [x] Bullet list with icons

#### Table Cards
- [x] Grid: 3 columns on xl, 2 on lg, 1 on mobile
- [x] White background
- [x] Rounded corners (rounded-xl)
- [x] Shadow effect
- [x] Padding: 1.5rem (p-6)
- [x] Border: 2px solid
  - Purple: Normal table
  - Red: Over capacity
  - Gray: Empty table
- [x] Hover: Enhanced shadow
- [x] Table header:
  - Table number with 🪑 icon
  - Occupancy badge (occupied/total)
  - Badge colors:
    - Red: Over capacity
    - Green: Normal
    - Gray: Empty
- [x] Guest items:
  - Gradient background (purple-50 to blue-50)
  - Purple border (2px)
  - Rounded corners
  - Guest name in bold
  - Guest size badge (👥 X אנשים)
  - Move dropdown on right
- [x] Empty state:
  - Large chair icon (🪑, text-6xl)
  - "שולחן פנוי" text in gray
- [x] Over capacity warning:
  - Red background
  - Red text
  - Warning icon: ⚠️

---

## 4. StavBotFullScreen Component

### Overlay
- [x] Fixed position (covers entire viewport)
- [x] Background: rgba(0, 0, 0, 0.8)
- [x] Backdrop blur: 10px
- [x] Z-index: 9999
- [x] Centered content (flex, align-center, justify-center)
- [x] Padding: 20px
- [x] Animation: fadeIn (0.3s)

### Container
- [x] Max-width: 800px
- [x] Height: 90vh (max 700px)
- [x] Background: Purple gradient (#667eea to #764ba2)
- [x] Rounded corners: 20px
- [x] Shadow: 0 20px 60px rgba(0,0,0,0.3)
- [x] Flex column layout
- [x] Animation: slideUp (0.4s)

### Header
- [x] Padding: 25px 30px
- [x] Background: rgba(255, 255, 255, 0.1)
- [x] Backdrop blur: 10px
- [x] Border bottom: 1px solid rgba(255, 255, 255, 0.2)
- [x] Flex layout (space-between)
- [x] White text

#### Avatar Section
- [x] Avatar image: 60x60px, rounded circle
- [x] Border: 3px solid rgba(255, 255, 255, 0.3)
- [x] Speaking indicator:
  - Green ring (#00ff88)
  - Pulsing animation
  - Position: absolute, top-right

#### Header Text
- [x] Title: "סתיו - העוזרת הדיגיטלית"
- [x] Font: Heebo, 24px, weight 600
- [x] Status text:
  - "🔊 מדברת..." when speaking
  - "🎤 מקשיבה..." when listening
  - "מחוברת ומוכנה לעזור 🤖" default
- [x] Font size: 14px
- [x] Opacity: 0.9

#### Close Button
- [x] Background: rgba(255, 255, 255, 0.2)
- [x] Size: 45x45px
- [x] Rounded circle
- [x] White X icon
- [x] Hover: Lighter background, scale 1.1

### Messages Area
- [x] Flex: 1 (takes remaining space)
- [x] Padding: 30px
- [x] Overflow-y: auto
- [x] Background: rgba(255, 255, 255, 0.95)
- [x] Flex column layout
- [x] Gap: 20px

#### Message Bubbles
- [x] Max-width: 70%
- [x] Word wrap
- [x] Animation: messageIn (0.4s)

#### Bot Messages
- [x] Align: flex-start (left)
- [x] Background: #f1f5f9 (light gray)
- [x] Color: #334155 (dark gray)
- [x] Border-bottom-left-radius: 8px
- [x] Shadow: 0 2px 10px rgba(0,0,0,0.1)

#### User Messages
- [x] Align: flex-end (right)
- [x] Background: Purple gradient (#667eea to #764ba2)
- [x] Color: White
- [x] Border-bottom-right-radius: 8px
- [x] Shadow: 0 2px 10px rgba(102,126,234,0.3)

#### Message Content
- [x] Padding: 15px 20px
- [x] Border-radius: 20px
- [x] Font: Heebo, 16px
- [x] Line-height: 1.5

#### Timestamp
- [x] Font size: 12px
- [x] Color: #64748b (gray)
- [x] Margin-top: 5px
- [x] Text-align: center

#### Typing Indicator
- [x] Flex layout with gap
- [x] Italic text: "סתיו מקלידה"
- [x] Three dots:
  - Size: 8x8px
  - Purple color (#667eea)
  - Bounce animation (1.4s infinite)
  - Staggered delay (0.2s, 0.4s)

### Input Area
- [x] Padding: 25px 30px
- [x] Background: rgba(255, 255, 255, 0.1)
- [x] Backdrop blur: 10px
- [x] Border top: 1px solid rgba(255, 255, 255, 0.2)

#### Input Container
- [x] Flex layout
- [x] Gap: 15px
- [x] Align: flex-end

#### Textarea
- [x] Flex: 1
- [x] Padding: 15px 20px
- [x] Border: 2px solid rgba(255, 255, 255, 0.3)
- [x] Border-radius: 25px
- [x] Background: rgba(255, 255, 255, 0.9)
- [x] Color: #334155
- [x] Font: Heebo, 16px
- [x] Resize: none
- [x] Max-height: 120px
- [x] Focus:
  - Border: rgba(255, 255, 255, 0.6)
  - Background: white
  - Shadow: 0 0 0 3px rgba(255, 255, 255, 0.2)
- [x] Disabled: Opacity 0.6

#### Buttons
- [x] Size: 50x50px
- [x] Rounded circle
- [x] Flex center
- [x] Transition: all 0.3s

#### Voice Button
- [x] Background: rgba(255, 255, 255, 0.2)
- [x] Border: 2px solid rgba(255, 255, 255, 0.3)
- [x] White microphone icon
- [x] Hover: Lighter background, scale 1.1
- [x] Listening state:
  - Background: #ff4757 (red)
  - Pulse animation

#### Send Button
- [x] Background: rgba(255, 255, 255, 0.9)
- [x] Color: #667eea (purple)
- [x] Send arrow icon
- [x] Hover: White background, scale 1.1
- [x] Disabled: Opacity 0.5, no transform

### Animations
- [x] fadeIn: opacity 0 to 1
- [x] slideUp: translateY(50px) scale(0.9) to translateY(0) scale(1)
- [x] messageIn: opacity 0, translateY(20px) to opacity 1, translateY(0)
- [x] bounce: translateY oscillation (-8px, -4px, 0)
- [x] pulse: scale(1) opacity(1) to scale(1.4) opacity(0)

### Responsive
- [x] Mobile (max-width: 768px):
  - Container: 100% width, 100vh height, no border-radius
  - Messages area: padding 20px
  - Input area: padding 15px 20px

---

## 🎨 Color Palette Verification

### Primary Colors
- [x] Purple: #8b5cf6 (#667eea for gradients)
- [x] Pink: #ec4899 (#764ba2 for gradients)
- [x] Blue: #3b82f6

### Status Colors
- [x] Success/Confirmed: #10b981 (green)
- [x] Warning/Pending: #f59e0b (orange)
- [x] Error/Declined: #ef4444 (red)

### Neutral Colors
- [x] Gray-50: #f9fafb
- [x] Gray-100: #f3f4f6
- [x] Gray-300: #d1d5db
- [x] Gray-600: #4b5563
- [x] Gray-700: #374151
- [x] Slate-300: #cbd5e1
- [x] Slate-500: #64748b
- [x] Slate-700: #334155

---

## 📱 Responsive Breakpoints

- [x] Mobile: < 640px (sm)
- [x] Tablet: 640px - 768px (md)
- [x] Desktop: 768px - 1024px (lg)
- [x] Large Desktop: > 1024px (xl)

---

## ✅ Final Verification

### Visual Consistency
- [x] All components use consistent color scheme
- [x] All components use consistent typography
- [x] All components use consistent spacing
- [x] All components use consistent border radius
- [x] All components use consistent shadows

### Interactive Elements
- [x] All buttons have hover effects
- [x] All inputs have focus states
- [x] All transitions are smooth (0.3s ease)
- [x] All animations are fluid

### Accessibility
- [x] All inputs have labels
- [x] All buttons have clear purposes
- [x] Color contrast meets WCAG standards
- [x] Focus indicators are visible

### Performance
- [x] No layout shifts on load
- [x] Smooth scrolling
- [x] Efficient animations (GPU-accelerated)
- [x] No unnecessary re-renders

---

## 🎯 Success Criteria

✅ **PASSED** - All components match legacy system with 1:1 visual fidelity
✅ **PASSED** - All CSS isolation applied with :global() and !important
✅ **PASSED** - All interactive elements work correctly
✅ **PASSED** - All responsive breakpoints function properly
✅ **PASSED** - All animations and transitions are smooth
✅ **PASSED** - No syntax errors or warnings

