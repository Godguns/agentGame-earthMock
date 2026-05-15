import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatedContent } from "../../components/ui/reactbitsLite";

import { hasBoundPersona, useAuthStore } from "../../app/store/authStore";
import {
  getCitiesForProvince,
  getLocationSelection,
  LOCATION_PROVINCES,
} from "../../data/locationCatalog";
import { buildPersonaProfile } from "../game/personaProfile";
import {
  PERSONA_CALIBRATION_SECTIONS,
  SETTINGS_SECTIONS,
} from "./settingsData";
import "./settings.css";

const SETTINGS_STORAGE_KEY = "earth-online-settings";

const DEFAULT_BIRTH_DATE = {
  year: 2001,
  month: 7,
  day: 15,
};

const BIRTH_YEAR_START = 1980;
const BIRTH_YEAR_END = 2010;
const REEL_WINDOW_RADIUS = 2;

const FLAT_PERSONA_QUESTIONS = PERSONA_CALIBRATION_SECTIONS.flatMap(
  (section, sectionIndex) =>
    section.questions.map((question, questionIndex) => ({
      ...question,
      section,
      sectionIndex,
      questionIndex,
    })),
);

const SECTION_START_INDICES = PERSONA_CALIBRATION_SECTIONS.map((section) =>
  FLAT_PERSONA_QUESTIONS.findIndex((question) => question.section.id === section.id),
);

function buildDefaultAnswer(question) {
  if (question.type === "date") {
    return DEFAULT_BIRTH_DATE;
  }

  if (question.type === "location") {
    return {
      provinceId: "",
      cityId: "",
    };
  }

  if (question.type === "multi-choice") {
    return [];
  }

  if (question.allowOther) {
    return {
      selected: "",
      other: "",
    };
  }

  return "";
}

function normalizeAnswer(question, value) {
  if (question.type === "date") {
    if (
      value &&
      typeof value === "object" &&
      Number.isFinite(value.year) &&
      Number.isFinite(value.month) &&
      Number.isFinite(value.day)
    ) {
      return {
        year: value.year,
        month: value.month,
        day: value.day,
      };
    }

    return DEFAULT_BIRTH_DATE;
  }

  if (question.type === "location") {
    if (value && typeof value === "object") {
      return {
        provinceId:
          typeof value.provinceId === "string" ? value.provinceId : "",
        cityId: typeof value.cityId === "string" ? value.cityId : "",
      };
    }

    return {
      provinceId: "",
      cityId: "",
    };
  }

  if (question.type === "multi-choice") {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string" && item.trim().length > 0);
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return [value];
    }

    return [];
  }

  if (question.allowOther) {
    if (typeof value === "string") {
      return {
        selected: value,
        other: "",
      };
    }

    if (value && typeof value === "object") {
      return {
        selected: typeof value.selected === "string" ? value.selected : "",
        other: typeof value.other === "string" ? value.other : "",
      };
    }

    return {
      selected: "",
      other: "",
    };
  }

  return typeof value === "string" ? value : "";
}

function buildInitialAnswers() {
  return PERSONA_CALIBRATION_SECTIONS.reduce((accumulator, section) => {
    section.questions.forEach((question) => {
      accumulator[question.id] = buildDefaultAnswer(question);
    });

    return accumulator;
  }, {});
}

function normalizeStoredAnswers(storedAnswers) {
  return PERSONA_CALIBRATION_SECTIONS.reduce((accumulator, section) => {
    section.questions.forEach((question) => {
      accumulator[question.id] = normalizeAnswer(question, storedAnswers?.[question.id]);
    });

    return accumulator;
  }, {});
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function isAnswerComplete(question, value) {
  if (question.type === "date") {
    return Boolean(value?.year && value?.month && value?.day);
  }

  if (question.type === "location") {
    return Boolean(getLocationSelection(value));
  }

  if (question.type === "multi-choice") {
    return Array.isArray(value) && value.length > 0;
  }

  if (question.allowOther) {
    if (!value || typeof value !== "object") {
      return false;
    }

    if (!value.selected?.trim()) {
      return false;
    }

    if (value.selected === question.otherOptionValue) {
      return value.other.trim().length > 0;
    }

    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  return value.trim().length > 0;
}

function createHapticTone() {
  let audioContext;

  return () => {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext || null;

    if (!AudioContextClass) {
      return;
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(160, now);
    oscillator.frequency.exponentialRampToValueAtTime(72, now + 0.09);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.12);
  };
}

function formatBirthDate(value) {
  const year = String(value.year).padStart(4, "0");
  const month = String(value.month).padStart(2, "0");
  const day = String(value.day).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getVisibleItems(values, activeValue) {
  const activeIndex = values.indexOf(activeValue);

  return Array.from(
    { length: REEL_WINDOW_RADIUS * 2 + 1 },
    (_, offsetIndex) => {
      const offset = offsetIndex - REEL_WINDOW_RADIUS;
      const itemIndex = activeIndex + offset;

      if (itemIndex < 0 || itemIndex >= values.length) {
        return { id: `empty-${offset}`, value: null, offset };
      }

      return { id: `${values[itemIndex]}-${offset}`, value: values[itemIndex], offset };
    },
  );
}

function ChronoDateSelector({ value, onChange }) {
  const [pulseToken, setPulseToken] = useState(0);
  const playTone = useMemo(() => createHapticTone(), []);

  const yearValues = useMemo(
    () =>
      Array.from(
        { length: BIRTH_YEAR_END - BIRTH_YEAR_START + 1 },
        (_, index) => BIRTH_YEAR_START + index,
      ),
    [],
  );
  const monthValues = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index + 1),
    [],
  );
  const dayValues = useMemo(() => {
    const dayCount = getDaysInMonth(value.year, value.month);
    return Array.from({ length: dayCount }, (_, index) => index + 1);
  }, [value.month, value.year]);

  useEffect(() => {
    const maxDay = getDaysInMonth(value.year, value.month);
    if (value.day > maxDay) {
      onChange({ ...value, day: maxDay });
    }
  }, [onChange, value]);

  const triggerFeedback = () => {
    playTone();
    window.navigator.vibrate?.(10);
    setPulseToken((current) => current + 1);
  };

  const handleStep = (key, direction) => {
    const valuesByKey = {
      year: yearValues,
      month: monthValues,
      day: dayValues,
    };

    const currentValues = valuesByKey[key];
    const currentIndex = currentValues.indexOf(value[key]);
    const nextIndex = clamp(currentIndex + direction, 0, currentValues.length - 1);
    const nextValue = currentValues[nextIndex];

    if (nextValue === value[key]) {
      return;
    }

    triggerFeedback();
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  const renderReel = (key, label, values, suffix) => {
    const visibleItems = getVisibleItems(values, value[key]);

    return (
      <div className="chrono-selector__reel">
        <span className="chrono-selector__label">{label}</span>
        <button
          className="chrono-selector__step chrono-selector__step--up"
          type="button"
          onClick={() => handleStep(key, -1)}
          aria-label={`Decrease ${label}`}
        >
          <span />
        </button>

        <div
          className="chrono-selector__window"
          onWheel={(event) => {
            event.preventDefault();
            handleStep(key, event.deltaY > 0 ? 1 : -1);
          }}
        >
          <div className="chrono-selector__window-frame" />
          <div className="chrono-selector__window-glow" />

          <div className="chrono-selector__stack">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                className={`chrono-selector__value ${
                  item.offset === 0 ? "is-active" : ""
                } ${item.value === null ? "is-empty" : ""}`}
                type="button"
                disabled={item.value === null}
                onClick={() => {
                  if (item.value === null) {
                    return;
                  }

                  triggerFeedback();
                  onChange({
                    ...value,
                    [key]: item.value,
                  });
                }}
              >
                {item.value === null
                  ? " "
                  : `${String(item.value).padStart(2, "0")}${suffix}`}
              </button>
            ))}
          </div>
        </div>

        <button
          className="chrono-selector__step chrono-selector__step--down"
          type="button"
          onClick={() => handleStep(key, 1)}
          aria-label={`Increase ${label}`}
        >
          <span />
        </button>
      </div>
    );
  };

  return (
    <div className={`chrono-selector pulse-${pulseToken % 2}`}>
      <div className="chrono-selector__frame" />
      <div className="chrono-selector__statusbar">
        <span>ANCHOR.SYNC</span>
        <span>MOTOR.ONLINE</span>
        <span>{String((value.month * 7 + value.day) % 100).padStart(2, "0")}% LOCK</span>
      </div>
      <div className="chrono-selector__grid">
        {renderReel("year", "YEAR", yearValues, "")}
        {renderReel("month", "MONTH", monthValues, "")}
        {renderReel("day", "DAY", dayValues, "")}
      </div>

      <div className="chrono-selector__readout">
        <span className="chrono-selector__caption">时空坐标</span>
        <div className="chrono-selector__readout-group">
          <strong>{formatBirthDate(value)}</strong>
          <span className="chrono-selector__lock">LOCKED</span>
        </div>
      </div>
    </div>
  );
}

function DateCalibrationModal({ initialValue, onClose, onConfirm }) {
  const [draftValue, setDraftValue] = useState(initialValue);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-shell" role="dialog" aria-modal="true" aria-labelledby="chrono-modal-title">
      <button
        className="modal-shell__backdrop"
        type="button"
        aria-label="关闭日期标定弹窗"
        onClick={onClose}
      />

      <div className="modal-shell__panel">
        <div className="modal-shell__frame" />
        <div className="modal-shell__handle" aria-hidden="true" />
        <header className="modal-shell__header">
          <div>
            <p className="modal-shell__eyebrow">CHRONO CALIBRATION</p>
            <h3 id="chrono-modal-title" className="modal-shell__title">
              时空锚点校准
            </h3>
          </div>
          <p className="modal-shell__copy">
            请缓慢拨动时间坐标，直到你的原点稳定下来。
          </p>
        </header>

        <ChronoDateSelector value={draftValue} onChange={setDraftValue} />

        <footer className="modal-shell__footer">
          <button className="modal-shell__ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button
            className="modal-shell__primary"
            type="button"
            onClick={() => onConfirm(draftValue)}
          >
            写入人格缓存
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function ChoiceQuestion({ question, value, onChange }) {
  const isMultiChoice = question.type === "multi-choice";
  const selectedValues = isMultiChoice && Array.isArray(value) ? value : [];
  const selectedValue =
    !isMultiChoice && question.allowOther && value && typeof value === "object"
      ? value.selected
      : !isMultiChoice
        ? value
        : "";
  const otherValue =
    question.allowOther && value && typeof value === "object" ? value.other : "";
  const showOtherInput =
    question.allowOther && selectedValue === question.otherOptionValue;

  return (
    <fieldset className="persona-question">
      <legend className="persona-question__title">{question.prompt}</legend>
      {question.hint ? <p className="persona-question__hint">{question.hint}</p> : null}

      <div className="persona-question__choices">
        {question.options.map((option) => {
          const checked = isMultiChoice
            ? selectedValues.includes(option)
            : selectedValue === option;

          return (
            <label
              key={option}
              className={`choice-chip ${checked ? "is-active" : ""}`}
            >
              <input
                type={isMultiChoice ? "checkbox" : "radio"}
                name={question.id}
                value={option}
                checked={checked}
                onChange={() => {
                  if (isMultiChoice) {
                    const nextValue = checked
                      ? selectedValues.filter((item) => item !== option)
                      : [...selectedValues, option];

                    onChange(nextValue);
                    return;
                  }

                  if (question.allowOther) {
                    onChange({
                      selected: option,
                      other: option === question.otherOptionValue ? otherValue : "",
                    });
                    return;
                  }

                  onChange(option);
                }}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>

      {showOtherInput ? (
        <div className="persona-question__aux">
          <div className="persona-question__text-wrap">
            <input
              className="persona-question__input"
              type="text"
              value={otherValue}
              maxLength={24}
              placeholder={question.otherPlaceholder ?? "请补充说明"}
              onChange={(event) =>
                onChange({
                  selected: question.otherOptionValue,
                  other: event.target.value,
                })
              }
            />
            <span className="persona-question__counter">{otherValue.length}/24</span>
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}

function DateQuestion({ question, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="persona-question">
        <p className="persona-question__title">{question.prompt}</p>
        {question.hint ? <p className="persona-question__hint">{question.hint}</p> : null}

        <button
          className="date-trigger"
          type="button"
          onClick={() => setOpen(true)}
        >
          <span className="date-trigger__eyebrow">BIRTH ANCHOR</span>
          <strong className="date-trigger__value">{formatBirthDate(value)}</strong>
          <span className="date-trigger__hint">点击进入时空校准舱</span>
          <span className="date-trigger__beam" />
        </button>
      </div>

      {open ? (
        <DateCalibrationModal
          initialValue={value}
          onClose={() => setOpen(false)}
          onConfirm={(nextValue) => {
            onChange(nextValue);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function TextQuestion({ question, value, onChange }) {
  return (
    <div className="persona-question">
      <label className="persona-question__title" htmlFor={question.id}>
        {question.prompt}
      </label>
      <div className="persona-question__text-wrap">
        <input
          id={question.id}
          className="persona-question__input"
          type="text"
          value={value}
          maxLength={question.maxLength}
          placeholder={question.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="persona-question__counter">
          {value.length}/{question.maxLength}
        </span>
      </div>
    </div>
  );
}

function LocationQuestion({ question, value, onChange }) {
  const cities = useMemo(
    () => getCitiesForProvince(value?.provinceId),
    [value?.provinceId],
  );
  const currentSelection = getLocationSelection(value);

  return (
    <div className="persona-question">
      <p className="persona-question__title">{question.prompt}</p>
      {question.hint ? <p className="persona-question__hint">{question.hint}</p> : null}

      <div className="location-anchor">
        <div className="location-anchor__frame" />
        <div className="location-anchor__statusbar">
          <span>CITY ANCHOR</span>
          <span>WEATHER.SYNC</span>
          <span>{currentSelection ? "LOCKED" : "PENDING"}</span>
        </div>

        <div className="location-anchor__grid">
          <label className="location-anchor__field">
            <span className="location-anchor__label">省份 Province</span>
            <select
              className="location-anchor__select"
              value={value?.provinceId || ""}
              onChange={(event) => {
                onChange({
                  provinceId: event.target.value,
                  cityId: "",
                });
              }}
            >
              <option value="">请选择省份</option>
              {LOCATION_PROVINCES.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.label}
                </option>
              ))}
            </select>
          </label>

          <label className="location-anchor__field">
            <span className="location-anchor__label">城市 City</span>
            <select
              className="location-anchor__select"
              value={value?.cityId || ""}
              disabled={!value?.provinceId}
              onChange={(event) => {
                onChange({
                  provinceId: value?.provinceId || "",
                  cityId: event.target.value,
                });
              }}
            >
              <option value="">请选择城市</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="location-anchor__readout">
          <span className="location-anchor__caption">实时天气坐标</span>
          <div className="location-anchor__readout-group">
            <strong>
              {currentSelection ? currentSelection.label : "城市未标定"}
            </strong>
            <span>
              {currentSelection
                ? "游戏会按这个城市同步窗外天气"
                : "完成选择后，窗外场景会自动切换"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonaCalibrationPanel({
  answers,
  onAnswerChange,
  isCalibrationComplete,
  onComplete,
  completeLabel,
  completeDisabled,
}) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const answeredCount = useMemo(
    () =>
      FLAT_PERSONA_QUESTIONS.reduce((count, question) => {
        return count + (isAnswerComplete(question, answers[question.id]) ? 1 : 0);
      }, 0),
    [answers],
  );
  const sectionStates = useMemo(
    () =>
      PERSONA_CALIBRATION_SECTIONS.map((section) => {
        const completedQuestions = section.questions.filter((question) =>
          isAnswerComplete(question, answers[question.id]),
        ).length;

        return {
          id: section.id,
          completedQuestions,
          totalQuestions: section.questions.length,
          isComplete: completedQuestions === section.questions.length,
        };
      }),
    [answers],
  );
  const questionCount = FLAT_PERSONA_QUESTIONS.length;
  const activeEntry = FLAT_PERSONA_QUESTIONS[activeQuestionIndex];
  const activeSection = activeEntry.section;
  const sectionQuestionCount = activeSection.questions.length;
  const sectionProgress = activeEntry.questionIndex + 1;
  const currentValue = answers[activeEntry.id];
  const previousSectionIndex = Math.max(activeEntry.sectionIndex - 1, 0);
  const nextSectionIndex = Math.min(
    activeEntry.sectionIndex + 1,
    PERSONA_CALIBRATION_SECTIONS.length - 1,
  );
  const isFirstQuestion = activeQuestionIndex === 0;
  const isLastQuestion = activeQuestionIndex === questionCount - 1;

  const jumpToSection = (sectionIndex) => {
    setActiveQuestionIndex(SECTION_START_INDICES[sectionIndex]);
  };

  return (
    <div className="settings-panel settings-panel--fixed">
      <header className="settings-panel__hero">
        <div>
          <p className="settings-panel__eyebrow">PERSONA CALIBRATION</p>
          <h1 className="settings-panel__title">虚拟人格标定</h1>
        </div>

        <div className="settings-panel__summary">
          <span>已标定</span>
          <strong>
            {answeredCount} / {questionCount}
          </strong>
        </div>
      </header>

      <p className="settings-panel__intro">
        你的回答不会定义一切，但它会决定世界最初看向你的角度。
      </p>

      <div className="persona-flow">
        <header className="persona-flow__header">
          <div>
            <p className="persona-section__eyebrow">{activeSection.subtitle}</p>
            <h2 className="persona-section__title">{activeSection.title}</h2>
          </div>

          <div className="persona-flow__meta">
            <span>
              模块 {activeEntry.sectionIndex + 1}/{PERSONA_CALIBRATION_SECTIONS.length}
            </span>
            <span>
              问题 {activeQuestionIndex + 1}/{questionCount}
            </span>
          </div>
        </header>

        <div className="persona-flow__rail" aria-label="人格标定模块导航">
          {PERSONA_CALIBRATION_SECTIONS.map((section, sectionIndex) => {
            const sectionState = sectionStates[sectionIndex];
            const isActive = sectionIndex === activeEntry.sectionIndex;

            return (
              <button
                key={section.id}
                className={`persona-flow__rail-node ${
                  isActive ? "is-active" : ""
                } ${sectionState.isComplete ? "is-complete" : ""}`}
                type="button"
                onClick={() => jumpToSection(sectionIndex)}
                aria-label={section.title}
              >
                <span className="persona-flow__rail-index">
                  {String(sectionIndex + 1).padStart(2, "0")}
                </span>
                <span className="persona-flow__rail-copy">
                  <strong>{section.title}</strong>
                  <em>
                    {sectionState.isComplete
                      ? "已完成"
                      : `${sectionState.completedQuestions}/${sectionState.totalQuestions}`}
                  </em>
                </span>
                <span className="persona-flow__rail-bar">
                  <span
                    className="persona-flow__rail-fill"
                    style={{
                      transform: `scaleX(${
                        sectionState.completedQuestions / sectionState.totalQuestions
                      })`,
                    }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <section key={activeEntry.id} className="persona-card">
          <header className="persona-card__header">
            <div>
              <p className="persona-card__eyebrow">CURRENT MEMORY TRACE</p>
              <h3 className="persona-card__index">
                {sectionProgress.toString().padStart(2, "0")} /{" "}
                {sectionQuestionCount.toString().padStart(2, "0")}
              </h3>
            </div>
            <p className="persona-card__status">
              {isAnswerComplete(activeEntry, currentValue)
                ? "已写入初始人格缓存"
                : "等待确认"}
            </p>
          </header>

          <div className="persona-card__body">
            {activeEntry.type === "date" ? (
              <DateQuestion
                question={activeEntry}
                value={answers[activeEntry.id]}
                onChange={(nextValue) => onAnswerChange(activeEntry.id, nextValue)}
              />
            ) : null}

            {activeEntry.type === "text" ? (
              <TextQuestion
                question={activeEntry}
                value={answers[activeEntry.id]}
                onChange={(nextValue) => onAnswerChange(activeEntry.id, nextValue)}
              />
            ) : null}

            {activeEntry.type === "location" ? (
              <LocationQuestion
                question={activeEntry}
                value={answers[activeEntry.id]}
                onChange={(nextValue) => onAnswerChange(activeEntry.id, nextValue)}
              />
            ) : null}

            {activeEntry.type === "single-choice" || activeEntry.type === "multi-choice" ? (
              <ChoiceQuestion
                question={activeEntry}
                value={answers[activeEntry.id]}
                onChange={(nextValue) => onAnswerChange(activeEntry.id, nextValue)}
              />
            ) : null}
          </div>
        </section>

        <footer className="persona-flow__footer">
          <div className="persona-flow__footer-group">
            <button
              className="persona-flow__ghost"
              type="button"
              onClick={() => jumpToSection(previousSectionIndex)}
              disabled={activeEntry.sectionIndex === 0}
            >
              Prev Section
            </button>
            <button
              className="persona-flow__ghost"
              type="button"
              onClick={() => jumpToSection(nextSectionIndex)}
              disabled={activeEntry.sectionIndex === PERSONA_CALIBRATION_SECTIONS.length - 1}
            >
              Next Section
            </button>
          </div>

          <div className="persona-flow__footer-group">
            <button
              className="persona-flow__primary is-muted"
              type="button"
              onClick={() =>
                setActiveQuestionIndex((current) => Math.max(current - 1, 0))
              }
              disabled={isFirstQuestion}
            >
              Prev Question
            </button>
            <button
              className="persona-flow__primary"
              type="button"
              onClick={() =>
                setActiveQuestionIndex((current) =>
                  Math.min(current + 1, questionCount - 1),
                )
              }
              disabled={isLastQuestion}
            >
              {isLastQuestion ? "Calibration Complete" : "Next Question"}
            </button>
          </div>

          {onComplete ? (
            <div className="persona-flow__footer-group persona-flow__footer-group--complete">
              <button
                className="persona-flow__primary persona-flow__primary--complete"
                type="button"
                disabled={!isCalibrationComplete || completeDisabled}
                onClick={onComplete}
              >
                {completeDisabled
                  ? "Saving..."
                  : completeLabel || "Save calibration"}
              </button>
            </div>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

function PlaceholderPanel({ label, description }) {
  return (
    <div className="settings-panel settings-panel--placeholder">
      <p className="settings-panel__eyebrow">COMING NEXT</p>
      <h1 className="settings-panel__title">{label}</h1>
      <p className="settings-panel__intro">{description}</p>
      <p className="settings-placeholder__copy">
        这一栏我先给你留成设置位。等我们把人格标定和主循环接起来后，
        这里再继续补音频、文本速度、存档策略和辅助阅读选项。
      </p>
    </div>
  );
}

export function SettingsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const persona = useAuthStore((state) => state.persona);
  const syncPersona = useAuthStore((state) => state.syncPersona);
  const personaSyncStatus = useAuthStore((state) => state.personaSyncStatus);
  const personaSyncError = useAuthStore((state) => state.personaSyncError);
  const [activeSection, setActiveSection] = useState("persona");
  const [answers, setAnswers] = useState(buildInitialAnswers);
  const [isExitingToMenu, setIsExitingToMenu] = useState(false);
  const [isCompletingFlow, setIsCompletingFlow] = useState(false);
  const isOnboarding = location.state?.purpose === "onboarding";
  const redirectTo = location.state?.redirectTo || "/menu";
  const isCalibrationComplete = useMemo(
    () =>
      FLAT_PERSONA_QUESTIONS.every((question) =>
        isAnswerComplete(question, answers[question.id]),
      ),
    [answers],
  );

  useEffect(() => {
    try {
      const localDraft = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      const localAnswers = localDraft ? JSON.parse(localDraft) : null;
      const remoteAnswers = persona?.raw_settings?.rawAnswers || null;
      const shouldPreferRemote = hasBoundPersona(persona);
      const restoredAnswers = shouldPreferRemote
        ? remoteAnswers || localAnswers
        : localAnswers || remoteAnswers;

      if (restoredAnswers) {
        setAnswers(normalizeStoredAnswers(restoredAnswers));
      }
    } catch (error) {
      console.warn("Failed to restore settings draft.", error);
    }
  }, [persona]);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (!token || !isCalibrationComplete) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      syncPersona(buildPersonaProfile(answers)).catch((error) => {
        console.warn("Failed to sync persona profile.", error);
      });
    }, 10000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [answers, isCalibrationComplete, syncPersona, token]);

  const currentSection = SETTINGS_SECTIONS.find(
    (section) => section.id === activeSection,
  );

  const handleAnswerChange = (id, value) => {
    setAnswers((current) => ({
      ...current,
      [id]: value,
    }));
  };

  const handleBackToMenu = () => {
    if (isExitingToMenu) {
      return;
    }

    setIsExitingToMenu(true);
    window.setTimeout(() => {
      navigate("/menu", { state: { from: "settings" } });
    }, 620);
  };

  const handleCompleteFlow = async () => {
    if (!isCalibrationComplete || isCompletingFlow) {
      return;
    }

    const profile = buildPersonaProfile(answers);

    setIsCompletingFlow(true);
    try {
      if (token) {
        await syncPersona(profile);
      }

      navigate(redirectTo, {
        state: {
          from: "settings",
          personaBound: true,
        },
      });
    } catch (error) {
      console.warn("Failed to complete persona calibration flow.", error);
      setIsCompletingFlow(false);
    }
  };

  return (
    <main
      className={`settings-screen ${isExitingToMenu ? "is-exiting-to-menu" : ""}`}
    >
      <div className="settings-screen__backdrop" />

      <div className="settings-shell">
        <aside className="settings-sidebar">
          <button
            className="settings-sidebar__back"
            type="button"
            onClick={handleBackToMenu}
          >
            返回主菜单
          </button>

          <div className="settings-sidebar__title-wrap">
            <p className="settings-sidebar__eyebrow">SYSTEM SETTINGS</p>
            <h1 className="settings-sidebar__title">游戏设置</h1>
          </div>

          <div
            className={`settings-sidebar__sync settings-sidebar__sync--${personaSyncStatus}`}
          >
            <span>Cloud Persona</span>
            <strong>
              {!token
                ? "Local only"
                : personaSyncStatus === "syncing"
                  ? "Syncing"
                  : personaSyncStatus === "error"
                    ? "Sync failed"
                    : "Synced"}
            </strong>
            {personaSyncError ? <em>{personaSyncError}</em> : null}
          </div>

          <nav className="settings-nav" aria-label="设置分类">
            {SETTINGS_SECTIONS.map((section) => {
              const active = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  className={`settings-nav__item ${active ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                >
                  <span className="settings-nav__label">{section.label}</span>
                  <span className="settings-nav__description">
                    {section.description}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="settings-content">
          <AnimatedContent
            distance={20}
            direction="horizontal"
            ease="back.out(1.2)"
          >
            {activeSection === "persona" ? (
              <PersonaCalibrationPanel
                answers={answers}
                onAnswerChange={handleAnswerChange}
                isCalibrationComplete={isCalibrationComplete}
                onComplete={handleCompleteFlow}
                completeLabel={
                  isOnboarding ? "Save and enter game" : "Save calibration"
                }
                completeDisabled={isCompletingFlow}
              />
            ) : (
              <PlaceholderPanel
                label={currentSection?.label ?? "设置项"}
                description={currentSection?.description ?? ""}
              />
            )}
          </AnimatedContent>
        </section>
      </div>
    </main>
  );
}
