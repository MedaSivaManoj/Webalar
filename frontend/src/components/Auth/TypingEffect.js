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
      setDisplayed((prev) => {
        if (i < sanitizedText.length) {
          const next = prev + sanitizedText[i];
          i++;
          return next;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
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
