type ButtonState = 'loading' | 'error' | 'normal';
type StatusType = 'active' | 'error' | 'normal';

/**
 * PopupController class - Manages the extension popup UI
 * Handles scan toggling, tab checking, and content script preparation
 */
class PopupController {
  private scanButton: HTMLElement;
  private status: HTMLElement;
  private isScanning: boolean;

  constructor() {
    this.scanButton = document.getElementById('toggleScan')!;
    this.status = document.getElementById('status')!;
    this.isScanning = false;

    this.init();
  }

  private init(): void {
    this.scanButton.addEventListener('click', () => this.toggleScan());
    this.checkCurrentTab();
  }

  private async checkCurrentTab(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        this.updateStatus('Cannot find active tab', 'error');
        this.disableButton();
        return;
      }

      console.log('Current tab:', tab);

      // URL safety check
      if (!tab.url || this.isUnsupportedPage(tab.url)) {
        this.updateStatus('CSS Scanner cannot be used on this page', 'error');
        this.disableButton();
        return;
      }

      // Prepare content script
      const prepared = await this.prepareContentScript(tab.id!);
      if (!prepared) {
        this.updateStatus('An error occurred while preparing the page', 'error');
        this.disableButton();
        return;
      }

      // Check scan status
      await this.checkScanStatus();
    } catch (error) {
      console.error('Error checking tab:', error);
      this.updateStatus('An error occurred while checking the page', 'error');
      this.disableButton();
    }
  }

  private isUnsupportedPage(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return true;
    }

    const unsupportedProtocols = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'file://',
      'about:',
      'edge://',
      'browser://'
    ];
    return unsupportedProtocols.some((protocol) => url.startsWith(protocol));
  }

  private async prepareContentScript(tabId: number): Promise<boolean> {
    try {
      console.log('Preparing content script for tab:', tabId);

      // Direct ping test
      try {
        const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        if (response && response.pong) {
          console.log('Content script already ready');
          return true;
        }
      } catch (_pingError) {
        console.log('Content script not ready, will inject');
      }

      // Injection through background script
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'ensureContentScript',
          tabId: tabId
        });

        console.log('Background script response:', response);

        if (response && response.success) {
          return true;
        } else {
          console.error('Background script injection failed:', response);
          return false;
        }
      } catch (backgroundError) {
        console.error('Background script communication failed:', backgroundError);
        return false;
      }
    } catch (error) {
      console.error('Content script preparation failed:', error);
      return false;
    }
  }

  private async toggleScan(): Promise<void> {
    try {
      this.updateButtonState('loading');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab) {
        this.updateStatus('Cannot find active tab', 'error');
        this.updateButtonState('error');
        return;
      }

      // Check content script preparation
      const prepared = await this.prepareContentScript(tab.id!);
      if (!prepared) {
        this.updateStatus('Page preparation failed', 'error');
        this.updateButtonState('error');
        return;
      }

      // Request scan toggle
      try {
        const response = await chrome.tabs.sendMessage(tab.id!, {
          action: 'toggleScan'
        });

        console.log('Toggle scan response:', response);

        if (response && response.success !== undefined) {
          this.isScanning = response.isScanning;
          this.updateUI();
        } else {
          throw new Error('Invalid response from content script');
        }
      } catch (messageError) {
        console.error('Message error:', messageError);
        throw new Error('Failed to toggle scan mode');
      }
    } catch (error) {
      console.error('Error toggling scan:', error);
      this.updateStatus('Error occurred: ' + (error as Error).message, 'error');
      this.updateButtonState('error');

      // Restore button state after 3 seconds
      setTimeout(() => {
        this.updateButtonState('normal');
      }, 3000);
    }
  }

  private async checkScanStatus(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab && tab.id) {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'getScanStatus'
          });

          if (response && response.isScanning !== undefined) {
            this.isScanning = response.isScanning;
            this.updateUI();
          } else {
            this.updateStatus('Click the button to start scan mode', 'normal');
          }
        } catch (_statusError) {
          console.log('Content script not ready for status check');
          this.updateStatus('Click the button to start scan mode', 'normal');
        }
      }
    } catch (error) {
      console.log('Status check failed:', error);
      this.updateStatus('Click the button to start scan mode', 'normal');
    }
  }

  private updateButtonState(state: ButtonState): void {
    const btnText = this.scanButton.querySelector('.btn-text') as HTMLElement;
    const btnIcon = this.scanButton.querySelector('.btn-icon') as HTMLElement;

    (this.scanButton as HTMLButtonElement).disabled = false;
    this.scanButton.classList.remove('loading', 'error', 'disabled');

    switch (state) {
      case 'loading':
        (this.scanButton as HTMLButtonElement).disabled = true;
        this.scanButton.classList.add('loading');
        btnIcon.textContent = '⏳';
        btnText.textContent = 'Loading...';
        break;

      case 'error':
        this.scanButton.classList.add('error');
        btnIcon.textContent = '❌';
        btnText.textContent = 'Error Occurred';
        break;

      case 'normal':
      default:
        btnIcon.textContent = '🎯';
        this.updateUI();
        break;
    }
  }

  private updateUI(): void {
    const btnText = this.scanButton.querySelector('.btn-text') as HTMLElement;

    if (this.isScanning) {
      this.scanButton.classList.add('active');
      this.scanButton.classList.remove('error', 'loading', 'disabled');
      btnText.textContent = 'Stop Scan Mode';
      this.updateStatus('Scan mode is active. Hover over webpage elements!', 'active');
    } else {
      this.scanButton.classList.remove('active', 'error', 'loading', 'disabled');
      btnText.textContent = 'Start Scan Mode';
      this.updateStatus('Click the button to start scan mode', 'normal');
    }
  }

  private disableButton(): void {
    (this.scanButton as HTMLButtonElement).disabled = true;
    this.scanButton.classList.add('disabled');
    this.scanButton.classList.remove('active', 'loading', 'error');
    const btnText = this.scanButton.querySelector('.btn-text') as HTMLElement;
    const btnIcon = this.scanButton.querySelector('.btn-icon') as HTMLElement;
    btnIcon.textContent = '🚫';
    btnText.textContent = 'Unavailable';
  }

  private updateStatus(message: string, type: StatusType = 'normal'): void {
    this.status.textContent = message;
    this.status.classList.remove('active', 'error');

    if (type === 'active') {
      this.status.classList.add('active');
    } else if (type === 'error') {
      this.status.classList.add('error');
    }
  }
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
