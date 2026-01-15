# Quick Start: GitHub Actions CI/CD Setup

## ⚡ 5-Minute Setup

### Step 1: Get Your Expo Token

```bash
# Login to Expo CLI
npx eas login

# Create access token
npx eas token:create
```

Copy the generated token.

### Step 2: Add Secret to GitHub

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `EXPO_TOKEN`
4. Value: Paste your token
5. Click **Add secret**

### Step 3: Push Your Code

```bash
git add .
git commit -m "Add CI/CD workflows"
git push origin main
```

### Step 4: Create Your First Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

## ✅ That's It!

GitHub Actions will now:
- ✅ Build your APK automatically
- ✅ Run tests on every push
- ✅ Create releases with downloadable APKs
- ✅ Upload artifacts you can download anytime

## 🎯 Quick Commands

### Build Preview (Manual)
Go to: **Actions** → **Preview Build** → **Run workflow**

### Build Production
```bash
npm version patch  # or minor, major
git push && git push --tags
```

### Check Build Status
```bash
npx eas build:list
```

## 📥 Download Your APK

After a successful build:
1. Go to the **Actions** tab
2. Click on the completed workflow run
3. Scroll to **Artifacts** section
4. Download your APK

Or find it in **Releases** for production builds.

## 🚨 Common Issues

**Build fails?**
- Verify `EXPO_TOKEN` is set correctly in GitHub Secrets
- Check Actions logs for error details

**No APK artifact?**
- Wait for build to complete (15-30 minutes)
- Check EAS dashboard for build status

**Need help?**
- Check `CI_CD_GUIDE.md` for detailed documentation
- Review GitHub Actions logs
- Visit Expo dashboard: https://expo.dev

---

**Next Steps:** Read [CI_CD_GUIDE.md](./CI_CD_GUIDE.md) for detailed configuration options.
