# TNI App Store Automation - Implementation Summary

## ✅ Completed Tasks

### 1. Package Name Update
- **Old:** `com.firstlady.tnibouquetappsreactnative`
- **New:** `org.tniglobal.rhapsodylanguages`
- **Files Updated:**
  - [app.json](app.json#L23)
  - [android/app/build.gradle](android/app/build.gradle#L101-L102)

### 2. Production Keystore
- **Generated:** `android/app/bouquet-release.keystore`
- **Details:**
  - Algorithm: RSA 2048-bit
  - Validity: 10,000 days
  - Alias: `bouquet-key-alias`
  - Password: `bouquet2026` (both store and key)
  - Certificate: CN=TNI Global, OU=Rhapsody Languages
- **Base64 Encoded:** Ready for GitHub Secret `KEYSTORE_FILE`
- **Signing Config:** Added to [android/app/build.gradle](android/app/build.gradle#L112-L128)

### 3. TNI App Store Workflow
- **Created:** [.github/workflows/publish-to-appstore.yml](.github/workflows/publish-to-appstore.yml)
- **Trigger:** Git tags (e.g., `v1.0.0`, `v1.0.1`)
- **Features:**
  - Automated APK building with Expo prebuild
  - Production signing with keystore
  - Auto-extraction of version info from build.gradle
  - Publishing to TNI App Store API
  - GitHub Release creation with APK attachment
  - APK artifact upload (90-day retention)
  - Automatic cleanup of sensitive files

### 4. App Metadata
Configured in workflow file:
- **Category:** Education
- **Short Description:** "Learn Biblical Hebrew, Koine Greek, and Aramaic through immersive, context-driven lessons from the Scriptures"
- **Full Description:** Comprehensive feature list with emojis
- **Auto-Detected:** Package name, version, app name from build files

### 5. Documentation
Created three comprehensive guides:

#### [TNI_APP_STORE_SETUP.md](TNI_APP_STORE_SETUP.md)
- Complete GitHub Secrets setup guide
- Step-by-step publishing instructions
- Security best practices
- Troubleshooting section
- Quick reference tables

#### [RELEASE_NOTES.md](RELEASE_NOTES.md)
- App information and features
- Version history template (v1.0.0 structure)
- Release checklist for each version
- Build configuration details
- Future roadmap planning
- Support and contact information

#### Updated [.gitignore](.gitignore)
- Added keystore files exclusion
- Added `keystore-base64.txt` exclusion

### 6. Free Trial Dates Centralization
- **Created Constant:** `FREE_TRIAL_DATES` in [constants/theme.ts](constants/theme.ts)
- **Period:** January 1, 2026 - March 31, 2026
- **Updated Components (8 files):**
  - [components/home/PromotionalBanner.tsx](components/home/PromotionalBanner.tsx)
  - [components/ui/StartFreeTrialButton.tsx](components/ui/StartFreeTrialButton.tsx)
  - [components/ui/FreeTrialActivatedBadge.tsx](components/ui/FreeTrialActivatedBadge.tsx)
  - [components/ui/FreeTrialWidget.tsx](components/ui/FreeTrialWidget.tsx)
  - [services/subscriptionService.tsx](services/subscriptionService.tsx)
  - [app/(rhapsodylanguages)/(drawer)/(tabs)/daily/index.tsx](app/(rhapsodylanguages)/(drawer)/(tabs)/daily/index.tsx)
  - [contexts/SubscriptionContext.tsx](contexts/SubscriptionContext.tsx)

### 7. Git Commit & Push
- **Commit:** `06b68d8` - "feat: centralize free trial dates and implement TNI App Store automation"
- **Pushed to:** `origin/main`
- **Files Changed:** 14 files (10 modified, 4 added)

---

## 🔐 Next Steps: Configure GitHub Secrets

You need to add **6 secrets** to your GitHub repository:

### Navigate to Repository Settings
```
https://github.com/Firstladydoxa/bouquet-native-app/settings/secrets/actions
```

### Add These Secrets

1. **APPSTORE_API_KEY**
   - **Action:** Contact TNI App Store administrator to obtain API key
   - **Format:** Bearer token or API key string

2. **APPSTORE_API_URL**
   - **Value:** `https://standardapi.tniglobal.org/api/v1`
   - **Action:** Add exactly as shown

3. **KEYSTORE_FILE**
   - **Value:** The base64 string (3776 bytes)
   - **Location:** Was in `keystore-base64.txt` (now deleted for security)
   - **Action:** You need to regenerate it:
     ```powershell
     cd C:\Users\teudo\Documents\TNI\bouquet-native-app
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\bouquet-release.keystore")) | Set-Content keystore-base64.txt -NoNewline
     ```
   - Then copy the contents and add as secret
   - Then delete `keystore-base64.txt` again

4. **KEYSTORE_PASSWORD**
   - **Value:** `bouquet2026`

5. **KEY_ALIAS**
   - **Value:** `bouquet-key-alias`

6. **KEY_PASSWORD**
   - **Value:** `bouquet2026`

---

## 🚀 How to Publish Your First Release

Once secrets are configured:

### Step 1: Test Local Build (Optional but Recommended)
```powershell
cd C:\Users\teudo\Documents\TNI\bouquet-native-app\android
.\gradlew assembleRelease
```

### Step 2: Create Version Tag
```powershell
cd C:\Users\teudo\Documents\TNI\bouquet-native-app
git tag v1.0.0
git push origin v1.0.0
```

### Step 3: Monitor Workflow
1. Go to: https://github.com/Firstladydoxa/bouquet-native-app/actions
2. Watch "Publish to TNI App Store" workflow
3. Wait ~15-20 minutes for build completion

### Step 4: Verify Success
- ✅ GitHub Actions workflow completes successfully
- ✅ APK uploaded to TNI App Store
- ✅ GitHub Release created at: https://github.com/Firstladydoxa/bouquet-native-app/releases
- ✅ APK artifact available for download

---

## 📊 What Was Automated

### Before (Manual Process)
1. ❌ Manual version updates in multiple files
2. ❌ Local APK building
3. ❌ Manual keystore signing
4. ❌ Manual upload to app store
5. ❌ Manual versioning and release notes
6. ❌ Time: 30-60 minutes per release

### After (Automated)
1. ✅ Update version in one file (`build.gradle`)
2. ✅ Push git tag
3. ✅ Everything else automated:
   - APK building
   - Production signing
   - TNI App Store publishing
   - GitHub Release creation
   - Version extraction
   - Artifact storage
4. ✅ Time: 0 minutes (just push a tag!)

---

## 📁 File Structure Summary

```
bouquet-native-app/
├── .github/
│   └── workflows/
│       └── publish-to-appstore.yml         [NEW] Automation workflow
├── android/
│   └── app/
│       ├── bouquet-release.keystore        [NEW] Production keystore
│       └── build.gradle                    [MODIFIED] Package name + signing
├── app.json                                [MODIFIED] Package name updated
├── constants/
│   └── theme.ts                            [MODIFIED] FREE_TRIAL_DATES added
├── components/                             [MODIFIED] 6 files updated for dates
├── services/
│   └── subscriptionService.tsx             [MODIFIED] Uses centralized dates
├── contexts/
│   └── SubscriptionContext.tsx             [MODIFIED] Date validation
├── TNI_APP_STORE_SETUP.md                  [NEW] Setup documentation
├── RELEASE_NOTES.md                        [NEW] Release tracking
└── .gitignore                              [MODIFIED] Keystore exclusions
```

---

## 🎯 Key Benefits

1. **Zero-Touch Publishing:** Just push a tag, automation handles the rest
2. **Consistent Dates:** All free trial dates centralized in one constant
3. **Professional Signing:** Production keystore with 10,000 day validity
4. **Version Control:** Full history of all releases on GitHub
5. **Security:** Keystore and API keys stored as GitHub Secrets
6. **Documentation:** Comprehensive guides for future maintenance
7. **Backup Distribution:** APKs stored in GitHub Releases as backup

---

## ⚠️ Important Reminders

1. **Get API Key:** Contact TNI App Store admin for `APPSTORE_API_KEY`
2. **Add All Secrets:** All 6 must be configured before first publish
3. **Never Commit Keystore:** Already in `.gitignore`, but be careful
4. **Update RELEASE_NOTES.md:** After each release, update changelog
5. **Test Workflow:** Consider using workflow_dispatch trigger to test before tagging
6. **Keystore Backup:** Store `bouquet-release.keystore` securely (NOT in git)

---

## 📞 Support References

- **Setup Guide:** [TNI_APP_STORE_SETUP.md](TNI_APP_STORE_SETUP.md)
- **Release Tracking:** [RELEASE_NOTES.md](RELEASE_NOTES.md)
- **Workflow File:** [.github/workflows/publish-to-appstore.yml](.github/workflows/publish-to-appstore.yml)
- **Quick Start:** [DEVELOPER-QUICK-START.md](DEVELOPER-QUICK-START.md)
- **GitHub Actions:** https://github.com/Firstladydoxa/bouquet-native-app/actions

---

**Implementation Date:** January 2026  
**Status:** ✅ Complete - Ready for secrets configuration  
**Next Action:** Add 6 GitHub Secrets, then test with `v1.0.0` tag
