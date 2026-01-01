# 개발 가이드 (Development Guide)

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: v16 이상
- **npm**: v8 이상
- **Chrome 브라우저**: 최신 버전

### 설치

1. **저장소 클론**

   ```bash
   git clone https://github.com/yourusername/css-scanner-extension.git
   cd css-scanner-extension
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **Chrome에 확장 프로그램 로드**
   - Chrome에서 `chrome://extensions/` 접속
   - 우측 상단 "개발자 모드" 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - 프로젝트 폴더 선택

## 📝 개발 워크플로우

### 1. 코드 작성 전

```bash
# 최신 코드 가져오기
git pull origin main

# 새 브랜치 생성
git checkout -b feature/your-feature-name
```

### 2. 개발 중

**코드 포맷팅:**

```bash
# 자동 포맷팅
npm run format

# 포맷 검사만
npm run format:check
```

**린팅:**

```bash
# 문제 검사
npm run lint

# 자동 수정
npm run lint:fix
```

**전체 검증:**

```bash
# 포맷 + 린트 한 번에
npm run validate
```

### 3. 변경사항 테스트

1. Chrome에서 `chrome://extensions/` 접속
2. CSS Scanner 확장 프로그램 새로고침 버튼 클릭
3. 테스트 페이지에서 기능 확인

### 4. 커밋

```bash
# 변경사항 추가
git add .

# 커밋 (의미있는 메시지 작성)
git commit -m "feat: add new feature"

# 푸시
git push origin feature/your-feature-name
```

## 🏗️ 프로젝트 구조

```
css-scanner-extension/
├── .vscode/              # VSCode 설정
│   ├── settings.json
│   └── extensions.json
├── background/           # Service Worker
│   └── background.js
├── content/             # Content Script
│   ├── content.js       # 메인 로직 (TODO: 분할 필요)
│   └── content.css      # 팝업 스타일
├── popup/               # 확장 프로그램 UI
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── icons/               # 아이콘
│   └── icon.png
├── .eslintrc.json       # ESLint 설정
├── .prettierrc          # Prettier 설정
├── .editorconfig        # 에디터 설정
├── .gitignore          # Git 제외 파일
├── manifest.json        # Chrome Extension 설정
├── package.json         # npm 설정
├── README.md           # 프로젝트 소개
├── SECURITY.md         # 보안 정책
├── CHANGELOG.md        # 변경 이력
└── DEVELOPMENT.md      # 이 파일
```

## 🔧 주요 npm 스크립트

| 명령어                 | 설명             |
| ---------------------- | ---------------- |
| `npm run lint`         | ESLint 검사      |
| `npm run lint:fix`     | ESLint 자동 수정 |
| `npm run format`       | Prettier 포맷팅  |
| `npm run format:check` | 포맷 검사        |
| `npm run validate`     | 린트 + 포맷 검사 |

## 📋 코딩 스타일 가이드

### JavaScript

**✅ 좋은 예:**

```javascript
// 1. const 사용
const CONFIG = {
  CACHE_TIMEOUT: 30000
};

// 2. 명확한 변수명
const isElementVisible = element.offsetParent !== null;

// 3. Arrow function
const getCssValue = (element, property) => {
  return window.getComputedStyle(element).getPropertyValue(property);
};

// 4. 템플릿 리터럴
const message = `Element: ${element.tagName}`;

// 5. Optional chaining
const value = element?.style?.color;
```

**❌ 나쁜 예:**

```javascript
// 1. var 사용
var x = 10; // ❌

// 2. 불명확한 변수명
const a = element.offsetParent !== null; // ❌

// 3. 긴 라인
const veryLongVariableName = someFunction(parameter1, parameter2, parameter3, parameter4); // ❌

// 4. 문자열 연결
const message = 'Element: ' + element.tagName; // ❌
```

### 네이밍 규칙

- **클래스**: PascalCase (`CSSScanner`, `PopupManager`)
- **변수/함수**: camelCase (`isScanning`, `handleClick`)
- **상수**: UPPER_SNAKE_CASE (`MAX_CACHE_SIZE`, `DEFAULT_TIMEOUT`)
- **파일**: kebab-case (`css-analyzer.js`, `popup-manager.js`)

### 주석

```javascript
// ✅ 좋은 주석 - "왜"를 설명
// Cache styles to avoid repeated getComputedStyle calls (expensive operation)
const cachedStyle = this.cache.get(element);

// ❌ 나쁜 주석 - "무엇"을 설명
// Get cached style
const cachedStyle = this.cache.get(element);
```

## 🐛 디버깅

### Chrome DevTools

**Background Script:**

1. `chrome://extensions/` 접속
2. CSS Scanner에서 "Service Worker" 클릭
3. DevTools가 열림

**Content Script:**

1. 웹 페이지에서 F12로 DevTools 열기
2. Console 탭에서 로그 확인

**디버그 로그:**

```javascript
console.log('CSS Scanner:', data);
console.group('Element Analysis');
console.log('Tag:', element.tagName);
console.log('Styles:', styles);
console.groupEnd();
```

### 일반적인 문제

**1. Content Script가 주입되지 않음**

```bash
# 해결: 확장 프로그램 새로고침
chrome://extensions/ → CSS Scanner → 새로고침 버튼
```

**2. 권한 오류**

```bash
# 확인: manifest.json의 permissions 확인
# activeTab, scripting 권한이 있는지 확인
```

**3. 클립보드 복사 실패**

```javascript
// Fallback이 있으므로 대부분 작동함
// 안되면 HTTPS 페이지에서 테스트
```

## 🧪 테스트 (TODO)

현재 테스트 코드가 없습니다. 추후 Jest를 사용하여 추가 예정:

```bash
npm test                    # 테스트 실행
npm run test:watch          # 워치 모드
npm run test:coverage       # 커버리지
```

## 🔄 Git 워크플로우

### 브랜치 전략

- `main` - 안정된 프로덕션 코드
- `develop` - 개발 중인 코드
- `feature/*` - 새 기능
- `bugfix/*` - 버그 수정
- `hotfix/*` - 긴급 수정

### 커밋 메시지 규칙

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat` - 새 기능
- `fix` - 버그 수정
- `docs` - 문서 변경
- `style` - 코드 포맷팅 (기능 변경 없음)
- `refactor` - 리팩토링
- `perf` - 성능 개선
- `test` - 테스트 추가/수정
- `chore` - 빌드, 설정 변경

**예시:**

```bash
feat: add dark mode support
fix: resolve clipboard copy issue on Firefox
docs: update installation guide
refactor: split content.js into modules
```

## 📦 릴리스 프로세스

1. **버전 업데이트**

   ```bash
   # package.json과 manifest.json 버전 동기화
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **CHANGELOG 업데이트**
   - `CHANGELOG.md`에 변경사항 기록

3. **태그 생성**

   ```bash
   git tag -a v1.0.1 -m "Release v1.0.1"
   git push origin v1.0.1
   ```

4. **Chrome 웹 스토어 배포**
   - 프로젝트를 ZIP으로 압축
   - Chrome 웹 스토어 개발자 대시보드에서 업로드

## 🎯 개발 목표

### 단기 (1-2주)

- [ ] content.js 파일 분할
- [ ] 테스트 코드 추가
- [ ] 성능 프로파일링

### 중기 (1-2개월)

- [ ] TypeScript 마이그레이션
- [ ] 빌드 시스템 구축
- [ ] 다국어 지원

### 장기 (3개월+)

- [ ] Firefox/Edge 지원
- [ ] 고급 기능 추가
- [ ] 플러그인 시스템

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Run validation (`npm run validate`)
5. Push to the Branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## 📚 유용한 리소스

### Chrome Extension 개발

- [Chrome Extension 공식 문서](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 마이그레이션 가이드](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API 레퍼런스](https://developer.chrome.com/docs/extensions/reference/)

### JavaScript

- [MDN Web Docs](https://developer.mozilla.org/)
- [ES6 Features](http://es6-features.org/)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)

### 코드 품질

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

## 💬 질문 및 지원

- **Issues**: GitHub Issues에 등록
- **Discussion**: GitHub Discussions 활용
- **Email**: your-email@example.com

---

**Happy Coding! 🚀**
