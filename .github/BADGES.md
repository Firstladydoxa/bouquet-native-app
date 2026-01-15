# GitHub Actions Status Badges

Add these badges to your README.md to show build status:

## Build Status Badges

### All Workflows
```markdown
![Build Android](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-android.yml/badge.svg)
![EAS Build](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/eas-build-and-submit.yml/badge.svg)
![Lint](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/lint-and-test.yml/badge.svg)
```

### Specific Branch
```markdown
![Build](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-android.yml/badge.svg?branch=main)
```

### With Link
```markdown
[![Build Status](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-android.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-android.yml)
```

## Example README Section

```markdown
# Rhapsody Languages

[![Build Android](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-android.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![EAS Build](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/eas-build-and-submit.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Lint](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/lint-and-test.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Release](https://img.shields.io/github/v/release/YOUR_USERNAME/YOUR_REPO)](https://github.com/YOUR_USERNAME/YOUR_REPO/releases)

A React Native mobile app for Rhapsody of Realities in multiple languages.

## 🚀 Quick Start

[Download Latest APK](https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest)

## 📱 Build Status

Check our [CI/CD pipeline](./.github/WORKFLOWS.md) for automated builds and releases.

- **Latest Build:** [EAS Dashboard](https://expo.dev/accounts/[your-account]/projects/tni-bouquetapps-reactnative/builds)
- **Latest Release:** [GitHub Releases](https://github.com/YOUR_USERNAME/YOUR_REPO/releases)
```

## Additional Badges

### Version Badge
```markdown
![Version](https://img.shields.io/github/package-json/v/YOUR_USERNAME/YOUR_REPO)
```

### License Badge
```markdown
![License](https://img.shields.io/github/license/YOUR_USERNAME/YOUR_REPO)
```

### Last Commit Badge
```markdown
![Last Commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/YOUR_REPO)
```

### Issues Badge
```markdown
![Issues](https://img.shields.io/github/issues/YOUR_USERNAME/YOUR_REPO)
```

### Download Badge
```markdown
![Downloads](https://img.shields.io/github/downloads/YOUR_USERNAME/YOUR_REPO/total)
```

## Complete Badge Collection

```markdown
![Build](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/build-android.yml/badge.svg)
![Version](https://img.shields.io/github/package-json/v/YOUR_USERNAME/YOUR_REPO)
![License](https://img.shields.io/github/license/YOUR_USERNAME/YOUR_REPO)
![Downloads](https://img.shields.io/github/downloads/YOUR_USERNAME/YOUR_REPO/total)
![Last Commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/YOUR_REPO)
![Issues](https://img.shields.io/github/issues/YOUR_USERNAME/YOUR_REPO)
```

## Instructions

1. Replace `YOUR_USERNAME` with your GitHub username
2. Replace `YOUR_REPO` with your repository name
3. Replace `[your-account]` with your Expo account name
4. Copy and paste into your README.md
5. Commit and push to see badges

Example:
```
YOUR_USERNAME = firstlady
YOUR_REPO = rhapsody-languages
```

Then:
```markdown
![Build](https://github.com/firstlady/rhapsody-languages/actions/workflows/build-android.yml/badge.svg)
```
