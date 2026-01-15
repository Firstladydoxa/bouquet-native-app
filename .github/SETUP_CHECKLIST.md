# ✅ CI/CD Setup Checklist

Use this checklist to ensure your CI/CD pipeline is properly configured.

## 🔧 Initial Setup

### 1. Expo Account Configuration
- [ ] Have an active Expo account
- [ ] Project is configured in EAS
- [ ] Run `npx eas login` and verify authentication
- [ ] Run `npx eas build:configure` (if not already done)

### 2. GitHub Repository Setup
- [ ] Repository is created on GitHub
- [ ] Local repository is linked to GitHub remote
- [ ] `.github/workflows/` directory exists with workflow files
- [ ] All workflow files are committed and pushed

### 3. GitHub Secrets Configuration
- [ ] Create Expo access token: `npx eas token:create`
- [ ] Add `EXPO_TOKEN` to GitHub Secrets
  - Navigate to: Settings → Secrets and variables → Actions
  - Click "New repository secret"
  - Name: `EXPO_TOKEN`
  - Value: [Your token]
  - Click "Add secret"

### 4. Verify Configuration Files

#### app.json
- [ ] Contains correct EAS project ID:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "db9ffcb6-4073-4446-81b5-9d75cfee48fa"
      }
    }
  }
}
```

#### eas.json
- [ ] Build profiles are configured (development, preview, production)
- [ ] Android build type is set to "apk"

#### package.json
- [ ] Contains build scripts:
  - `build:dev`
  - `build:preview`
  - `build:apk`

## 🧪 Testing Your Setup

### Test 1: Verify Expo Token
```bash
# This should show your Expo username
npx eas whoami
```
- [ ] Command succeeds and shows your username

### Test 2: Manual Workflow Trigger
1. Go to GitHub Actions tab
2. Select "Preview Build (On Demand)"
3. Click "Run workflow"
4. Select branch: main
5. Click "Run workflow"
- [ ] Workflow starts successfully
- [ ] No immediate errors in logs
- [ ] Build appears on EAS dashboard

### Test 3: Automatic Trigger
```bash
git add .
git commit -m "test: trigger CI/CD"
git push origin main
```
- [ ] "Build Android APK" workflow triggers automatically
- [ ] "Lint and Type Check" workflow triggers automatically
- [ ] Both workflows complete successfully

### Test 4: Version Tag Release
```bash
git tag v0.0.1-test
git push origin v0.0.1-test
```
- [ ] "Release Production Build" workflow triggers
- [ ] Build completes successfully
- [ ] GitHub Release is created
- [ ] APK is attached to release
- [ ] Can delete test tag after verification: `git tag -d v0.0.1-test && git push origin :refs/tags/v0.0.1-test`

## 📋 Workflow Verification

### Check Each Workflow File Exists
- [ ] `.github/workflows/build-android.yml`
- [ ] `.github/workflows/eas-build-and-submit.yml`
- [ ] `.github/workflows/lint-and-test.yml`
- [ ] `.github/workflows/preview-build.yml`
- [ ] `.github/workflows/release.yml`
- [ ] `.github/workflows/version-bump.yml`
- [ ] `.github/workflows/distribute-apk.yml`

### Verify Workflow Permissions
- [ ] Go to Settings → Actions → General
- [ ] "Workflow permissions" is set to "Read and write permissions"
- [ ] "Allow GitHub Actions to create and approve pull requests" is checked

## 🎯 Production Readiness

### Documentation
- [ ] `CI_CD_GUIDE.md` is reviewed and updated
- [ ] `.github/QUICK_START.md` is accessible
- [ ] `.github/WORKFLOWS.md` is complete
- [ ] README.md mentions CI/CD setup (optional)

### Environment Variables
- [ ] `.env` file is in `.gitignore`
- [ ] No sensitive data in committed files
- [ ] Environment variables are managed through Expo/EAS

### Build Configuration
- [ ] Android package name is correct in `app.json`
- [ ] App version is set correctly
- [ ] Icons and splash screens are configured
- [ ] App permissions are properly set

## 🚀 First Production Release

### Prepare for Release
- [ ] Code is stable and tested
- [ ] All dependencies are up to date
- [ ] Version number is decided (e.g., 1.0.0)
- [ ] Release notes are prepared

### Create Release
Choose one method:

**Method A: Automated**
1. Go to Actions → "Auto Version Bump"
2. Run workflow with version type
- [ ] Executed successfully

**Method B: Manual**
```bash
npm version major  # or minor, patch
git push && git push --tags
```
- [ ] Executed successfully

### Verify Release
- [ ] Check Actions tab - "Release Production Build" completed
- [ ] Check Releases tab - New release exists
- [ ] Download and test APK
- [ ] APK installs on Android device
- [ ] App launches and works correctly

## 🔄 Ongoing Maintenance

### Weekly Tasks
- [ ] Review Dependabot PRs
- [ ] Check for failed workflows
- [ ] Monitor EAS build quotas

### Monthly Tasks
- [ ] Review and clean old artifacts
- [ ] Update documentation if needed
- [ ] Rotate Expo tokens (optional)

### Per-Release Tasks
- [ ] Test preview build before production
- [ ] Update release notes
- [ ] Verify APK works on multiple devices
- [ ] Archive important builds

## 🆘 Troubleshooting Reference

### If Builds Fail
1. Check GitHub Actions logs
2. Check EAS dashboard logs
3. Verify secrets are set correctly
4. Review recent code changes
5. Check Expo service status

### If Token Issues
```bash
# Generate new token
npx eas token:create

# Update in GitHub Secrets
# Settings → Secrets → Update EXPO_TOKEN
```

### If Version Conflicts
```bash
# Manual version update
npm version patch --no-git-tag-version
# Update app.json version manually
git add package.json app.json
git commit -m "chore: bump version"
```

## ✅ Setup Complete!

Once all items are checked:
- [ ] Setup is complete
- [ ] Team is trained on CI/CD usage
- [ ] Documentation is accessible
- [ ] Emergency contacts are documented

---

**Setup Date:** _______________  
**Verified By:** _______________  
**Next Review:** _______________

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Forum](https://forums.expo.dev/)
- [Full CI/CD Guide](../CI_CD_GUIDE.md)

---

**Questions or Issues?**  
Create an issue in this repository or contact the development team.
