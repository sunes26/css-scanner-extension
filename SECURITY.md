# 🔒 보안 정책 (Security Policy)

## 권한 사용 (Permissions)

CSS Scanner는 **최소 권한 원칙**을 따릅니다.

### 요청하는 권한

#### 1. `activeTab` ✅

- **목적**: 사용자가 활성화한 현재 탭에만 접근
- **사용**: CSS 분석을 위해 DOM 요소 읽기
- **범위**: 확장 프로그램 아이콘을 클릭한 탭에만 적용
- **보안**: 사용자가 명시적으로 활성화할 때만 작동

#### 2. `scripting` ✅

- **목적**: Content Script 동적 주입
- **사용**: CSS Scanner 기능을 활성화할 때만 스크립트 주입
- **범위**: 사용자가 선택한 탭에만 적용
- **보안**: 자동 주입 없음, 완전히 사용자 제어

### ❌ 요청하지 않는 권한

- `<all_urls>` - 모든 웹사이트 접근 권한 (불필요)
- `tabs` - 탭 정보 읽기 (불필요)
- `storage` - 데이터 저장 (현재 미사용)
- `cookies` - 쿠키 접근 (불필요)
- `webRequest` - 네트워크 요청 가로채기 (불필요)

## 데이터 처리

### ✅ 수집하지 않는 데이터

- 개인 정보
- 브라우징 히스토리
- 쿠키
- 로그인 정보
- 폼 데이터
- 서버로 전송되는 어떠한 데이터도 없음

### ✅ 로컬에서만 처리

- CSS 분석은 100% 브라우저 내에서만 실행
- 외부 서버 통신 없음
- 네트워크 요청 없음
- 데이터 저장 없음 (세션 종료 시 모두 삭제)

## 클립보드 사용

### Clipboard API 사용 방식

```javascript
// 1순위: Modern Clipboard API (activeTab 권한으로 가능)
navigator.clipboard.writeText(text);

// 2순위: Fallback - execCommand (권한 불필요)
document.execCommand('copy');
```

- **목적**: CSS 코드를 클립보드에 복사
- **시점**: 사용자가 "Copy" 버튼을 클릭할 때만
- **범위**: 사용자가 선택한 CSS 정보만
- **보안**: 사용자가 명시적으로 요청한 경우에만 실행

## 동적 스크립트 주입

### 작동 방식

1. 사용자가 확장 프로그램 아이콘 클릭
2. Popup에서 "Start Scan Mode" 버튼 클릭
3. Background Service Worker가 content script 주입
4. 사용자가 "Stop Scan Mode" 클릭 시 종료

### 보안 특징

- ✅ 자동 주입 없음 (manifest에 content_scripts 없음)
- ✅ 사용자 명시적 동의 필요
- ✅ 특정 페이지에만 선택적 적용
- ✅ 언제든지 중지 가능

## 지원하지 않는 페이지

보안을 위해 다음 페이지에서는 작동하지 않습니다:

```javascript
const unsupportedProtocols = [
  'chrome://', // Chrome 내부 페이지
  'chrome-extension://', // 다른 확장 프로그램
  'moz-extension://', // Firefox 확장 프로그램
  'file://', // 로컬 파일 (명시적 허용 필요)
  'about:', // 브라우저 내부 페이지
  'edge://', // Edge 내부 페이지
  'browser://' // 브라우저 설정
];
```

## 코드 보안

### 1. XSS 방지

```javascript
// ❌ 위험: innerHTML에 직접 삽입
element.innerHTML = userInput;

// ✅ 안전: textContent 사용
element.textContent = userInput;

// ✅ 안전: 템플릿 리터럴은 이스케이프됨
element.innerHTML = `<div>${escapeHtml(value)}</div>`;
```

### 2. CSP (Content Security Policy)

- Inline script 사용 안 함
- eval() 사용 안 함
- 외부 리소스 로드 안 함

### 3. 에러 처리

```javascript
// 민감한 정보 노출 방지
catch (error) {
  console.error('Error occurred'); // 일반적인 메시지만
  // ❌ console.error(error.stack); // 스택 트레이스는 개발 모드에만
}
```

## 버전 관리 및 업데이트

### 보안 업데이트

- 중요 보안 패치: 24시간 내 배포
- 일반 보안 개선: 주간 업데이트
- 정기 보안 점검: 월 1회

### 변경 이력

- `v1.0.1` (2024): 보안 강화 - host_permissions 제거
- `v1.0.0` (2024): 초기 릴리스

## 취약점 신고

보안 취약점을 발견하셨다면:

### 신고 방법

1. **비공개 보고**: GitHub Security Advisory
2. **이메일**: security@yourproject.com (설정 필요)
3. **긴급**: Issue에 [SECURITY] 태그로 보고

### 신고 시 포함 사항

- 취약점 설명
- 재현 단계
- 영향 범위
- 가능한 해결 방안

### 대응 프로세스

1. 24시간 내 확인 응답
2. 7일 내 취약점 검증
3. 14일 내 패치 개발
4. 21일 내 업데이트 배포

## 감사 인사

보안 개선에 기여해주신 분들:

- (추후 추가)

## 참고 자료

- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Chrome Extension Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

**마지막 업데이트**: 2024년 (날짜 업데이트 필요)
