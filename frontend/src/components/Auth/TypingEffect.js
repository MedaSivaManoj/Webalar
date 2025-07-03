import React, { useEffect, useState } from "react";

const TypingEffect = ({ text = "", speed = 60 }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    // Ensure the text is a string
    const sanitizedText = String(text);
    console.log("✅ TypingEffect received:", sanitizedText);

    let i = 0;
    setDisplayed(""); // reset before typing

    const interval = setInterval(() => {
      if (i < 35) {
        setDisplayed((prev) => prev + sanitizedText[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span style={{
      fontFamily: 'monospace',
      fontWeight: 700,
      fontSize: '2rem',
      color: '#1976d2',
      letterSpacing: 1.2,
      whiteSpace: 'pre-line',
      textShadow: '0 2px 8px #90caf9'
    }}>
      {displayed}
    </span>
  );
};

export default TypingEffect;
