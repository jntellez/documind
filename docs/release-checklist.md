# Release Checklist — Documind

## Before Release

- [ ] Run `pnpm validate`
- [ ] Confirm the API is working locally or in a stable environment
- [ ] Verify environment variables
- [ ] Confirm the Vercel production project for `apps/web` is healthy
- [ ] Confirm final brand assets are correct
- [ ] Confirm the privacy policy is ready
- [ ] Confirm the release version (`1.0.0`)
- [ ] Review final branding and presentation assets

## Android Build

- [ ] Generate the Android release APK
- [ ] Confirm the build finishes successfully
- [ ] Download the APK artifact
- [ ] Save the APK with the official filename convention: `documind-android-v{version}.apk`
- [ ] Create or update the GitHub Release tag using `v{version}`
- [ ] Upload the APK asset to the matching GitHub Release

## Functional Verification

- [ ] Sign in with Google or GitHub
- [ ] Import a URL
- [ ] Upload a document
- [ ] Save a document
- [ ] Open the documents list
- [ ] Open a document detail screen
- [ ] Use document chat
- [ ] Check core settings flows

## Technical Verification

- [ ] Confirm the API responds on `/health`
- [ ] Confirm CI is green
- [ ] Confirm backend deploy is healthy
- [ ] Check logs for critical errors

## Distribution

- [ ] Confirm `apps/web` production deploy is healthy (`docs/web-deploy.md`)
- [ ] Confirm `apps/web` resolves the latest GitHub Release asset on `/download`
- [ ] Test the landing CTA on `/` and the direct download CTA on `/download`
- [ ] If live metadata fails or no valid APK asset exists, confirm the fallback path still sends users to the official GitHub Releases page
- [ ] If the new GitHub Release does not appear immediately, wait for the 15-minute metadata revalidation window before redeploying the web app
- [ ] Install and test the APK on a real Android device

## Delivery Assets

- [ ] Final screenshots are ready
- [ ] OG image is ready
- [ ] Short product description is finalized
- [ ] Privacy policy is linkable
- [ ] README is reasonably up to date
