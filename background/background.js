// Service Worker for Manifest V3 - Performance Optimized
class BackgroundService {
  constructor() {
    this.tabCache = new Map();
    this.lastCleanup = Date.now();
    this.cleanupInterval = 300000; // 5분마다 캐시 정리
    this.init();
  }
  
  init() {
    // 확장프로그램 설치시
    chrome.runtime.onInstalled.addListener(() => {
      console.log('CSS Scanner Extension installed');
      this.setupPerformanceMonitoring();
    });
    
    // 메시지 리스너
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // 비동기 응답 유지
    });
    
    // 탭 변경 감지 (캐시 정리용)
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.tabCache.delete(tabId);
    });
    
    // 주기적 캐시 정리
    setInterval(() => {
      this.performPeriodicCleanup();
    }, this.cleanupInterval);
  }
  
  setupPerformanceMonitoring() {
    // 성능 모니터링 설정
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('css-scanner-extension-start');
    }
  }
  
  performPeriodicCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup > this.cleanupInterval) {
      // 오래된 캐시 엔트리 제거
      for (const [tabId, data] of this.tabCache.entries()) {
        if (now - data.timestamp > this.cleanupInterval) {
          this.tabCache.delete(tabId);
        }
      }
      this.lastCleanup = now;
      console.log('Background service cache cleaned up');
    }
  }
  
  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('Background received message:', request);
      
      if (request.action === 'ensureContentScript') {
        const result = await this.ensureContentScript(request.tabId);
        sendResponse(result);
      } else {
        sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background message handling error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Content script 주입 함수 (성능 최적화)
  async ensureContentScript(tabId) {
    try {
      // 캐시 확인
      const cached = this.tabCache.get(tabId);
      if (cached && Date.now() - cached.timestamp < 30000) { // 30초 캐시
        console.log('Using cached content script status');
        return cached.result;
      }
      
      // 먼저 ping으로 content script 확인
      try {
        const response = await this.sendMessageWithTimeout(tabId, { action: 'ping' }, 1000);
        if (response && response.pong) {
          console.log('Content script already loaded');
          const result = { success: true };
          this.tabCache.set(tabId, { result, timestamp: Date.now() });
          return result;
        }
      } catch (pingError) {
        console.log('Content script not found, will inject');
      }

      // Content script 주입
      try {
        console.log('Injecting content script...');
        
        // 병렬로 스크립트와 CSS 주입 (성능 최적화)
        await Promise.all([
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content/content.js']
          }),
          chrome.scripting.insertCSS({
            target: { tabId: tabId },
            files: ['content/content.css']
          })
        ]);
        
        console.log('Content script injected successfully');
        
        // 주입 후 잠시 대기
        await this.delay(500);
        
        // 주입 확인 (타임아웃 추가)
        try {
          const testResponse = await this.sendMessageWithTimeout(tabId, { action: 'ping' }, 2000);
          if (testResponse && testResponse.pong) {
            const result = { success: true };
            this.tabCache.set(tabId, { result, timestamp: Date.now() });
            return result;
          } else {
            const result = { success: false, error: 'Content script injection verification failed' };
            this.tabCache.set(tabId, { result, timestamp: Date.now() });
            return result;
          }
        } catch (verifyError) {
          const result = { success: false, error: 'Content script not responding after injection' };
          this.tabCache.set(tabId, { result, timestamp: Date.now() });
          return result;
        }
        
      } catch (injectError) {
        console.error('Injection failed:', injectError);
        const result = { success: false, error: `Injection failed: ${injectError.message}` };
        this.tabCache.set(tabId, { result, timestamp: Date.now() });
        return result;
      }
      
    } catch (error) {
      console.error('ensureContentScript error:', error);
      const result = { success: false, error: error.message };
      this.tabCache.set(tabId, { result, timestamp: Date.now() });
      return result;
    }
  }
  
  // 타임아웃이 있는 메시지 전송 (성능 최적화)
  sendMessageWithTimeout(tabId, message, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, timeout);
      
      chrome.tabs.sendMessage(tabId, message, (response) => {
        clearTimeout(timer);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
  
  // 지연 유틸리티
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 백그라운드 서비스 초기화
new BackgroundService();