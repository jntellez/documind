# Release Checklist — Documind

## Before Release

- [ ] Run `pnpm validate`
- [ ] Confirm the API is working locally or in a stable environment
- [ ] Verify environment variables
- [ ] Confirm final brand assets are correct
- [ ] Confirm the privacy policy is ready
- [ ] Confirm the release version (`1.0.0`)
- [ ] Review final branding and presentation assets

## Android Build

- [ ] Generate the Android release APK
- [ ] Confirm the build finishes successfully
- [ ] Download the APK artifact
- [ ] Save the APK with a versioned filename

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

- [ ] Upload the APK to the final landing page or delivery channel
- [ ] Test the download link
- [ ] Install and test the APK on a real Android device

## Delivery Assets

- [ ] Final screenshots are ready
- [ ] OG image is ready
- [ ] Short product description is finalized
- [ ] Privacy policy is linkable
- [ ] README is reasonably up to date
