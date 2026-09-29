# Android release signing

The release workflow builds both a signed APK and a signed AAB. The signing key is never stored in the repository.

Add these GitHub Actions repository secrets:

- `ANDROID_KEYSTORE_BASE64` — Base64 content of the release `.jks` keystore.
- `ANDROID_KEYSTORE_PASSWORD` — keystore password.
- `ANDROID_KEY_ALIAS` — key alias.
- `ANDROID_KEY_PASSWORD` — key password.

The same keystore must be kept permanently for future app updates. Do not generate a new signing key for each release.

After the secrets are configured, every push to `main` builds:

- `app-release.apk`
- `app-release.aab`

The workflow verifies the APK signature, uploads both files as a GitHub Actions artifact, and creates a GitHub Release.
