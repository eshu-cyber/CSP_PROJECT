---
name: Clinical Precision
colors:
  surface: '#fbf8ff'
  surface-dim: '#d4d8f7'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#ececff'
  surface-container-high: '#e4e7ff'
  surface-container-highest: '#dde1ff'
  on-surface: '#151a31'
  on-surface-variant: '#3f4943'
  inverse-surface: '#2a2f47'
  inverse-on-surface: '#f0efff'
  outline: '#6f7a73'
  outline-variant: '#bec9c1'
  surface-tint: '#056c4d'
  primary: '#00543b'
  on-primary: '#ffffff'
  primary-container: '#0b6e4f'
  on-primary-container: '#98edc6'
  inverse-primary: '#83d7b1'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#fdae32'
  on-secondary-container: '#6b4500'
  tertiary: '#8f190e'
  on-tertiary: '#ffffff'
  tertiary-container: '#b13224'
  on-tertiary-container: '#ffd1ca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ff4cc'
  primary-fixed-dim: '#83d7b1'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#005139'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb954'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a8'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#8c170d'
  background: '#fbf8ff'
  on-background: '#151a31'
  surface-variant: '#dde1ff'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is engineered for high-stakes medical triage, where clarity, authority, and calm are paramount. The brand personality is "Clinical Premium"—merging the precision of a medical instrument with the approachable elegance of high-end consumer technology. It targets patients in moments of physical distress and healthcare providers requiring rapid, legible data.

The visual style is **Corporate / Modern** with a strong leaning toward **Minimalism**. It utilizes a sophisticated "Apple Health" aesthetic: expansive whitespace, high-contrast typography, and a "Light Mode" first approach to ensure a sterile and trustworthy environment. The emotional response is one of immediate professional reassurance and structural reliability.

## Colors
The palette is rooted in medical semiotics. The **Primary Green** (#0B6E4F) is used for core actions and branding to establish deep-seated trust. The **Neutral Dark Navy** (#1A1F36) ensures WCAG AAA readability for critical medical instructions.

Functional color application is strictly governed by clinical severity:
- **Fracture/Danger**: #D94F3D is reserved for acute injuries and urgent warnings.
- **Sprain/Safe**: #2E9E6B indicates manageable conditions or successful diagnostic states.
- **Accent Amber**: #F4A72A provides high-visibility caution without inducing panic.
- **Background**: A very pale medical blue-grey (#F7F9FC) reduces eye strain compared to pure white, while **Surface White** (#FFFFFF) is used to lift interactive cards and containers.

## Typography
The typography system uses a tiered approach to hierarchy. **Sora** provides a modern, geometric structure for headlines, conveying technical sophistication and confidence. Its bold weights are used to anchor the user’s gaze on diagnostic results and section headers.

**DM Sans** is the workhorse for all instructional and data-heavy content. It was selected for its high legibility and neutral character, ensuring that medical information is processed without friction. Line heights are purposefully generous (1.6x for body text) to assist users who may be viewing the screen under physical stress or in low-light clinical settings.

## Layout & Spacing
This design system utilizes a **Fixed Grid** model for desktop to maintain a compact, readable "clinical file" feel, transitioning to a fluid model for mobile devices. 

- **Desktop**: 12-column grid, 1200px max-width, 24px gutters. Content is often centered in a single column "triage" layout to focus attention.
- **Mobile**: Single column with 16px side margins. 
- **Rhythm**: An 8px linear scale governs all padding and margins. Vertical stacking uses "generous breathability"—preferring `stack-md` (24px) for related elements and `stack-lg` (48px) to separate distinct diagnostic phases.

## Elevation & Depth
The system uses **Tonal Layers** paired with **Ambient Shadows** to create a sense of organized hierarchy. 

- **Level 0 (Background)**: #F7F9FC.
- **Level 1 (Cards)**: Pure #FFFFFF with a subtle 1px border (#E2E8F0) and a soft, highly diffused shadow (0px 4px 20px rgba(26, 31, 54, 0.05)). This represents the primary interactive surface.
- **Level 2 (Modals/Overlays)**: Pure #FFFFFF with a deeper shadow (0px 12px 32px rgba(26, 31, 54, 0.12)) to indicate temporary, high-priority interactions like "View X-Ray" or "Emergency Contact."

Shadows are never pure black; they are always tinted with the Dark Navy neutral color to maintain a premium, integrated feel.

## Shapes
The shape language is "Friendly-Professional." 

Large containers and diagnostic cards use a **16px (rounded-lg)** radius to evoke the approachability of modern consumer healthcare apps. Functional elements like buttons and input fields use a slightly tighter **12px radius** to maintain a sense of precision and "tool-like" utility. Smaller elements like chips or badges use a 6px radius or are fully pill-shaped to differentiate them from actionable buttons.

## Components
- **Buttons**: Primary buttons use the 12px radius, #0B6E4F background, and White Sora Bold text. Secondary buttons use a ghost style with a #E2E8F0 border and #1A1F36 text.
- **Cards**: Large 16px rounded white surfaces. They should include a subtle internal padding of 24px or 32px to maintain the premium whitespace aesthetic.
- **Input Fields**: 12px radius with a #E2E8F0 border. On focus, the border transitions to Primary Green with a 2px stroke.
- **Chips/Status Badges**: Used for "Sprain" or "Fracture" indicators. These should be pill-shaped with a light background tint of the status color and dark text of the same hue for maximum legibility (e.g., Red-tinted background with Dark Red text).
- **Progress Steppers**: Horizontal thin lines using #E2E8F0 for inactive and #0B6E4F for active, marking the user's journey through the triage process.
- **Selection Controls**: Checkboxes and Radio buttons use a 4px and circular radius respectively, utilizing the Primary Green for the "selected" state.