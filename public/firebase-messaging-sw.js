// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCNIW3UNs24fZrumYr0KW8AYICDKgZFvTI",
  authDomain: "sawa-web.firebaseapp.com",
  projectId: "sawa-web",
  storageBucket: "sawa-web.firebasestorage.app",
  messagingSenderId: "645826863448",
  appId: "1:645826863448:web:418a3da202e2eee2d8852d",
});

const messaging = firebase.messaging();

// استقبال إشعار والموقع مقفول أو في تبويب تاني
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "سوا";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon-192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});