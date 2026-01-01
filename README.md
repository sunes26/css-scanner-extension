# 🔍 CSS Scanner - Inspect & Copy Styles Instantly

> Inspect CSS in real-time. Hover to view categorized styles, copy selectors & CSS instantly. Fast, organized, privacy-first.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-MIT-yellow)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

[English](#english) | [한국어](#korean)

---

## <a id="english"></a>🇬🇧 English

A powerful Chrome extension that lets you inspect and analyze CSS properties in real-time. Perfect for web developers, designers, and anyone who works with CSS.

### ⭐ Key Features

- **🎯 Real-time CSS Inspection** - Hover over any element to instantly view its CSS properties
- **📊 Smart Categorization** - CSS properties organized into 7 intuitive categories
- **📋 One-Click Copy** - Copy selectors, all CSS, or inline styles with a single click
- **🎨 Drag & Drop** - Pin and reposition CSS panels anywhere on screen
- **⚡ Performance Optimized** - WeakMap caching, GPU acceleration, minimal overhead
- **🛡️ Privacy First** - Zero data collection, 100% local processing
- **✨ Beautiful UI** - Modern, clean interface with smooth animations

### 🚀 Quick Start

1. Install from Chrome Web Store (coming soon) or [load unpacked](#installation)
2. Click the extension icon to activate scan mode
3. Hover over any element to inspect CSS
4. Click to pin the panel, drag the green header to reposition
5. Copy selectors or CSS with one click
6. Press ESC to exit scan mode

### 📦 Installation

#### From Chrome Web Store (Recommended)

_Coming soon_

#### Manual Installation (Developers)

```bash
# Clone the repository
git clone https://github.com/yourusername/css-scanner-extension.git
cd css-scanner-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Load the extension
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder
```

### 🎨 Screenshots

_Coming soon - Add screenshots here_

### 💡 Why CSS Scanner?

| Feature          | CSS Scanner | Browser DevTools | Other Extensions |
| ---------------- | ----------- | ---------------- | ---------------- |
| Hover Inspection | ✅          | ❌               | Some             |
| Categorized CSS  | ✅          | ❌               | ❌               |
| Drag & Drop      | ✅          | ❌               | ❌               |
| One-Click Copy   | ✅          | ❌               | Some             |
| Privacy-First    | ✅          | ✅               | ❌               |
| Performance      | ⚡ Fast     | ⚡ Fast          | 🐌 Slow          |

### 🛠️ Tech Stack

- **Manifest V3** - Latest Chrome Extension standard
- **TypeScript** - Type-safe development
- **Webpack** - Optimized bundling
- **ES6+ JavaScript** - Modern syntax
- **GPU Acceleration** - Smooth animations

### 📚 Documentation

- [Build Guide](BUILD.md)
- [Development Guide](DEVELOPMENT.md)
- [TypeScript Migration](TYPESCRIPT.md)
- [Security](SECURITY.md)
- [Store Listing](STORE_LISTING.md)

### 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

### 📝 License

MIT License - see [LICENSE](LICENSE) file for details

### 🙏 Acknowledgments

- Chrome Extension API Documentation
- All contributors and users

---

## <a id="korean"></a>🇰🇷 한국어

웹 페이지의 요소에 마우스를 올리면 실시간으로 CSS 속성을 분석하고 보여주는 Chrome 확장 프로그램입니다.

## ✨ 주요 기능

### 🎯 실시간 CSS 분석

- 웹 페이지의 모든 요소를 호버하면 즉시 CSS 속성 표시
- 요소를 클릭하여 CSS 팝업을 고정(Pin) 가능
- ESC 키로 스캔 모드 종료

### 📊 카테고리별 분류

CSS 속성을 다음과 같이 체계적으로 분류:

- 📐 **Layout** - display, position, float 등
- 📦 **Box Model** - width, height, margin, padding 등
- 🔲 **Border** - border, border-radius 등
- 🎨 **Background** - background-color, background-image 등
- 📝 **Typography** - font-family, font-size, color 등
- 📊 **Flex & Grid** - flex, grid 관련 속성
- ✨ **Effects** - opacity, transform, transition 등

### 📋 클립보드 복사

- CSS 셀렉터만 복사
- 전체 CSS 속성 복사
- 인라인 스타일만 복사

### ⚡ 성능 최적화

- WeakMap 기반 캐싱 시스템
- GPU 가속 활용
- Throttling/Debouncing 적용
- 성능 모니터링 내장

### 🛡️ 에러 처리

- 포괄적인 에러 핸들링 시스템
- 자동 복구 메커니즘
- 사용자 친화적인 에러 메시지

## 📦 설치 방법

### Chrome 웹 스토어에서 설치 (출시 후)

1. Chrome 웹 스토어에서 "CSS Scanner" 검색
2. "Chrome에 추가" 클릭

### 개발자 모드로 설치

1. 이 저장소를 클론하거나 다운로드

   ```bash
   git clone https://github.com/yourusername/css-scanner-extension.git
   cd css-scanner-extension
   ```

2. Chrome 브라우저에서 `chrome://extensions/` 접속

3. 우측 상단의 "개발자 모드" 활성화

4. "압축해제된 확장 프로그램을 로드합니다" 클릭

5. 프로젝트 폴더 선택

## 🚀 사용 방법

### 1. 스캔 모드 시작

- 확장 프로그램 아이콘 클릭
- "Start Scan Mode" 버튼 클릭
- 또는 단축키 사용 (설정 가능)

### 2. 요소 분석

- **호버**: 마우스를 요소 위에 올리면 CSS 정보가 표시됩니다
- **클릭**: 요소를 클릭하면 CSS 팝업이 고정됩니다 📌
- **고정 해제**: 다른 곳을 클릭하거나 ESC 키를 누릅니다

### 3. CSS 복사

팝업 내의 버튼을 클릭하여:

- "Copy Selector" - CSS 셀렉터만 복사
- "Copy All CSS" - 모든 계산된 스타일 복사
- "Inline Styles Only" - 인라인 스타일만 복사

### 4. 스캔 모드 종료

- 확장 프로그램 팝업에서 "Stop Scan Mode" 클릭
- 또는 ESC 키를 두 번 누릅니다

## 🎨 스크린샷

```
(여기에 스크린샷 추가 예정)
```

## 🏗️ 프로젝트 구조

```
css-scanner-extension/
├── manifest.json           # Chrome Extension 설정
├── background/
│   └── background.js      # Service Worker (백그라운드 스크립트)
├── content/
│   ├── content.js         # 메인 컨텐츠 스크립트
│   └── content.css        # 팝업 스타일
├── popup/
│   ├── popup.html         # 확장 프로그램 팝업 UI
│   ├── popup.js           # 팝업 컨트롤러
│   └── popup.css          # 팝업 스타일
├── icons/
│   └── icon.png           # 확장 프로그램 아이콘
└── README.md
```

## 🔧 기술 스택

- **Manifest Version**: V3 (최신 Chrome Extension 표준)
- **언어**: JavaScript (ES6+)
- **아키텍처**: 클래스 기반 OOP
- **API**: Chrome Extension API, DOM API
- **성능**: WeakMap 캐싱, GPU 가속

## 🛠️ 개발

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 코드 린팅
npm run lint

# 코드 포맷팅
npm run format

# 전체 검증
npm run validate
```

### 빌드 시스템

프로덕션 배포를 위한 최적화된 빌드:

```bash
# 프로덕션 빌드 (압축 및 최적화)
npm run build

# 개발 빌드 (소스맵 포함)
npm run build:dev

# 실시간 빌드 감시
npm run watch
```

**빌드 결과**:

- 📦 모든 모듈을 단일 파일로 번들링
- 🗜️ 코드 압축 (50% 크기 감소)
- 🔍 소스맵 생성 (개발 모드)
- 📂 `dist/` 폴더에 배포 준비 완료

빌드 시스템에 대한 자세한 내용은 [BUILD.md](BUILD.md)를 참조하세요.

### TypeScript 지원

TypeScript로 점진적 마이그레이션 중:

```bash
# 타입 체크
npm run type-check

# 실시간 타입 체크
npm run type-check:watch
```

**현재 상태**:

- ✅ TypeScript 5.9+ 설정 완료
- ✅ Chrome Extension 타입 정의
- 🚧 JavaScript → TypeScript 점진적 변환
- ✅ JS/TS 혼합 빌드 지원

자세한 내용은 [TYPESCRIPT.md](TYPESCRIPT.md)를 참조하세요.

### 개발 vs 프로덕션

- **개발**: 소스 파일 직접 사용 (빌드 없이 작동)
- **프로덕션**: `dist/` 폴더의 번들 파일 사용

자세한 내용은 [DEVELOPMENT.md](DEVELOPMENT.md)를 참조하세요.

### 핵심 클래스

#### Content Script (`content.js`)

- `CSSScanner` - 메인 오케스트레이터
- `ErrorHandler` - 에러 처리 시스템
- `StyleCache` - CSS 스타일 캐싱
- `CSSAnalyzer` - CSS 속성 분석
- `PopupManager` - 팝업 렌더링 및 관리
- `ElementSelector` - 요소 선택 및 하이라이트
- `ClipboardManager` - 클립보드 복사 기능
- `EventHandler` - 이벤트 처리
- `PerformanceMonitor` - 성능 모니터링

#### Background Script (`background.js`)

- `BackgroundService` - Service Worker 관리
- Content Script 주입
- 탭 캐싱 및 정리

#### Popup (`popup.js`)

- `PopupController` - 확장 프로그램 UI 제어

### 디버깅

콘솔에서 에러 통계 확인:

```javascript
// Content Script 컨텍스트에서
window.cssScanner.getErrorStats();
window.cssScanner.exportErrorHistory();
```

## ⚙️ 설정

### 🔒 권한 (최소 권한 원칙)

- `activeTab` - 사용자가 활성화한 현재 탭에만 접근
- `scripting` - Content Script 동적 주입

### ✅ 보안 특징

- ❌ `<all_urls>` 불필요 (제거됨)
- ❌ 자동 스크립트 주입 없음
- ✅ 사용자 명시적 동의 필요
- ✅ 데이터 수집 없음
- ✅ 외부 서버 통신 없음
- ✅ 100% 로컬 처리

자세한 내용은 [SECURITY.md](SECURITY.md)를 참조하세요.

### 지원하지 않는 페이지

다음 페이지에서는 동작하지 않습니다:

- `chrome://` - Chrome 내부 페이지
- `chrome-extension://` - 확장 프로그램 페이지
- `edge://` - Edge 내부 페이지
- `file://` - 로컬 파일 (권한 설정 필요)

## 🐛 알려진 이슈

- iframe 내부 요소 분석 제한 (all_frames: false)
- 일부 동적으로 생성되는 요소에서 셀렉터 생성 제한

## 🔮 향후 계획

- [x] 코드 분할 - ✅ 완료 (v1.1.0, 13개 모듈로 분할)
- [x] 빌드 시스템 구축 - ✅ 완료 (v1.1.0, Webpack)
- [x] TypeScript 마이그레이션 - 🚧 진행 중 (v1.1.0, 점진적 변환)
- [ ] 테스트 코드 작성 (Jest)
- [ ] 다국어 지원 (i18n)
- [ ] 다크 모드 지원
- [ ] 커스터마이징 옵션 (색상, 크기 등)
- [ ] Firefox/Edge 지원
- [ ] CSS 변경 사항 추적 기능
- [ ] 스타일 비교 기능

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👨‍💻 개발자

- 개발자 이름 - [@your-username](https://github.com/your-username)

## 🙏 감사의 말

- Chrome Extension API 문서
- 모든 기여자분들께 감사드립니다

## 📞 문의

프로젝트 링크: [https://github.com/yourusername/css-scanner-extension](https://github.com/yourusername/css-scanner-extension)

이슈 리포트: [https://github.com/yourusername/css-scanner-extension/issues](https://github.com/yourusername/css-scanner-extension/issues)

---

⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!
