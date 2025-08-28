import React from 'react';
import { Button, Card } from 'react-bootstrap';

const Result = ({ score, totalQuestions, onRestart }) => {
  return (
    <Card className="text-center">
      <Card.Body>
        <Card.Title>Quiz Completed!</Card.Title>
        <Card.Text>
          You scored {score} out of {totalQuestions}.
        </Card.Text>
        <Button variant="primary" onClick={onRestart}>
          Restart Quiz
        </Button>
      </Card.Body>
    </Card>
  );
};

export default Result;