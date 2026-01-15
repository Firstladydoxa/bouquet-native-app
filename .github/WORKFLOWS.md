# 🚀 GitHub Actions CI/CD Workflows

## Overview

This repository includes a comprehensive CI/CD pipeline using GitHub Actions for automated building, testing, and deployment of the Rhapsody Languages mobile app.

## 📋 Available Workflows

### 🏗️ Build Workflows

| Workflow | Trigger | Purpose | Artifact Retention |
|----------|---------|---------|-------------------|
| **Build Android APK** | Push/PR to main/develop, Manual | Quick build check | N/A (doesn't wait) |
| **EAS Build and Submit** | Tag push (v*.*.*), Manual | Full build with download | 30 days |
| **Preview Build** | Manual only | On-demand testing builds | 14 days |
| **Release Production** | Tag push (v*.*.*), Manual | Production releases | 90 days |
| **Distribute APK** | Manual only | Build & share for testing | 30 days |

### 🧪 Quality Assurance

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Lint and Type Check** | Push/PR to main/develop | Code quality checks |

### 🔧 Utilities

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Auto Version Bump** | Manual only | Automated versioning |
| **Dependabot** | Weekly | Dependency updates |

## 🎯 Common Use Cases

### 1. Creating a Production Release

**Method A: Automated Version Bump**
```bash
# Go to Actions → Auto Version Bump → Run workflow
# Select: patch/minor/major
# The workflow will automatically:
# - Update version in package.json and app.json
# - Create git tag
# - Trigger production build
# - Create GitHub Release
```

**Method B: Manual Versioning**
```bash
npm version patch  # or minor, major
git push && git push --tags
# Release workflow automatically triggers
```

### 2. Testing Before Release (Preview Build)

```bash
# Go to Actions → Preview Build → Run workflow
# Wait 15-20 minutes
# Download APK from Artifacts
# Test on device
```

### 3. Distributing to Testers

```bash
# Go to Actions → Distribute APK → Run workflow
# Add distribution message
# Share the download link with testers
```

### 4. Quick Development Check

```bash
git push origin develop
# Build Android APK workflow runs automatically
# Check EAS dashboard for build status
```

## 🔐 Required Setup

### 1. Expo Token

Get your token:
```bash
npx eas login
npx eas token:create
```

Add to GitHub:
1. Go to: Settings → Secrets and variables → Actions
2. New repository secret: `EXPO_TOKEN`
3. Paste your token

### 2. EAS Project Configuration

Ensure `app.json` has:
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

## 📦 Build Profiles

| Profile | Use Case | Build Time | Output |
|---------|----------|------------|--------|
| `development` | Dev testing with expo-dev-client | ~15 min | APK |
| `preview` | Internal testing | ~20 min | APK |
| `production` | Public release | ~30 min | APK |

## 🔄 Workflow Details

### Build Android APK
- **File:** `.github/workflows/build-android.yml`
- **When:** Every push/PR to main or develop
- **Purpose:** Quick CI check, starts build but doesn't wait
- **Output:** Build started notification

### EAS Build and Submit
- **File:** `.github/workflows/eas-build-and-submit.yml`
- **When:** Version tags (v1.0.0) or manual
- **Purpose:** Complete build with artifact download
- **Output:** APK artifact, optional GitHub Release

### Preview Build
- **File:** `.github/workflows/preview-build.yml`
- **When:** Manual dispatch only
- **Purpose:** On-demand preview builds for testing
- **Output:** Preview APK artifact (14 days)

### Release Production
- **File:** `.github/workflows/release.yml`
- **When:** Version tags or manual with version input
- **Purpose:** Production releases with full documentation
- **Output:** GitHub Release with APK, 90-day artifact

### Distribute APK
- **File:** `.github/workflows/distribute-apk.yml`
- **When:** Manual dispatch only
- **Purpose:** Build and create distribution package for testers
- **Output:** APK with distribution documentation

### Lint and Type Check
- **File:** `.github/workflows/lint-and-test.yml`
- **When:** Every push/PR
- **Purpose:** Code quality validation
- **Output:** ESLint and TypeScript check results

### Auto Version Bump
- **File:** `.github/workflows/version-bump.yml`
- **When:** Manual dispatch only
- **Purpose:** Automated version management
- **Output:** Updated version, new tag, triggered release

## 📥 Downloading APKs

### From GitHub Releases
1. Go to [Releases](../../releases)
2. Find your version
3. Download APK from Assets

### From GitHub Actions
1. Go to [Actions](../../actions)
2. Click on completed workflow
3. Scroll to Artifacts
4. Download APK

### From EAS Dashboard
1. Visit [EAS Builds](https://expo.dev/accounts/[your-account]/projects/tni-bouquetapps-reactnative/builds)
2. Find your build
3. Click Download

## 🛠️ Troubleshooting

### Build Fails

**Check these first:**
1. Verify `EXPO_TOKEN` is valid: `npx eas whoami`
2. Check GitHub Actions logs
3. Review EAS build logs: `npx eas build:list`

**Common issues:**
- Token expired → Regenerate and update secret
- Dependency conflicts → Check package.json
- Build timeout → EAS servers may be busy

### No Artifact Available

**Possible reasons:**
- Build still in progress (check EAS dashboard)
- Build failed (check logs)
- Artifact expired (check retention period)

### Version Conflicts

If version bump fails:
```bash
# Manually update version
npm version patch --no-git-tag-version
git add package.json app.json
git commit -m "chore: bump version"
git push
```

## 📊 Monitoring

### Check Build Status
```bash
# View recent builds
npx eas build:list

# View specific build
npx eas build:view <build-id>
```

### Dashboards
- **GitHub Actions:** [Actions Tab](../../actions)
- **EAS Builds:** [Expo Dashboard](https://expo.dev/accounts/[your-account]/projects/tni-bouquetapps-reactnative/builds)
- **Releases:** [Releases Tab](../../releases)

## 🎓 Best Practices

1. **Use semantic versioning:** v1.2.3 (major.minor.patch)
2. **Test with preview builds** before production releases
3. **Keep release notes** informative and detailed
4. **Monitor build times** and optimize if needed
5. **Download important APKs** before retention expires
6. **Update dependencies** regularly via Dependabot

## 🔗 Additional Resources

- [Full CI/CD Guide](./CI_CD_GUIDE.md)
- [Quick Start Guide](./.github/QUICK_START.md)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

## 📞 Support

- **Issues:** [GitHub Issues](../../issues)
- **Discussions:** [GitHub Discussions](../../discussions)
- **Expo Community:** [Expo Forums](https://forums.expo.dev/)

---

**Last Updated:** January 15, 2026
**Maintained by:** TNI Development Team
