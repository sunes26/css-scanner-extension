# TypeScript Migration Guide

이 프로젝트는 JavaScript에서 TypeScript로 점진적으로 마이그레이션 중입니다.

## 목차

- [현재 상태](#현재-상태)
- [TypeScript 설정](#typescript-설정)
- [마이그레이션 전략](#마이그레이션-전략)
- [타입 정의](#타입-정의)
- [개발 워크플로우](#개발-워크플로우)
- [문제 해결](#문제-해결)

## 현재 상태

### ✅ 완료된 작업

- [x] TypeScript 5.9+ 설치
- [x] `tsconfig.json` 구성
- [x] Webpack ts-loader 설정
- [x] ESLint TypeScript 지원
- [x] Chrome Extension 타입 정의 (@types/chrome)
- [x] 공통 타입 정의 (`content/types.ts`)
- [x] SafeWrapper.ts 변환 완료 (예제)

### 🚧 진행 중

프로젝트는 **점진적 마이그레이션** 방식을 사용합니다:

- JavaScript 파일과 TypeScript 파일 공존
- `allowJs: true`로 기존 JS 파일 지원
- 점진적으로 파일별 변환

### 📋 변환 예정

다음 파일들을 TypeScript로 변환할 계획:

1. **Core 모듈**
   - [x] SafeWrapper.js → SafeWrapper.ts
   - [ ] ErrorHandler.js → ErrorHandler.ts
   - [ ] CSSScanner.js → CSSScanner.ts

2. **Analyzers**
   - [ ] StyleCache.js → StyleCache.ts
   - [ ] CSSAnalyzer.js → CSSAnalyzer.ts

3. **Managers**
   - [ ] PopupManager.js → PopupManager.ts
   - [ ] ClipboardManager.js → ClipboardManager.ts
   - [ ] NotificationManager.js → NotificationManager.ts

4. **Handlers**
   - [ ] EventHandler.js → EventHandler.ts
   - [ ] MessageHandler.js → MessageHandler.ts

5. **UI & Utils**
   - [ ] ElementSelector.js → ElementSelector.ts
   - [ ] PerformanceMonitor.js → PerformanceMonitor.ts

6. **Background & Popup**
   - [ ] background/background.js → background.ts
   - [ ] popup/popup.js → popup.ts

## TypeScript 설정

### tsconfig.json

프로젝트는 엄격한 타입 체크를 사용합니다:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "types": ["chrome"],
    "allowJs": true,
    "checkJs": false
  }
}
```

주요 설정:

- **strict**: 모든 엄격한 타입 체크 활성화
- **allowJs**: JavaScript 파일 허용 (점진적 마이그레이션)
- **types: ["chrome"]**: Chrome Extension API 타입 지원
- **noImplicitAny**: any 타입 명시 필요

### Webpack 설정

```javascript
module: {
  rules: [
    {
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }
  ]
},
resolve: {
  extensions: ['.ts', '.js']
}
```

## 마이그레이션 전략

### 1. 파일별 점진적 변환

**변환 순서**:

1. 의존성이 없는 작은 유틸리티 파일부터 시작
2. Core 모듈 변환
3. 상위 레벨 모듈 변환

**변환 체크리스트**:

- [ ] 파일 이름을 `.js`에서 `.ts`로 변경
- [ ] 타입 정의 import
- [ ] 클래스 속성에 타입 추가
- [ ] 메서드 매개변수에 타입 추가
- [ ] 메서드 반환 타입 추가
- [ ] any 타입 최소화
- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 통과

### 2. 예제: SafeWrapper.js → SafeWrapper.ts

**변환 전 (JavaScript)**:

```javascript
class SafeWrapper {
  constructor(errorHandler) {
    this.errorHandler = errorHandler;
  }

  execute(fn, errorType, context = {}) {
    try {
      return { success: true, data: fn() };
    } catch (error) {
      this.errorHandler.handleError(error, errorType, context);
      return { success: false, error: error.message };
    }
  }
}

window.SafeWrapper = SafeWrapper;
```

**변환 후 (TypeScript)**:

```typescript
import type { SafeWrapperResult, ErrorContext } from '../types';

class SafeWrapper {
  private errorHandler: any;

  constructor(errorHandler: any) {
    this.errorHandler = errorHandler;
  }

  execute<T = any>(
    fn: () => T,
    errorType: string,
    context: ErrorContext = {}
  ): SafeWrapperResult<T> {
    try {
      return { success: true, data: fn() };
    } catch (error) {
      this.errorHandler.handleError(error, errorType, context);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).SafeWrapper = SafeWrapper;
}

export default SafeWrapper;
```

**주요 변경사항**:

1. ✅ 타입 import 추가
2. ✅ 제네릭 타입 `<T>` 사용
3. ✅ 매개변수 타입 지정
4. ✅ 반환 타입 명시
5. ✅ private 접근 제한자 사용
6. ✅ window 객체 타입 단언
7. ✅ export 문 추가

## 타입 정의

### 공통 타입 (`content/types.ts`)

프로젝트 전체에서 사용하는 타입 정의:

```typescript
// 결과 타입
export interface SafeWrapperResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
}

// CSS 타입
export interface CategorizedStyles {
  layout: Record<string, string>;
  boxModel: Record<string, string>;
  border: Record<string, string>;
  background: Record<string, string>;
  typography: Record<string, string>;
  flexGrid: Record<string, string>;
  effects: Record<string, string>;
}

// 메시지 타입
export interface ChromeMessage {
  action: string;
  tabId?: number;
  [key: string]: any;
}

// 전역 타입 확장
declare global {
  interface Window {
    ErrorHandler: typeof ErrorHandler;
    SafeWrapper: typeof SafeWrapper;
    // ... 기타 클래스들
  }
}
```

### Chrome Extension 타입

`@types/chrome` 패키지가 제공:

```typescript
// 자동 완성 지원
chrome.runtime.onMessage.addListener(
  (message: ChromeMessage, sender: chrome.runtime.MessageSender) => {
    // 타입 안전성 보장
  }
);

chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
  // ...
});
```

## 개발 워크플로우

### 타입 체크

```bash
# 타입 체크만 실행 (컴파일 안 함)
npm run type-check

# 실시간 타입 체크
npm run type-check:watch
```

### 빌드

```bash
# 개발 빌드
npm run build:dev

# 프로덕션 빌드 (타입 체크 포함)
npm run build
```

### 린팅

```bash
# TypeScript 파일 린팅
npm run lint

# 자동 수정
npm run lint:fix
```

### 전체 검증

```bash
# Prettier + ESLint + TypeScript 체크
npm run validate
```

## 문제 해결

### 1. "Cannot find module" 에러

**문제**: TypeScript가 모듈을 찾지 못함

**해결책**:

```typescript
// 상대 경로로 import
import type { SafeWrapperResult } from '../types';

// 또는 tsconfig.json에 paths 추가
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["content/*"]
    }
  }
}
```

### 2. "Property does not exist on type 'Window'"

**문제**: window 객체에 커스텀 속성 추가 시

**해결책**:

```typescript
// types.ts에 전역 타입 선언
declare global {
  interface Window {
    cssScanner?: CSSScanner;
  }
}

// 사용
window.cssScanner = new CSSScanner();
```

### 3. "Type 'any' is not assignable"

**문제**: strict 모드에서 any 타입 사용

**해결책**:

```typescript
// 나쁜 예
let data: any;

// 좋은 예
interface Data {
  id: number;
  name: string;
}
let data: Data;

// 임시로 any 필요 시
let data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
```

### 4. Chrome API 타입 에러

**문제**: Chrome API 타입이 인식되지 않음

**해결책**:

```bash
# @types/chrome 재설치
npm install --save-dev @types/chrome

# tsconfig.json 확인
{
  "compilerOptions": {
    "types": ["chrome"]
  }
}
```

## 마이그레이션 가이드라인

### DO ✅

- 명확한 타입 정의 사용
- 인터페이스 활용
- 제네릭 타입 적극 사용
- 타입 가드 사용
- readonly 속성 사용

### DON'T ❌

- any 타입 남용
- 타입 단언 (as) 과도 사용
- @ts-ignore 남용
- 타입 체크 비활성화
- 암시적 any 허용

## 참고 자료

- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Chrome Extension Types](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/chrome)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

**다음 단계**:

1. ErrorHandler.js를 TypeScript로 변환
2. 타입 정의 강화
3. 모든 모듈 변환 완료
4. strict 모드 100% 호환성 달성
