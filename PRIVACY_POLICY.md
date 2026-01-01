# Privacy Policy for CSS Scanner

**Last Updated**: January 2026
**Effective Date**: January 2026

## Overview

CSS Scanner ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how we handle data when you use our Chrome extension.

## TL;DR (Summary)

- ✅ **Zero data collection** - We don't collect any personal data
- ✅ **No tracking** - No analytics, no telemetry, no tracking
- ✅ **Local processing** - Everything runs on your device
- ✅ **No external servers** - No data sent anywhere
- ✅ **No accounts** - No sign-up, no login required
- ✅ **Open source** - Code is transparent and auditable

## Data Collection

**CSS Scanner does NOT collect, store, transmit, or share any user data.**

Specifically, we do NOT collect:

- ❌ Personal information (name, email, etc.)
- ❌ Browsing history
- ❌ Websites you visit
- ❌ CSS data you inspect
- ❌ User interactions
- ❌ Device information
- ❌ IP addresses
- ❌ Location data
- ❌ Cookies or tracking identifiers

## How the Extension Works

1. **Activation**: You click the extension icon to activate scan mode
2. **Local Processing**: When you hover over elements, CSS properties are extracted using JavaScript DOM APIs
3. **Display**: CSS properties are shown in a popup overlay
4. **Clipboard**: When you click "Copy", data goes directly to your clipboard
5. **Deactivation**: Everything is cleared when you close the popup or exit scan mode

**All processing happens locally on your device.** No data leaves your browser.

## Permissions Explained

CSS Scanner requests the following Chrome permissions:

### `activeTab`

**Why**: To access CSS properties of the current tab when you activate the extension
**Scope**: Only the active tab, only when you click the extension icon
**Data Access**: Read-only access to DOM and computed styles
**Data Sent**: None

### `scripting`

**Why**: To inject the content script that analyzes CSS
**Scope**: Only when you explicitly activate the extension
**Data Access**: Ability to run JavaScript on the page
**Data Sent**: None

**We use the minimum permissions necessary.** We specifically do NOT request:

- ❌ `<all_urls>` - We don't access all websites automatically
- ❌ `tabs` - We don't monitor your browsing
- ❌ `webRequest` - We don't intercept network traffic
- ❌ `history` - We don't access browsing history
- ❌ `storage` (currently) - We don't store any data

## Local Storage

CSS Scanner does NOT currently use `chrome.storage` API or any form of persistent storage.

**Future Plans**: If we add a settings/preferences feature, we will:

- Store preferences locally using `chrome.storage.local`
- Never sync data to Google servers
- Allow you to clear all stored data
- Update this privacy policy accordingly

## Third-Party Services

**CSS Scanner does NOT use any third-party services**, including:

- ❌ Analytics (Google Analytics, Mixpanel, etc.)
- ❌ Error tracking (Sentry, Bugsnag, etc.)
- ❌ Advertising networks
- ❌ CDNs for loading resources
- ❌ External APIs

## Open Source Transparency

CSS Scanner is **100% open source**. You can:

- View the complete source code on GitHub
- Audit the code to verify our privacy claims
- Build the extension yourself from source
- Report any privacy concerns via GitHub Issues

GitHub Repository: [Link will be updated]

## Updates to This Policy

We may update this Privacy Policy to reflect:

- Changes in Chrome Extension policies
- New features added to the extension
- User feedback and concerns

**We will never**:

- Reduce your privacy protections without clear notice
- Start collecting data without explicit permission
- Share data with third parties

## Children's Privacy

CSS Scanner does not knowingly collect information from anyone, including children under 13. Since we collect no data at all, the extension is safe for all ages.

## Your Rights

Since we don't collect any data, there is no data to:

- Access
- Correct
- Delete
- Export
- Object to processing

Your CSS inspection activity is completely private and known only to you.

## Data Security

While we don't collect data, we take security seriously:

- **No external communication**: Extension runs entirely offline
- **Minimal permissions**: Only what's absolutely necessary
- **Code review**: All changes reviewed before release
- **Regular updates**: Security patches applied promptly
- **No eval()**: No dynamic code execution
- **Content Security Policy**: Strict CSP enforced

## Compliance

This extension complies with:

- ✅ Chrome Web Store Developer Program Policies
- ✅ Chrome Extension Manifest V3 requirements
- ✅ GDPR (no data collection = no GDPR obligations)
- ✅ CCPA (California Consumer Privacy Act)
- ✅ Other privacy regulations (by not collecting data)

## Contact Us

If you have questions about this Privacy Policy:

- **GitHub Issues**: [Repository URL]/issues
- **Email**: [Your email address]
- **Twitter**: [@cssscanner]

## Consent

By installing and using CSS Scanner, you consent to this Privacy Policy.

You can withdraw consent at any time by uninstalling the extension:

1. Go to `chrome://extensions/`
2. Find CSS Scanner
3. Click "Remove"

This will delete all extension files from your computer.

## Verification

You can verify our privacy claims by:

1. **Checking network activity**: Use Chrome DevTools Network tab - you'll see zero outbound requests from the extension
2. **Reviewing the code**: Inspect the source code on GitHub
3. **Examining permissions**: Check manifest.json for requested permissions
4. **Building from source**: Compile the extension yourself

## Privacy by Design

CSS Scanner was built with "Privacy by Design" principles:

- **Data Minimization**: We don't collect data we don't need (which is all data)
- **Purpose Limitation**: Extension only does CSS inspection, nothing else
- **Transparency**: Open source code, clear privacy policy
- **User Control**: You control when the extension is active
- **Security**: No data transmission means no data breaches

## Changes to This Policy

**Current Version**: 1.0
**Last Updated**: January 2026

If we make changes, we will:

1. Update the "Last Updated" date
2. Notify users via extension update notes
3. Post changes on GitHub
4. Give 30 days notice for material changes

## Questions?

If you have any questions or concerns about privacy, please:

- Open a GitHub Issue
- Email us at [support email]
- Tweet at [@cssscanner]

We're committed to transparency and will respond promptly.

---

## Summary

**CSS Scanner respects your privacy completely.**

- No data collection
- No tracking
- No analytics
- No external communication
- No user accounts
- 100% local processing
- Open source and auditable

**Your CSS inspection activity is completely private.** 🔒

---

_This privacy policy is effective as of January 2026 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page._
