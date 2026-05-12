import { create } from "zustand";

const MAX_NOTIFICATIONS = 24;
const BANNER_DURATION_MS = 4800;
const MAX_SERVER_MESSAGE_IDS = 300;

const MOCK_CONVERSATIONS = [];

const MOCK_NOTIFICATION_TEMPLATES = [
  {
    conversationId: "system-ambient",
    conversationKey: "system:ambient",
    appId: "messages",
    title: "Earth Online",
    body: "The world is still loading a softer voice for you.",
  },
];

let bannerTimerId = null;

function formatTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function formatServerTime(value) {
  if (!value) {
    return formatTime();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return formatTime();
  }

  return formatTime(date);
}

function buildNotification(template, timeLabel, id) {
  return {
    id:
      id ||
      `${template.appId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    appId: template.appId,
    title: template.title,
    body: template.body,
    time: timeLabel,
    conversationId: template.conversationId,
    conversationKey: template.conversationKey || template.conversationId || null,
    createdAt: Date.now(),
    serverMessageId: template.serverMessageId || null,
  };
}

function appendIncomingMessage(conversation, template, timeLabel) {
  if (conversation.id !== template.conversationId) {
    return conversation;
  }

  return {
    ...conversation,
    unreadCount: conversation.unreadCount + 1,
    subtitle: template.body,
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

function safeConversationId(message) {
  return (
    message.conversation_key ||
    message.sender_name ||
    message.title ||
    "system"
  )
    .toString()
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function toneFromId(id) {
  const tones = ["sunset", "mist", "azure"];
  const charCodeSum = Array.from(id).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return tones[charCodeSum % tones.length];
}

function isPlayerMessage(message) {
  return message?.payload?.kind === "player_message";
}

function resolveConversationName(message, fallback = "System") {
  if (isPlayerMessage(message)) {
    return (
      message?.payload?.partner_name ||
      message?.title ||
      message?.conversation_key ||
      fallback
    );
  }

  return message?.sender_name || message?.title || fallback;
}

function createConversationFromServerMessage(message, conversationId) {
  const name = resolveConversationName(message, "System");

  return {
    id: conversationId,
    name,
    subtitle: message.content || "",
    avatarText: name.slice(0, 1),
    avatarTone: toneFromId(conversationId),
    conversationKey: message.conversation_key || conversationId,
    unreadCount: 0,
    messages: [],
  };
}

function upsertServerChatMessage(conversations, message) {
  const conversationId = safeConversationId(message);
  const timeLabel = formatServerTime(message.delivered_at || message.created_at);
  const messageId = `server-${message.id}`;
  const playerMessage = isPlayerMessage(message);
  const clientMessageId = message?.payload?.client_message_id || null;
  let found = false;

  const nextConversations = conversations.map((conversation) => {
    if (conversation.id !== conversationId) {
      return conversation;
    }

    found = true;

    if (conversation.messages.some((item) => item.id === messageId)) {
      return conversation;
    }

    const nextMessages = [...conversation.messages];
    const optimisticIndex =
      playerMessage && clientMessageId
        ? nextMessages.findIndex(
            (item) => item.id === clientMessageId && item.sender === "me",
          )
        : -1;

    if (optimisticIndex >= 0) {
      nextMessages[optimisticIndex] = {
        ...nextMessages[optimisticIndex],
        id: messageId,
        text: message.content,
        time: timeLabel,
      };
    } else {
      nextMessages.push({
        id: messageId,
        sender: playerMessage ? "me" : "them",
        text: message.content,
        time: timeLabel,
      });
    }

    return {
      ...conversation,
      name: resolveConversationName(message, conversation.name),
      subtitle: message.content,
      conversationKey:
        message.conversation_key || conversation.conversationKey || conversationId,
      unreadCount: playerMessage
        ? conversation.unreadCount
        : conversation.unreadCount + 1,
      messages: nextMessages,
    };
  });

  if (found) {
    return nextConversations;
  }

  const nextConversation = createConversationFromServerMessage(
    message,
    conversationId,
  );

  return [
    {
      ...nextConversation,
      unreadCount: playerMessage ? 0 : 1,
      messages: [
        {
          id: messageId,
          sender: playerMessage ? "me" : "them",
          text: message.content,
          time: timeLabel,
        },
      ],
    },
    ...nextConversations,
  ];
}

function dismissActiveBanner(set) {
  if (typeof window !== "undefined" && bannerTimerId) {
    window.clearTimeout(bannerTimerId);
    bannerTimerId = null;
  }

  set({ activeNotification: null });
}

function scheduleBannerDismiss(set) {
  if (typeof window === "undefined") {
    return;
  }

  if (bannerTimerId) {
    window.clearTimeout(bannerTimerId);
  }

  bannerTimerId = window.setTimeout(() => {
    dismissActiveBanner(set);
  }, BANNER_DURATION_MS);
}

export const usePhoneStore = create((set, get) => ({
  theme: "day",
  notifications: [],
  activeNotification: null,
  notificationCursor: 0,
  conversations: MOCK_CONVERSATIONS,
  serverMessageIds: [],
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

    scheduleBannerDismiss(set);
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
  ingestServerMessages: (messages = []) => {
    if (!Array.isArray(messages) || messages.length === 0) {
      return;
    }

    const knownIds = get().serverMessageIds;
    const freshMessages = messages.filter(
      (message) => message?.id && !knownIds.includes(message.id),
    );

    if (freshMessages.length === 0) {
      return;
    }

    let latestNotification = null;

    set((state) => {
      let nextConversations = state.conversations;
      let nextNotifications = state.notifications;

      freshMessages.forEach((message) => {
        if (message.channel === "chat") {
          nextConversations = upsertServerChatMessage(nextConversations, message);
          return;
        }

        if (message.channel === "notification") {
          const conversationId = safeConversationId(message);
          const timeLabel = formatServerTime(
            message.delivered_at || message.created_at,
          );
          latestNotification = buildNotification(
            {
              appId: "messages",
              conversationId,
              conversationKey: message.conversation_key || conversationId,
              title: message.title || message.sender_name || "New message",
              body: message.content,
              serverMessageId: message.id,
            },
            timeLabel,
            `server-notification-${message.id}`,
          );
          nextNotifications = [latestNotification, ...nextNotifications].slice(
            0,
            MAX_NOTIFICATIONS,
          );
        }
      });

      return {
        conversations: nextConversations,
        notifications: nextNotifications,
        activeNotification: latestNotification || state.activeNotification,
        serverMessageIds: [
          ...state.serverMessageIds,
          ...freshMessages.map((message) => message.id),
        ].slice(-MAX_SERVER_MESSAGE_IDS),
      };
    });

    if (latestNotification) {
      scheduleBannerDismiss(set);
    }
  },
  dismissNotificationBanner: () => {
    dismissActiveBanner(set);
  },
  removeNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== notificationId,
      ),
      activeNotification:
        state.activeNotification?.id === notificationId
          ? null
          : state.activeNotification,
    }));
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
      return null;
    }

    const timeLabel = formatTime();
    const outgoingMessage = {
      id: `${conversationId}-me-${Date.now()}`,
      sender: "me",
      text: normalizedText,
      time: timeLabel,
    };

    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              subtitle: normalizedText,
              messages: [...conversation.messages, outgoingMessage],
            }
          : conversation,
      ),
    }));

    return outgoingMessage;
  },
}));
