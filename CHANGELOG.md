# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-01

### ✨ New Features (새 기능)

- **🎯 Drag & Drop**: Pinned popups can now be repositioned
  - Click and drag the green header to move popup anywhere
  - Viewport boundary constraints prevent popup from going off-screen
  - Visual feedback during drag (enhanced shadow, cursor change)
  - Position persists while popup is pinned
- **⌨️ Full TypeScript Migration**: Complete codebase converted to TypeScript
  - 100% type coverage with strict mode enabled
  - Better IDE autocomplete and IntelliSense
  - Compile-time error detection
  - Improved code maintainability

### 🏗️ Architecture (아키텍처)

- **MAJOR REFACTORING**: Content script 모듈화
  - content.js (2,312 라인) → 13개 모듈로 분할
  - 각 클래스를 개별 파일로 추출
  - 디렉토리 구조 재구성 (core/, analyzers/, managers/, handlers/, ui/, utils/)
  - 의존성 순서에 따른 동적 주입 구현
- **TypeScript Architecture**:
  - All 13+ modules converted to TypeScript
  - Centralized type definitions in content/types.ts
  - Proper generic types and type guards
  - Eliminated all `any` types for maximum type safety

### 📁 New Structure (새로운 구조)

```
content/
├── core/ - 핵심 기능
├── analyzers/ - CSS 분석
├── managers/ - 관리자 (팝업, 클립보드, 알림)
├── handlers/ - 이벤트 및 메시지 처리
├── ui/ - UI 컴포넌트
└── utils/ - 유틸리티
```

### 🔄 Changed (변경)

- Background script가 모든 모듈을 순서대로 동적 주입
- content.js는 이제 30 라인의 진입점으로 축소
- 각 모듈은 window 객체에 클래스 export

### ✅ Benefits (장점)

- 가독성 및 유지보수성 대폭 향상
- 개별 클래스 테스트 가능
- 팀 협업 용이
- 디버깅 개선 (명확한 파일/클래스 이름)

### 📦 Build System (빌드 시스템)

- **Webpack 도입**: 모든 모듈을 단일 파일로 번들링
  - 프로덕션 빌드: 36.8KB (개발 대비 50% 감소)
  - 백그라운드 스크립트: 3.03KB (61% 감소)
  - 팝업 스크립트: 3.97KB (46% 감소)
- **Babel 트랜스파일러**: Chrome 88+ 호환성 보장
- **소스맵**: 개발 모드에서 디버깅 지원
- **자동 최적화**:
  - 코드 압축 및 난독화
  - console.log 제거 (프로덕션)
  - debugger 제거 (프로덕션)
- **스마트 환경 감지**: Background script가 자동으로 번들/모듈 환경 감지
- **빌드 스크립트**:
  - `npm run build`: 프로덕션 빌드
  - `npm run build:dev`: 개발 빌드 (소스맵 포함)
  - `npm run watch`: 실시간 빌드 감시

### 🔧 Development Tools (개발 도구)

- **ESLint 개선**:
  - .eslintignore 추가 (webpack.config.js, content-bundle.js 제외)
  - 템플릿 리터럴 내 들여쓰기 규칙 완화
  - managers 폴더 들여쓰기 검사 비활성화 (HTML 템플릿)
  - TypeScript 지원 (@typescript-eslint/parser, @typescript-eslint/eslint-plugin)
- **빌드 전 자동 검증**: prettier + eslint + type-check 자동 실행
- **개발/프로덕션 이중 지원**: 소스 파일과 빌드 파일 모두 작동

### 📘 TypeScript Migration (타입스크립트 마이그레이션)

- **TypeScript 5.9+ 도입**: 점진적 마이그레이션 시작
  - `tsconfig.json` 구성 (strict 모드)
  - Chrome Extension 타입 정의 (@types/chrome)
  - ts-loader Webpack 설정
- **타입 정의 시스템**:
  - `content/types.ts`: 공통 인터페이스 및 타입
  - SafeWrapperResult, ErrorContext, CategorizedStyles 등 정의
  - 전역 Window 인터페이스 확장
- **첫 변환 완료**: SafeWrapper.js → SafeWrapper.ts
  - 제네릭 타입 지원
  - 타입 안전성 확보
  - strict 모드 호환
- **개발 스크립트**:
  - `npm run type-check`: TypeScript 타입 체크
  - `npm run type-check:watch`: 실시간 타입 체크
- **점진적 마이그레이션 전략**:
  - JavaScript와 TypeScript 파일 공존
  - allowJs: true로 기존 코드 지원
  - 파일별 순차 변환 계획

### 📝 Documentation (문서)

- BUILD.md 추가 - 빌드 시스템 상세 가이드
- TYPESCRIPT.md 추가 - TypeScript 마이그레이션 가이드
- REFACTORING_SUMMARY.md 추가
- DEPENDENCY_GRAPH.md 추가
- content.js.backup 보존

## [1.0.1] - 2024-01-XX

### 🔒 Security (보안)
- **BREAKING CHANGE**: `host_permissions` 완전 제거
  - `<all_urls>` 권한 제거로 보안 강화
  - Chrome 웹 스토어 정책 준수
- **BREAKING CHANGE**: `content_scripts` 자동 주입 제거
  - 사용자가 명시적으로 활성화할 때만 스크립트 주입
  - 불필요한 리소스 사용 감소
- `clipboardWrite` 권한 제거
  - `activeTab` 권한만으로 클립보드 API 사용 가능
  - Fallback 메커니즘 유지 (execCommand)

### 📝 Documentation (문서)
- `README.md` 보안 섹션 추가
- `SECURITY.md` 추가 - 상세한 보안 정책 문서
- `CHANGELOG.md` 추가 - 버전 변경 이력

### ⚠️ Migration Guide (마이그레이션 가이드)

#### v1.0.0 → v1.0.1 업그레이드 시
1. 확장 프로그램 재설치 권장
2. 이전에 자동으로 주입되던 스크립트는 이제 수동 활성화 필요
3. 권한 재승인 불필요 (오히려 권한이 줄어듦)

## [1.0.0] - 2024-01-XX

### ✨ Features (기능)
- 실시간 CSS 속성 분석
- 마우스 호버 시 즉시 CSS 정보 표시
- 클릭하여 CSS 팝업 고정(Pin) 기능
- 카테고리별 CSS 속성 분류
  - Layout, Box Model, Border, Background, Typography, Flex & Grid, Effects
- 클립보드 복사 기능
  - CSS 셀렉터 복사
  - 전체 CSS 속성 복사
  - 인라인 스타일만 복사
- ESC 키로 스캔 모드 종료

### 🎨 UI/UX
- 마우스 위치 기반 팝업 렌더링
- GPU 가속 애니메이션
- 반응형 디자인
- 다크 모드 대응 준비

### ⚡ Performance (성능)
- WeakMap 기반 스타일 캐싱
- Throttling/Debouncing 적용
- 성능 모니터링 시스템 내장
- 주기적 캐시 정리

### 🛡️ Error Handling (에러 처리)
- 포괄적인 에러 핸들링 시스템
- 자동 복구 메커니즘
- 사용자 친화적 에러 메시지
- 에러 히스토리 추적

### 🏗️ Architecture (아키텍처)
- 클래스 기반 OOP 설계
- Service Worker (Manifest V3)
- 동적 Content Script 주입
- 모듈화된 클래스 구조
  - CSSScanner, ErrorHandler, StyleCache
  - CSSAnalyzer, PopupManager, ElementSelector
  - ClipboardManager, EventHandler, PerformanceMonitor

### 📦 Technical (기술)
- Manifest V3 사용
- Chrome Extension API
- Modern JavaScript (ES6+)
- CSS3 Animations with GPU acceleration

---

## Version Comparison (버전 비교)

| Feature | v1.0.0 | v1.0.1 |
|---------|--------|--------|
| host_permissions | ❌ `<all_urls>` | ✅ 없음 |
| content_scripts | ❌ 자동 주입 | ✅ 동적 주입만 |
| clipboardWrite | ❌ 필요 | ✅ 불필요 |
| 보안 등급 | ⚠️ 중간 | ✅ 높음 |
| 권한 요청 | 3개 | 2개 |

---

## Roadmap (향후 계획)

### v1.1.0 (예정)
- [ ] TypeScript 마이그레이션
- [ ] 테스트 코드 작성 (Jest)
- [ ] 코드 분할 (content.js → 여러 파일)
- [ ] 빌드 시스템 구축 (Webpack/Rollup)

### v1.2.0 (예정)
- [ ] 다국어 지원 (i18n)
- [ ] 커스터마이징 옵션 (색상, 크기)
- [ ] 다크 모드 지원
- [ ] Firefox/Edge 지원

### v2.0.0 (장기)
- [ ] CSS 변경 사항 추적
- [ ] 스타일 비교 기능
- [ ] CSS 내보내기 (파일)
- [ ] 북마크 기능

---

**Legend:**
- 🔒 Security - 보안 관련
- ✨ Features - 새로운 기능
- 🐛 Bug Fixes - 버그 수정
- ⚡ Performance - 성능 개선
- 📝 Documentation - 문서화
- 🎨 UI/UX - 사용자 인터페이스
- 🏗️ Architecture - 구조 개선
- ⚠️ BREAKING CHANGE - 호환성 깨지는 변경
