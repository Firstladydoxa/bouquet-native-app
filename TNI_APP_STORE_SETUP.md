# TNI App Store Publishing Setup Guide

This guide walks you through setting up automated publishing to the TNI App Store for Rhapsody Languages.

## 📋 Prerequisites

- GitHub repository with admin access
- Access to TNI App Store admin portal (for API credentials)
- Generated Android keystore (already created: `android/app/bouquet-release.keystore`)

## 🔐 Required GitHub Secrets

You must add **6 secrets** to your GitHub repository. Navigate to:
```
Settings → Secrets and variables → Actions → New repository secret
```

### 1. APPSTORE_API_KEY
**Value:** Your TNI App Store API authentication key  
**How to get:** Contact TNI App Store administrator  
**Example:** `tni_live_sk_1234567890abcdef...`

```
Name: APPSTORE_API_KEY
Value: [Request from TNI admin]
```

---

### 2. APPSTORE_API_URL
**Value:** `https://standardapi.tniglobal.org/api/v1`  
**Description:** Base URL for TNI App Store API

```
Name: APPSTORE_API_URL
Value: https://standardapi.tniglobal.org/api/v1
```

---

### 3. KEYSTORE_FILE
**Value:** Base64 encoded keystore file  
**Location:** The encoded keystore is saved in `keystore-base64.txt` (root directory)  
**How to use:** Copy the entire contents of `keystore-base64.txt`

```
Name: KEYSTORE_FILE
Value: [Copy entire contents from keystore-base64.txt]
```

⚠️ **Important:** 
- Do NOT commit `keystore-base64.txt` to git
- This file contains 3776 bytes of base64 text
- Copy the entire value without line breaks
- After adding the secret, delete `keystore-base64.txt` from your local machine

---

### 4. KEYSTORE_PASSWORD
**Value:** `bouquet2026`  
**Description:** Password for the keystore file

```
Name: KEYSTORE_PASSWORD
Value: bouquet2026
```

---

### 5. KEY_ALIAS
**Value:** `bouquet-key-alias`  
**Description:** Alias of the key within the keystore

```
Name: KEY_ALIAS
Value: bouquet-key-alias
```

---

### 6. KEY_PASSWORD
**Value:** `bouquet2026`  
**Description:** Password for the specific key (same as keystore password)

```
Name: KEY_PASSWORD
Value: bouquet2026
```

---

## ✅ Verification Checklist

After adding all secrets, verify:

- [ ] All 6 secrets are added to GitHub repository
- [ ] Secret names match exactly (case-sensitive)
- [ ] `APPSTORE_API_KEY` obtained from TNI admin
- [ ] `KEYSTORE_FILE` contains full base64 content from `keystore-base64.txt`
- [ ] Keystore passwords are correct (`bouquet2026`)
- [ ] `keystore-base64.txt` is deleted from local machine
- [ ] `keystore-base64.txt` is added to `.gitignore`

---

## 🚀 How to Publish a New Version

Once secrets are configured, publishing is fully automated:

### Step 1: Update Version
Edit `android/app/build.gradle`:
```groovy
defaultConfig {
    versionCode 2           // Increment by 1
    versionName "1.0.1"     // Update semantic version
}
```

### Step 2: Commit and Push
```bash
git add android/app/build.gradle
git commit -m "chore: bump version to 1.0.1"
git push origin main
```

### Step 3: Create and Push Tag
```bash
git tag v1.0.1
git push origin v1.0.1
```

### Step 4: Wait for Automation
- GitHub Actions automatically triggers
- Builds release APK with signing
- Publishes to TNI App Store
- Creates GitHub Release
- Uploads APK artifact

**That's it!** 🎉

---

## 📊 Monitoring Builds

### View GitHub Actions
1. Go to repository → Actions tab
2. Click on "Publish to TNI App Store" workflow
3. View build logs and status

### Successful Build Indicators
- ✅ All workflow steps complete (green checkmarks)
- ✅ APK artifact uploaded to GitHub
- ✅ GitHub Release created with APK
- ✅ TNI App Store API returns success

### Common Issues

#### Build Fails: "Secret not found"
**Solution:** Verify all 6 secrets are added correctly in GitHub settings

#### Build Fails: "Keystore error"
**Solution:** Regenerate base64 keystore and update `KEYSTORE_FILE` secret

#### TNI App Store API Error
**Solution:** 
1. Check `APPSTORE_API_KEY` is valid (contact admin)
2. Verify `APPSTORE_API_URL` is correct
3. Check API logs for specific error messages

#### Gradle Build Fails
**Solution:**
1. Test locally: `cd android && ./gradlew assembleRelease`
2. Check for TypeScript/ESLint errors
3. Verify all dependencies installed

---

## 🔒 Security Best Practices

### DO:
- ✅ Keep keystore passwords secure
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate API keys periodically
- ✅ Limit repository access to trusted developers
- ✅ Delete `keystore-base64.txt` after uploading secret

### DON'T:
- ❌ Commit keystore files to git
- ❌ Share keystore passwords in plaintext
- ❌ Commit `keystore-base64.txt` to repository
- ❌ Expose API keys in logs or code
- ❌ Use debug keystore for production releases

---

## 📱 App Store Metadata

The workflow automatically sends this information to TNI App Store:

### Auto-Detected (from build.gradle)
- **Package Name:** `org.tniglobal.rhapsodylanguages`
- **App Name:** Rhapsody Languages
- **Version Name:** 1.0.0 (from versionName)
- **Version Code:** 1 (from versionCode)

### Configured (in workflow file)
- **Category:** Education
- **Short Description:** "Learn Biblical Hebrew, Koine Greek, and Aramaic..."
- **Full Description:** Multi-line feature list (see workflow file)

### To Update Metadata
Edit `.github/workflows/publish-to-appstore.yml`:
```yaml
env:
  APP_CATEGORY: "Education"
  APP_SHORT_DESC: "Your new short description"
  APP_FULL_DESC: |
    Your new full description
    with multiple lines
```

---

## 🆘 Support

### GitHub Actions Issues
- Check: `.github/workflows/publish-to-appstore.yml`
- Logs: Repository → Actions → Select workflow run

### TNI App Store Issues
- Contact: TNI App Store administrator
- API Docs: Request from admin
- Status Page: Check TNI infrastructure status

### Build/Signing Issues
- Keystore docs: `android/app/build.gradle` comments
- Gradle docs: `android/gradle.properties`
- Signing guide: React Native docs

---

## 📝 Notes

- **Build Time:** ~15-20 minutes on GitHub Actions
- **APK Size:** ~160-170 MB (includes all assets)
- **Supported Android:** API 24+ (Android 7.0+)
- **Keystore Validity:** 10,000 days from creation
- **Free Trial:** January 1, 2026 - March 31, 2026

---

## 🎯 Quick Reference

### Secrets Summary
| Secret | Value | Source |
|--------|-------|--------|
| `APPSTORE_API_KEY` | API key | TNI admin |
| `APPSTORE_API_URL` | `https://standardapi.tniglobal.org/api/v1` | Fixed |
| `KEYSTORE_FILE` | Base64 string | `keystore-base64.txt` |
| `KEYSTORE_PASSWORD` | `bouquet2026` | Fixed |
| `KEY_ALIAS` | `bouquet-key-alias` | Fixed |
| `KEY_PASSWORD` | `bouquet2026` | Fixed |

### Publishing Commands
```bash
# Update version in build.gradle, then:
git add android/app/build.gradle
git commit -m "chore: bump version to X.Y.Z"
git push origin main
git tag vX.Y.Z
git push origin vX.Y.Z
```

### Files to Never Commit
- `android/app/bouquet-release.keystore` (already in `.gitignore`)
- `keystore-base64.txt` (add to `.gitignore`)
- `android/keystore.properties` (created during CI, auto-cleaned)

---

**Last Updated:** January 2026  
**App Version:** 1.0.0  
**Package Name:** org.tniglobal.rhapsodylanguages
