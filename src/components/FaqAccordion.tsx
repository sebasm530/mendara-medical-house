"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { frequentlyAskedQuestions } from "@/data/frequentlyAskedQuestions";
import styles from "./FaqSection.module.css";

function formatAnswer(answer: string) {
  return answer.split(/(\$1,200 \+ IVA|3 años|1 de noviembre de 2026|un solo especialista por especialidad|Lunes a sábado|8:00 a\. m\. a 6:00 p\. m\.|Colegio de Médicos y Cirujanos de Costa Rica)/g)
    .map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part);
}

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = frequentlyAskedQuestions.length - 1;
    const next = event.key === "ArrowDown" ? (index + 1) % (last + 1)
      : event.key === "ArrowUp" ? (index + last) % (last + 1)
      : event.key === "Home" ? 0 : event.key === "End" ? last : null;
    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
  }

  return (
    <div className={styles.accordion}>
      {frequentlyAskedQuestions.map(({ question, answer }, index) => {
        const expanded = openIndex === index;
        const triggerId = `faq-question-${index + 1}`;
        const panelId = `faq-answer-${index + 1}`;
        return (
          <div className={styles.item} key={question} data-motion-group="faq-question">
            <div data-motion="rise" data-motion-delay={Math.min(index * 0.04, 0.24)}>
              <h3 className={styles.question}>
                <button
                  ref={(button) => { buttons.current[index] = button; }}
                  type="button"
                  id={triggerId}
                  className={styles.trigger}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex((current) => current === index ? null : index)}
                  onKeyDown={(event) => navigate(event, index)}
                >
                  <span>{question}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={triggerId} aria-hidden={!expanded} inert={!expanded} className={styles.panel} data-open={expanded}>
                <div className={styles.answerClip}><p className={styles.answer}>{formatAnswer(answer)}</p></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
