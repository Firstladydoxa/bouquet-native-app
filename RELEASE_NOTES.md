# Rhapsody Languages - Release Notes

**Package Name:** org.tniglobal.rhapsodylanguages  
**App Category:** Education  
**Platform:** Android  
**Minimum SDK:** API 24 (Android 7.0)

## 📱 App Information

### Overview
Rhapsody Languages is a comprehensive language learning application focused on Biblical Hebrew, Koine Greek, and Aramaic. The app provides immersive, context-driven lessons directly from scriptural texts, making it ideal for seminary students, biblical scholars, pastors, and anyone passionate about understanding Scripture in its original languages.

### Core Features
- 📖 Daily curated readings from Hebrew, Greek, and Aramaic texts
- 🎯 Context-driven learning with real scriptural passages
- 🔊 Audio pronunciations and transliterations
- 📚 Comprehensive vocabulary builder with flashcards
- 🎨 Beautiful, user-friendly interface with dark mode support
- 🔄 Progress tracking across all languages
- 💎 Free trial access with premium subscription options
- 🌍 Offline access to downloaded content

### Target Audience
- Seminary students
- Biblical scholars
- Pastors and clergy
- Bible study groups
- Language enthusiasts
- Theological researchers

---

## 🏷️ Version History

### Version 1.0.0 (Current)
**Release Date:** TBD  
**Version Code:** 1  
**Build Type:** Production Release  
**APK Size:** ~160-170 MB

#### ✨ Features
- Initial release with full language learning platform
- Support for Hebrew, Greek, and Aramaic
- User authentication and profile management
- Subscription system with free trial (January 1 - March 31, 2026)
- Daily reading sections with audio support
- Vocabulary builder and flashcard system
- Progress tracking and achievements
- Dark mode and light mode themes
- Offline content access
- Push notifications for daily content

#### 🔧 Technical Details
- **React Native Version:** Expo SDK 54.0.21
- **TypeScript Version:** 5.9.2
- **Node.js Version:** 20.x
- **Minimum Android Version:** 7.0 (API 24)
- **Target Android Version:** Latest stable
- **Architecture:** New Architecture enabled
- **Signing:** Production keystore (10,000 day validity)

#### 📦 Build Configuration
- **Package Name:** org.tniglobal.rhapsodylanguages
- **Keystore Alias:** bouquet-key-alias
- **Gradle Version:** 8.14.3
- **JVM Heap Size:** 4GB
- **Minify:** Disabled (for initial release)
- **Shrink Resources:** Disabled (for initial release)

#### 🔐 Security
- Secure authentication with JWT tokens
- Encrypted local storage for sensitive data
- HTTPS-only API communication
- Certificate pinning (optional for future)

#### 🌐 Backend
- **API Base URL:** https://mediathek.tniglobal.org/api
- **Authentication:** Bearer token based
- **Token Refresh:** Automatic with 1-hour expiry
- **Free Trial System:** Backend-managed activation

---

## 📝 Release Checklist Template

Use this checklist for each new release:

### Pre-Release
- [ ] Update version in `android/app/build.gradle`
  - [ ] Increment `versionCode` by 1
  - [ ] Update `versionName` (semantic versioning)
- [ ] Test on physical devices (minimum 3 different devices)
- [ ] Verify all features working in production mode
- [ ] Check for memory leaks or performance issues
- [ ] Run TypeScript type checking: `npm run type-check`
- [ ] Run linting: `npm run lint`
- [ ] Test authentication flow (sign up, sign in, password reset)
- [ ] Test subscription flow (free trial activation, premium upgrade)
- [ ] Verify offline functionality
- [ ] Test dark mode and light mode
- [ ] Update changelog below in this document

### Release
- [ ] Commit version bump: `git commit -m "chore: bump version to X.Y.Z"`
- [ ] Push to main branch: `git push origin main`
- [ ] Create git tag: `git tag vX.Y.Z`
- [ ] Push tag: `git push origin vX.Y.Z`
- [ ] Monitor GitHub Actions workflow
- [ ] Verify APK uploaded to TNI App Store
- [ ] Test download and installation from TNI App Store

### Post-Release
- [ ] Download APK from TNI App Store and test installation
- [ ] Verify users receive update notification
- [ ] Monitor crash reports (if crash reporting implemented)
- [ ] Monitor user feedback and reviews
- [ ] Update this document with actual release date
- [ ] Create release announcement (if applicable)
- [ ] Update internal documentation (if needed)

---

## 🔄 Changelog

### [1.0.0] - TBD
#### Added
- Initial release of Rhapsody Languages
- Complete language learning platform for Hebrew, Greek, and Aramaic
- User authentication system with email verification
- Password reset with 6-digit verification code
- Subscription management with Stripe integration
- Free trial period (January 1 - March 31, 2026)
- Daily reading sections with curated content
- Audio pronunciations for all texts
- Vocabulary builder with flashcard system
- Progress tracking across all languages
- Dark mode and light mode support
- Offline content access
- Push notifications for daily content updates
- Beautiful, responsive UI with NativeWind (Tailwind CSS)

#### Technical
- Expo SDK 54.0.21 with New Architecture
- TypeScript 5.9.2 for type safety
- React Native navigation with expo-router
- Secure token-based authentication
- Automated CI/CD with GitHub Actions
- TNI App Store publishing automation
- Production signing configuration

---

## 📊 Build Information

### Current Build (v1.0.0)
```
Package Name:    org.tniglobal.rhapsodylanguages
Version Name:    1.0.0
Version Code:    1
Build Date:      TBD
Build Type:      Release
Signing:         Production keystore
APK Size:        ~160-170 MB
Min SDK:         API 24 (Android 7.0)
Target SDK:      Latest stable
```

### Keystore Information
```
File:            android/app/bouquet-release.keystore
Alias:           bouquet-key-alias
Validity:        10,000 days
Algorithm:       RSA 2048-bit
Certificate:     CN=TNI Global, OU=Rhapsody Languages
```

### Environment Variables
```
REACT_NATIVE_RELEASE_LEVEL: stable
GRADLE_OPTS:                -Xmx4096m -XX:MaxMetaspaceSize=1024m
```

---

## 🚀 Distribution Channels

### Primary: TNI App Store
- **URL:** https://standardapi.tniglobal.org
- **Publishing:** Automated via GitHub Actions
- **Trigger:** Git tags (v*.*.*)
- **Updates:** Automatic push notifications to users

### Secondary: GitHub Releases
- **URL:** https://github.com/Firstladydoxa/bouquet-native-app/releases
- **Purpose:** Backup distribution and direct downloads
- **APK Artifacts:** Stored for 90 days in GitHub Actions

---

## 🎯 Future Roadmap

### Planned Features (v1.1.0)
- [ ] Enhanced vocabulary quiz system
- [ ] Community discussion forums
- [ ] User-generated content sharing
- [ ] Advanced search and filtering
- [ ] Bookmarks and favorites sync
- [ ] Study streak tracking with rewards
- [ ] Multiple device synchronization

### Planned Features (v1.2.0)
- [ ] Video lessons and tutorials
- [ ] Live online classes integration
- [ ] Peer-to-peer learning features
- [ ] AI-powered pronunciation feedback
- [ ] Handwriting recognition for Hebrew/Greek
- [ ] Customizable learning paths

### Technical Improvements
- [ ] Enable ProGuard minification
- [ ] Implement resource shrinking
- [ ] Add crash reporting (Sentry/Crashlytics)
- [ ] Performance monitoring
- [ ] A/B testing framework
- [ ] Analytics integration
- [ ] Automated screenshot testing
- [ ] End-to-end test suite

---

## 📞 Support & Contact

### Development Team
- **Repository:** https://github.com/Firstladydoxa/bouquet-native-app
- **Issue Tracker:** GitHub Issues
- **Documentation:** Repository README.md and guides

### TNI App Store
- **API Documentation:** Contact admin
- **Support:** TNI technical support
- **Publishing Issues:** Contact TNI App Store administrator

### User Support
- **In-App Support:** Settings → Help & Support
- **Email:** [Configure support email]
- **FAQ:** [Configure FAQ URL]

---

## 📈 Analytics & Metrics

### Key Performance Indicators (KPIs)
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Free Trial Conversion Rate
- Average Session Duration
- User Retention (Day 1, Day 7, Day 30)
- Lesson Completion Rate
- Vocabulary Mastery Rate

### Technical Metrics
- App Crash Rate
- API Response Time
- App Launch Time
- Memory Usage
- Battery Usage
- Network Usage

---

## 🔒 Security & Privacy

### Data Collection
- User account information (email, name)
- Learning progress and statistics
- Device information (for analytics)
- Subscription status and payment history

### Data Storage
- Local: Encrypted with expo-secure-store
- Remote: Secure backend API (HTTPS)
- Payment: Stripe (PCI DSS compliant)

### Privacy Policy
- [Link to privacy policy]
- GDPR compliant
- Data deletion available on request

---

## 🛠️ Maintenance Schedule

### Regular Updates
- **Security Patches:** As needed
- **Feature Updates:** Monthly
- **Bug Fixes:** Weekly (critical), Bi-weekly (minor)

### Free Trial Period Updates
- **Current Period:** January 1, 2026 - March 31, 2026
- **Configuration:** `constants/theme.ts` → FREE_TRIAL_DATES
- **Update Process:** Modify constant, rebuild, republish

---

## 📋 Notes for Next Release

### Version 1.0.1 Planning
- [ ] Address user feedback from v1.0.0
- [ ] Fix any critical bugs discovered
- [ ] Performance optimizations based on analytics
- [ ] Update free trial dates if needed
- [ ] Review and update dependencies

### Known Issues (v1.0.0)
- None yet (track here as they are discovered)

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Maintained By:** Development Team  
**Review Frequency:** After each release
