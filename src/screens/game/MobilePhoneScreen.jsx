import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { hasBoundPersona, useAuthStore } from "../../app/store/authStore";
import { usePhoneStore } from "../../app/store/phoneStore";
import { pollMessages, triggerRandomMessage } from "../../services/earthMockApi";
import { VirtualPhone } from "./VirtualPhone";
import { buildPersonaProfile, readStoredPersonaAnswers } from "./personaProfile";

function resolvePersonaProfile(persona) {
  if (persona?.raw_settings?.profileVersion) {
    return persona.raw_settings;
  }

  return buildPersonaProfile(readStoredPersonaAnswers() || {});
}

export function MobilePhoneScreen() {
  const navigate = useNavigate();
  const messageCursorRef = useRef(null);
  const sceneEntryNotificationSentRef = useRef(false);
  const personaSyncedRef = useRef(false);

  const authToken = useAuthStore((state) => state.token);
  const persona = useAuthStore((state) => state.persona);
  const loadPersona = useAuthStore((state) => state.loadPersona);
  const syncPersona = useAuthStore((state) => state.syncPersona);
  const ingestServerMessages = usePhoneStore((state) => state.ingestServerMessages);
  const pushMockNotification = usePhoneStore((state) => state.pushMockNotification);

  const resolvedPersonaProfile = useMemo(
    () => resolvePersonaProfile(persona),
    [persona],
  );

  useEffect(() => {
    if (!authToken) {
      navigate("/menu");
      return;
    }

    if (!hasBoundPersona(persona)) {
      loadPersona().then((nextPersona) => {
        if (!hasBoundPersona(nextPersona)) {
          navigate("/settings", {
            state: {
              from: "menu",
              purpose: "onboarding",
              redirectTo: "/game",
            },
          });
        }
      });
    }
  }, [authToken, loadPersona, navigate, persona]);

  useEffect(() => {
    if (!authToken) {
      return undefined;
    }

    let cancelled = false;

    const pullMessages = async () => {
      try {
        const response = await pollMessages(
          {
            since: messageCursorRef.current,
            limit: 80,
          },
          authToken,
        );

        if (cancelled) {
          return;
        }

        ingestServerMessages(response?.items || []);

        if (response?.server_time) {
          messageCursorRef.current = response.server_time;
        }
      } catch (error) {
        console.warn("Failed to poll phone messages.", error);
      }
    };

    pullMessages();
    const timerId = window.setInterval(pullMessages, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(timerId);
    };
  }, [authToken, ingestServerMessages]);

  useEffect(() => {
    if (
      !authToken ||
      personaSyncedRef.current ||
      hasBoundPersona(persona) ||
      !resolvedPersonaProfile?.identity?.location?.city
    ) {
      return;
    }

    personaSyncedRef.current = true;
    syncPersona(resolvedPersonaProfile).catch((error) => {
      personaSyncedRef.current = false;
      console.warn("Failed to bind persona profile on mobile phone entry.", error);
    });
  }, [authToken, persona, resolvedPersonaProfile, syncPersona]);

  useEffect(() => {
    if (sceneEntryNotificationSentRef.current) {
      return;
    }

    if (authToken) {
      triggerRandomMessage(authToken)
        .then((response) => {
          ingestServerMessages(response?.created || []);
        })
        .catch((error) => {
          console.warn("Failed to trigger mobile phone entry message.", error);
          pushMockNotification();
        });
    } else {
      pushMockNotification();
    }

    sceneEntryNotificationSentRef.current = true;
  }, [authToken, ingestServerMessages, pushMockNotification]);

  return (
    <main className="mobile-phone-screen">
      <VirtualPhone
        state="open"
        standalone
        onClose={() => navigate("/menu")}
      />
    </main>
  );
}
