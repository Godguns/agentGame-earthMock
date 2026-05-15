import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+-/<>[]{}";

function mergeStyle(...styles) {
  return styles.reduce((result, style) => ({ ...result, ...style }), {});
}

export function CountUp({
  from = 0,
  to,
  duration = 1,
  delay = 0,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!startWhen) {
      return undefined;
    }

    let frameId;
    let startTime;
    let delayId;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
        onStart?.();
      }

      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(from + (to - from) * eased);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        onEnd?.();
      }
    };

    delayId = window.setTimeout(() => {
      frameId = window.requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      window.clearTimeout(delayId);
      window.cancelAnimationFrame(frameId);
    };
  }, [delay, duration, from, onEnd, onStart, startWhen, to]);

  const rounded = Math.round(value);
  const text = separator
    ? rounded.toLocaleString("en-US").replaceAll(",", separator)
    : String(rounded);

  return <span className={className}>{text}</span>;
}

export function BlurText({ text = "", className = "", animateBy = "words", direction = "bottom", delay = 40 }) {
  const parts = animateBy === "letters" ? Array.from(text) : text.split(/(\s+)/);
  const y = direction === "top" ? -12 : 12;

  return (
    <span className={className} aria-label={text}>
      {parts.map((part, index) => {
        const isSpace = /^\s+$/.test(part);
        return (
          <motion.span
            key={`${part}-${index}`}
            aria-hidden="true"
            style={{ display: isSpace ? "inline" : "inline-block" }}
            initial={{ opacity: 0, filter: "blur(8px)", y }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.42, delay: (index * delay) / 1000 }}
          >
            {part}
          </motion.span>
        );
      })}
    </span>
  );
}

export function Bounce({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedContent({
  children,
  distance = 24,
  direction = "vertical",
  reverse = false,
  duration = 0.55,
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  delay = 0,
  onComplete,
}) {
  const axis = direction === "horizontal" ? "x" : "y";
  const offset = reverse ? -distance : distance;

  return (
    <motion.div
      initial={{
        opacity: animateOpacity ? initialOpacity : 1,
        scale,
        [axis]: offset,
      }}
      animate={{ opacity: 1, scale: 1, [axis]: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
}

export function DecryptedText({
  text,
  speed = 45,
  maxIterations = 12,
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn,
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    const intervalId = window.setInterval(() => {
      iteration += 1;
      const progress = iteration / maxIterations;
      const nextText = Array.from(text)
        .map((char, index) => {
          if (char === " " || index / text.length < progress) {
            return char;
          }
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setDisplayText(nextText);

      if (iteration >= maxIterations) {
        window.clearInterval(intervalId);
        setDisplayText(text);
      }
    }, speed);

    return () => window.clearInterval(intervalId);
  }, [maxIterations, speed, text]);

  return (
    <span className={parentClassName}>
      <span
        {...props}
        className={`${displayText === text ? className : encryptedClassName || className}`}
      >
        {displayText}
      </span>
    </span>
  );
}

export function Magnet({
  children,
  disabled = false,
  magnetStrength = 0.2,
  wrapperClassName = "",
  innerClassName = "",
  style,
  ...props
}) {
  const innerRef = useRef(null);

  const handleMove = (event) => {
    if (disabled || !innerRef.current) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) * magnetStrength;
    const y = (event.clientY - bounds.top - bounds.height / 2) * magnetStrength;
    innerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const reset = () => {
    if (innerRef.current) {
      innerRef.current.style.transform = "translate3d(0, 0, 0)";
    }
  };

  return (
    <div
      {...props}
      className={wrapperClassName}
      style={mergeStyle({ display: "block", width: "100%" }, style)}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      <div
        ref={innerRef}
        className={innerClassName}
        style={{ transition: "transform 180ms ease-out" }}
      >
        {children}
      </div>
    </div>
  );
}

export function GlareHover({
  children,
  width = "auto",
  height = "auto",
  background = "transparent",
  borderRadius = "0",
  borderColor = "transparent",
  glareColor = "rgba(255,255,255,0.28)",
  glareOpacity = 0.35,
  glareSize = 160,
  className = "",
  style,
}) {
  const [position, setPosition] = useState({ x: 50, y: 50, active: false });
  const glareStyle = useMemo(
    () => ({
      background: `radial-gradient(circle ${glareSize}px at ${position.x}% ${position.y}%, ${glareColor}, transparent 62%)`,
      opacity: position.active ? glareOpacity : 0,
    }),
    [glareColor, glareOpacity, glareSize, position],
  );

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition({
      active: true,
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  return (
    <div
      className={className}
      style={mergeStyle(
        {
          position: "relative",
          overflow: "hidden",
          width,
          height,
          background,
          borderRadius,
          border: `1px solid ${borderColor}`,
        },
        style,
      )}
      onMouseMove={handleMove}
      onMouseLeave={() => setPosition((current) => ({ ...current, active: false }))}
    >
      <span
        aria-hidden="true"
        style={{
          ...glareStyle,
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          transition: "opacity 180ms ease",
          zIndex: 1,
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}

export function ClickSpark({
  children,
  sparkColor = "rgba(255,255,255,0.55)",
  sparkSize = 8,
  sparkRadius = 18,
  sparkCount = 6,
  duration = 420,
}) {
  const [sparks, setSparks] = useState([]);

  const handleClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const origin = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    setSparks(
      Array.from({ length: sparkCount }, (_, index) => ({
        id: `${Date.now()}-${index}`,
        angle: (Math.PI * 2 * index) / sparkCount,
        origin,
      })),
    );

    window.setTimeout(() => setSparks([]), duration);
  };

  return (
    <span
      style={{ position: "relative", display: "inline-block", width: "100%" }}
      onClick={handleClick}
    >
      {children}
      {sparks.map((spark) => (
        <motion.span
          key={spark.id}
          aria-hidden="true"
          initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
          animate={{
            x: Math.cos(spark.angle) * sparkRadius,
            y: Math.sin(spark.angle) * sparkRadius,
            opacity: 0,
            scale: 0.25,
          }}
          transition={{ duration: duration / 1000, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: spark.origin.x,
            top: spark.origin.y,
            width: sparkSize,
            height: sparkSize,
            borderRadius: "50%",
            background: sparkColor,
            pointerEvents: "none",
          }}
        />
      ))}
    </span>
  );
}
