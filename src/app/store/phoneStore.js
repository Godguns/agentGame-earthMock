import { create } from "zustand";

const MAX_NOTIFICATIONS = 24;
const BANNER_DURATION_MS = 4800;

const MOCK_CONVERSATIONS = [
  {
    id: "misaki",
    name: "岬",
    subtitle: "最近总是很晚才睡",
    avatarText: "岬",
    avatarTone: "sunset",
    unreadCount: 2,
    messages: [
      {
        id: "misaki-1",
        sender: "them",
        text: "你今天又把灯开到很晚。",
        time: "22:11",
      },
      {
        id: "misaki-2",
        sender: "me",
        text: "只是想把桌上的东西都看清楚一点。",
        time: "22:13",
      },
      {
        id: "misaki-3",
        sender: "them",
        text: "那你记得睡前把窗户关好，夜里会下雨。",
        time: "22:14",
      },
    ],
  },
  {
    id: "akari",
    name: "灯里",
    subtitle: "像在清晨之前发来的消息",
    avatarText: "灯",
    avatarTone: "mist",
    unreadCount: 1,
    messages: [
      {
        id: "akari-1",
        sender: "them",
        text: "我把那张歌单又整理了一遍，晚点发你。",
        time: "21:42",
      },
      {
        id: "akari-2",
        sender: "them",
        text: "如果你还醒着，记得听最后一首。",
        time: "21:43",
      },
    ],
  },
  {
    id: "nanase",
    name: "七濑",
    subtitle: "总在工作群外说真话",
    avatarText: "七",
    avatarTone: "azure",
    unreadCount: 0,
    messages: [
      {
        id: "nanase-1",
        sender: "me",
        text: "今天那份需求又改了吗？",
        time: "18:08",
      },
      {
        id: "nanase-2",
        sender: "them",
        text: "改了，但我猜你已经猜到了。",
        time: "18:09",
      },
    ],
  },
];

const MOCK_NOTIFICATION_TEMPLATES = [
  {
    conversationId: "misaki",
    appId: "messages",
    title: "岬",
    body: "我把台灯替你关掉过一次，但你还是会再打开。",
  },
  {
    conversationId: "akari",
    appId: "messages",
    title: "灯里",
    body: "歌单发你了，最后一首别跳过。",
  },
  {
    conversationId: "nanase",
    appId: "messages",
    title: "七濑",
    body: "老板刚才又改了方向，明天应该会很长。",
  },
];

let bannerTimerId = null;

function formatTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function buildNotification(template, timeLabel) {
  return {
    id: `${template.appId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    appId: template.appId,
    title: template.title,
    body: template.body,
    time: timeLabel,
    conversationId: template.conversationId,
    createdAt: Date.now(),
  };
}

function appendIncomingMessage(conversation, template, timeLabel) {
  if (conversation.id !== template.conversationId) {
    return conversation;
  }

  return {
    ...conversation,
    unreadCount: conversation.unreadCount + 1,
    messages: [
      ...conversation.messages,
      {
        id: `${conversation.id}-${Date.now()}`,
        sender: "them",
        text: template.body,
        time: timeLabel,
      },
    ],
  };
}

function dismissActiveBanner(set) {
  if (typeof window !== "undefined" && bannerTimerId) {
    window.clearTimeout(bannerTimerId);
    bannerTimerId = null;
  }

  set({ activeNotification: null });
}

export const usePhoneStore = create((set, get) => ({
  theme: "day",
  notifications: [],
  activeNotification: null,
  notificationCursor: 0,
  conversations: MOCK_CONVERSATIONS,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === "day" ? "night" : "day",
    })),
  pushNotification: (template) => {
    const timeLabel = formatTime();
    const notification = buildNotification(template, timeLabel);

    set((state) => ({
      activeNotification: notification,
      notifications: [notification, ...state.notifications].slice(
        0,
        MAX_NOTIFICATIONS,
      ),
      conversations: state.conversations.map((conversation) =>
        appendIncomingMessage(conversation, template, timeLabel),
      ),
    }));

    if (typeof window !== "undefined") {
      if (bannerTimerId) {
        window.clearTimeout(bannerTimerId);
      }

      bannerTimerId = window.setTimeout(() => {
        dismissActiveBanner(set);
      }, BANNER_DURATION_MS);
    }
  },
  pushMockNotification: () => {
    const { notificationCursor } = get();
    const template =
      MOCK_NOTIFICATION_TEMPLATES[
        notificationCursor % MOCK_NOTIFICATION_TEMPLATES.length
      ];

    get().pushNotification(template);
    set({ notificationCursor: notificationCursor + 1 });
  },
  dismissNotificationBanner: () => {
    dismissActiveBanner(set);
  },
  removeNotification: (notificationId) => {
    set((state) => {
      const nextNotifications = state.notifications.filter(
        (notification) => notification.id !== notificationId,
      );
      const nextActiveNotification =
        state.activeNotification?.id === notificationId
          ? null
          : state.activeNotification;

      return {
        notifications: nextNotifications,
        activeNotification: nextActiveNotification,
      };
    });
  },
  markConversationRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    }));
  },
  sendMessage: (conversationId, text) => {
    const normalizedText = text.trim();
    if (!normalizedText) {
      return;
    }

    const timeLabel = formatTime();

    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [
                ...conversation.messages,
                {
                  id: `${conversation.id}-me-${Date.now()}`,
                  sender: "me",
                  text: normalizedText,
                  time: timeLabel,
                },
              ],
            }
          : conversation,
      ),
    }));
  },
}));
