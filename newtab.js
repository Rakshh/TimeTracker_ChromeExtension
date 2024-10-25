document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startTimer');
    const stopButton = document.getElementById('stopTimer');
    const timerDisplay = document.getElementById('timer');
    document.getElementById('notificationPermission').addEventListener('click', requestNotificationPermission);

    function updateTimerDisplay(seconds) {
        const years = Math.floor(seconds / (365 * 24 * 3600));
        const days = Math.floor((seconds % (365 * 24 * 3600)) / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        timerDisplay.textContent = `${years}y ${days}d ${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
    }

    function padZero(num) {
        return num.toString().padStart(2, '0');
    }

    function updateTimer() {
        chrome.runtime.sendMessage({action: "getTimeLeft"}, function(response) {
            updateTimerDisplay(response.timeLeft);
        });
    }

    function requestNotificationPermission() {
        chrome.runtime.sendMessage({action: "requestNotificationPermission"}, function(response) {
          if (response.granted) {
            console.log("Notification permission granted");
          } else {
            console.log("Notification permission denied");
          }
        });
      }

    startButton.addEventListener('click', function() {
        const years = parseInt(document.getElementById('years').value) || 0;
        const days = parseInt(document.getElementById('days').value) || 0;
        const hours = parseInt(document.getElementById('hours').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const seconds = parseInt(document.getElementById('seconds').value) || 0;
        
        const duration = years * 365 * 24 * 3600 + days * 24 * 3600 + hours * 3600 + minutes * 60 + seconds;
        
        if (duration <= 0) {
            alert('Please enter a valid time');
            return;
        }
        
        chrome.runtime.sendMessage({action: "startTimer", duration: duration}, function(response) {
            if (response && response.success) {
                updateTimer();
            }
        });
    });

    stopButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({action: "stopTimer"}, function(response) {
            if (response && response.success) {
                updateTimerDisplay(0);
            }
        });
    });

    // Update timer display every second
    setInterval(updateTimer, 1000);

    // Set default timer value to 50 years
    document.getElementById('years').value = 50;

    // Initial timer update
    updateTimer();
});