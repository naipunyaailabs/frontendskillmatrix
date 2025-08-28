import React from "react";
import { Button } from "react-bootstrap";

const Question = ({ question, options, selectedAnswer, onAnswer }) => {
  return (
    <div>
      <h3>{question}</h3>
      {options.map((option, index) => (
        <Button
          key={index}
          className={`option-button ${selectedAnswer === option ? "selected" : ""}`}
          onClick={() => onAnswer(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};

export default Question;