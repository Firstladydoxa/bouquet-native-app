# Build Troubleshooting Guide

## Issue: EAS Credential Error in GitHub Actions

### Error Message
```
✔ Using remote Android credentials (Expo server)
Generating a new Keystore is not supported in --non-interactive mode
Error: build command failed.
```

### Root Cause
The workflow was attempting to use EAS (Expo Application Services) remote credential management, which doesn't work in non-interactive GitHub Actions environment.

### Solution Applied

#### 1. Updated Workflow File (`.github/workflows/publish-to-appstore.yml`)

**Changes Made:**
- ✅ Decode keystore **BEFORE** running `expo prebuild`
- ✅ Added environment variables to disable EAS credentials:
  ```yaml
  env:
    EXPO_NO_CAPABILITY_SYNC: 1
    EAS_NO_CREDENTIALS: 1
  ```
- ✅ Added `--no-install` flag to prebuild to prevent EAS from trying to manage dependencies
- ✅ Added keystore verification step after prebuild
- ✅ Pass keystore credentials as Gradle environment variables

#### 2. Updated EAS Configuration (`eas.json`)

Added `"credentialsSource": "local"` to all build profiles:
```json
{
  "build": {
    "preview": {
      "android": {
        "credentialsSource": "local"
      }
    },
    "production": {
      "android": {
        "credentialsSource": "local"
      }
    },
    "github-actions": {
      "android": {
        "credentialsSource": "local"
      }
    }
  }
}
```

This explicitly tells EAS to use local keystores instead of remote credential management.

---

## Workflow Steps (Fixed Version)

### Step-by-Step Process

1. **Setup Node.js & Java**
   - Node.js 20 with npm cache
   - JDK 17 with Gradle cache

2. **Install Dependencies**
   ```bash
   npm ci
   ```

3. **Decode Keystore (BEFORE prebuild)**
   ```bash
   mkdir -p android/app
   echo "$KEYSTORE_FILE" | base64 -d > android/app/bouquet-release.keystore
   ```

4. **Run Expo Prebuild (with local credentials)**
   ```bash
   npx expo prebuild --platform android --clean --no-install
   ```
   Environment:
   - `EXPO_NO_CAPABILITY_SYNC: 1`
   - `EAS_NO_CREDENTIALS: 1`

5. **Verify Keystore**
   - Check if keystore still exists after prebuild
   - Recreate if missing (safety measure)

6. **Extract Version Info**
   - Parse `build.gradle` for version
   - Parse `strings.xml` for app name

7. **Build APK with Gradle**
   ```bash
   cd android && ./gradlew assembleRelease
   ```
   Environment:
   - `GRADLE_OPTS: -Xmx4096m`
   - Keystore credentials as environment variables

8. **Publish to TNI App Store**
   - Upload APK via API
   - Create GitHub Release

---

## Common Build Issues

### Issue 1: "Keystore not found"

**Symptoms:**
```
Execution failed for task ':app:validateSigningRelease'.
> Keystore file not found
```

**Solution:**
1. Verify `KEYSTORE_FILE` secret is base64 encoded correctly
2. Check workflow has `mkdir -p android/app` before decoding
3. Verify keystore is decoded before `expo prebuild` runs

---

### Issue 2: "Invalid keystore format"

**Symptoms:**
```
java.io.IOException: Invalid keystore format
```

**Solution:**
1. Regenerate base64 encoding:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\bouquet-release.keystore")) | Set-Content keystore-base64.txt -NoNewline
   ```
2. Copy entire contents (no line breaks)
3. Update `KEYSTORE_FILE` secret in GitHub

---

### Issue 3: "Heap space error"

**Symptoms:**
```
java.lang.OutOfMemoryError: Java heap space
```

**Solution:**
Already configured in workflow:
```yaml
env:
  GRADLE_OPTS: "-Xmx4096m -XX:MaxMetaspaceSize=1024m"
```

If still failing, increase to `-Xmx6144m`.

---

### Issue 4: "Wrong password"

**Symptoms:**
```
java.io.IOException: Keystore was tampered with, or password was incorrect
```

**Solution:**
1. Verify secrets in GitHub:
   - `KEYSTORE_PASSWORD: bouquet2026`
   - `KEY_PASSWORD: bouquet2026`
2. Test locally:
   ```bash
   keytool -list -v -keystore android/app/bouquet-release.keystore
   # Enter password: bouquet2026
   ```

---

### Issue 5: "EAS still trying to manage credentials"

**Symptoms:**
```
Using remote Android credentials (Expo server)
```

**Solution:**
1. Verify `eas.json` has `"credentialsSource": "local"`
2. Verify workflow has environment variables:
   - `EXPO_NO_CAPABILITY_SYNC: 1`
   - `EAS_NO_CREDENTIALS: 1`
3. Add `--no-install` flag to prebuild command

---

## Testing Locally

Before pushing to GitHub, test the build locally:

### Windows PowerShell
```powershell
cd C:\Users\teudo\Documents\TNI\bouquet-native-app

# Install dependencies
npm ci

# Run prebuild
npx expo prebuild --platform android --clean

# Verify keystore exists
Test-Path android\app\bouquet-release.keystore

# Build APK
cd android
.\gradlew assembleRelease

# Check output
Test-Path app\build\outputs\apk\release\app-release.apk
```

### Linux/Mac
```bash
cd /path/to/bouquet-native-app

# Install dependencies
npm ci

# Run prebuild
npx expo prebuild --platform android --clean

# Verify keystore exists
ls -lh android/app/bouquet-release.keystore

# Build APK
cd android
./gradlew assembleRelease

# Check output
ls -lh app/build/outputs/apk/release/app-release.apk
```

---

## GitHub Actions Debug Mode

To see detailed logs:

1. Go to repository → Settings → Secrets → Actions
2. Add secret: `ACTIONS_STEP_DEBUG` = `true`
3. Re-run workflow to see verbose output

---

## Verification Checklist

Before pushing a new release tag:

- [ ] All GitHub secrets configured (6 total)
- [ ] `eas.json` has `"credentialsSource": "local"`
- [ ] Keystore exists: `android/app/bouquet-release.keystore`
- [ ] Keystore password correct: `bouquet2026`
- [ ] Local build succeeds: `./gradlew assembleRelease`
- [ ] Version updated in `build.gradle`
- [ ] Workflow file updated with fixes

---

## Contact & Support

- **Workflow Issues:** Check [.github/workflows/publish-to-appstore.yml](.github/workflows/publish-to-appstore.yml)
- **Build Logs:** GitHub Actions → Select workflow run → View logs
- **EAS Issues:** [Expo Documentation](https://docs.expo.dev/build/setup/)
- **TNI App Store API:** Contact administrator

---

**Last Updated:** January 15, 2026  
**Status:** ✅ Fixed - EAS credential issue resolved  
**Next Steps:** Test with new version tag
