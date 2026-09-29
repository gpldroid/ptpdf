# PTPDF — Smart PDF Tools

PTPDF is a responsive PDF toolbox inspired by the supplied mobile reference image.

## Included
- Responsive website in `web/`
- Android WebView application in `android/`
- GitHub Pages deployment workflow
- Android APK build workflow
- Local browser-side PDF processing with PDF-LIB

## Web
Open `web/index.html` locally or deploy the repository with GitHub Pages.

## Android
The Android app loads the same web interface from its packaged assets. The Gradle build copies `web/` into Android assets automatically, so the website and app stay visually aligned.

## Privacy
PDF operations are designed to run in the browser/WebView. No project API key is required.

## License
MIT
