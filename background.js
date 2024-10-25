chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['endTime'], (result) => {
      if (result.endTime) {
        const now = Date.now();
        if (result.endTime > now) {
          const remainingTime = Math.floor((result.endTime - now) / 1000);
          chrome.alarms.create('timer', { when: result.endTime });
          updateBadge(remainingTime);
        } else {
          chrome.storage.local.remove(['endTime']);
        }
      }
    });
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'timer') {
      chrome.storage.local.remove(['endTime']);
      chrome.permissions.contains({permissions: ['notifications']}, (result) => {
        if (result) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Timer Finished',
            message: 'Your timer has finished!'
          });
        }
      });
      updateBadge(0);
    }
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startTimer") {
      const endTime = Date.now() + request.duration * 1000;
      chrome.storage.local.set({ endTime: endTime }, () => {
        chrome.alarms.create('timer', { when: endTime });
        updateBadge(request.duration);
        sendResponse({success: true});
      });
      return true;
    } else if (request.action === "stopTimer") {
      chrome.alarms.clear('timer');
      chrome.storage.local.remove(['endTime']);
      updateBadge(0);
      sendResponse({success: true});
      return true;
    } else if (request.action === "getTimeLeft") {
      chrome.storage.local.get(['endTime'], (result) => {
        if (result.endTime) {
          const timeLeft = Math.max(0, Math.floor((result.endTime - Date.now()) / 1000));
          sendResponse({ timeLeft: timeLeft });
        } else {
          sendResponse({ timeLeft: 0 });
        }
      });
      return true;
    } else if (request.action === "requestNotificationPermission") {
      chrome.permissions.request({permissions: ['notifications']}, (granted) => {
        sendResponse({granted: granted});
      });
      return true;
    }
  });
  
  function updateBadge(seconds) {
    const years = Math.floor(seconds / (365 * 24 * 3600));
    chrome.action.setBadgeText({ text: years > 0 ? years.toString() + 'y' : '' });
  }