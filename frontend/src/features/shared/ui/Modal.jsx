import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId } from "react";
import Button from "./Button";

export default function Modal({ isOpen, title, onClose, children }) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={onClose}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="modal-header">
              <h2 className="modal-title" id={titleId}>
                {title}
              </h2>
              <Button
                type="button"
                variant="ghost"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close modal"
              >
                X
              </Button>
            </div>
            <div className="modal-body">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
