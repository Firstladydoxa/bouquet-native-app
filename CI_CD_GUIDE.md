# CI/CD Configuration Guide

## Overview

This repository uses GitHub Actions for automated building and deployment of the Rhapsody Languages React Native app.

## 🔧 Setup Instructions

### 1. Configure GitHub Secrets

You need to add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### Required Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `EXPO_TOKEN` | Expo access token for EAS builds | [Get from Expo Dashboard](https://expo.dev/accounts/[your-account]/settings/access-tokens) |

#### Optional Secrets (for Google Play submission)

| Secret Name | Description |
|------------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Play service account credentials |

### 2. Get Your Expo Token

1. Visit [Expo Access Tokens](https://expo.dev/settings/access-tokens)
2. Click **Create Token**
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token
5. Add it to GitHub Secrets as `EXPO_TOKEN`

### 3. Update EAS Project ID

Make sure your `app.json` has the correct EAS project ID:

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

## 📋 Available Workflows

### 1. **Build Android APK** (`.github/workflows/build-android.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual dispatch with profile selection

**What it does:**
- Builds Android APK using EAS
- Starts build but doesn't wait for completion (faster CI)
- Comments on PRs with build information

### 2. **EAS Build and Submit** (`.github/workflows/eas-build-and-submit.yml`)

**Triggers:**
- Git tags matching `v*.*.*` (e.g., `v1.0.0`)
- Manual dispatch

**What it does:**
- Builds Android APK and waits for completion
- Downloads the APK
- Uploads APK as GitHub artifact (30-day retention)
- Creates GitHub Release with APK attached (for tags)
- Optionally submits to Google Play Store

**Usage:**
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Or run manually from GitHub Actions tab
```

### 3. **Lint and Type Check** (`.github/workflows/lint-and-test.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests

**What it does:**
- Runs ESLint
- Runs TypeScript type checking
- Ensures code quality

### 4. **Preview Build** (`.github/workflows/preview-build.yml`)

**Triggers:**
- Manual dispatch only

**What it does:**
- Builds a preview APK on demand
- Uploads APK as artifact (14-day retention)
- Useful for testing before production release

### 5. **Release Production Build** (`.github/workflows/release.yml`)

**Triggers:**
- Git tags matching `v*.*.*`
- Manual dispatch with version input

**What it does:**
- Updates app version in `package.json`
- Builds production APK
- Creates GitHub Release with APK attached
- Retains artifact for 90 days
- Generates detailed release notes

## 🚀 Usage Examples

### Create a Production Release

**Option 1: Using Git Tags**
```bash
# Update version and create tag
npm version 1.0.0
git push && git push --tags
```

**Option 2: Manual Workflow**
1. Go to **Actions** tab
2. Select **Release Production Build**
3. Click **Run workflow**
4. Enter version number (e.g., `1.0.0`)
5. Click **Run workflow**

### Build a Preview

1. Go to **Actions** tab
2. Select **Preview Build (On Demand)**
3. Click **Run workflow**
4. Add optional build description
5. Click **Run workflow**
6. Download APK from artifacts once complete

### Check Build Status

All builds can be monitored at:
```
https://expo.dev/accounts/[your-account]/projects/tni-bouquetapps-reactnative/builds
```

## 📦 Build Profiles

The project uses three EAS build profiles:

| Profile | Purpose | Build Type | When to Use |
|---------|---------|------------|-------------|
| `development` | Development testing | APK with dev client | Local testing with hot reload |
| `preview` | Internal testing | APK | Testing before production |
| `production` | Production release | APK | Public release |

## 🔒 Environment Variables

The workflows automatically use environment variables from your `.env` file. Ensure your `.env` is not committed to git (should be in `.gitignore`).

For CI/CD, environment variables are managed through:
- Expo project settings
- GitHub repository secrets
- Build-time environment variables in EAS

## 📝 Workflow Outputs

### Artifacts

Build artifacts are stored in GitHub Actions:
- Preview builds: 14 days
- Production builds: 90 days
- Build artifacts: 30 days

### GitHub Releases

When you push a version tag, a GitHub Release is automatically created with:
- APK file attached
- Version information
- Commit details
- Installation instructions

## 🛠️ Troubleshooting

### Build Fails

1. Check EAS build logs:
   ```bash
   eas build:list
   ```

2. Verify Expo token is valid:
   ```bash
   eas whoami
   ```

3. Check GitHub Actions logs for detailed error messages

### Authentication Issues

- Ensure `EXPO_TOKEN` secret is set correctly
- Token should have full access permissions
- Regenerate token if expired

### Build Takes Too Long

The workflow waits for build completion. EAS builds typically take:
- Development: 10-15 minutes
- Preview: 15-20 minutes
- Production: 20-30 minutes

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Application Services](https://expo.dev/eas)

## 🔄 Updating Workflows

To modify workflows:
1. Edit files in `.github/workflows/`
2. Commit and push changes
3. Workflows will use the latest version from your default branch

## 🎯 Best Practices

1. **Version Tags**: Use semantic versioning (e.g., `v1.2.3`)
2. **Testing**: Use preview builds before production releases
3. **Release Notes**: Keep GitHub Release descriptions informative
4. **Artifacts**: Download important APKs before retention period expires
5. **Monitoring**: Regularly check build status on Expo dashboard

## 🔐 Security Notes

- Never commit `.env` files with sensitive data
- Rotate `EXPO_TOKEN` regularly
- Limit GitHub Actions permissions when possible
- Use separate tokens for CI/CD vs. development
