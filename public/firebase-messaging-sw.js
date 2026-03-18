importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB4cNu8BXckgy4gJ7bNlEf9Cqp4VxfkRW4',
  authDomain: 'gaibandha-blood-bank.firebaseapp.com',
  projectId: 'gaibandha-blood-bank',
  messagingSenderId: '898790675545',
  appId: '1:898790675545:web:e6571a0b3bc0904e514d48',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Gaibandha Blood Bank', {
    body: body || 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data,
  });
});
