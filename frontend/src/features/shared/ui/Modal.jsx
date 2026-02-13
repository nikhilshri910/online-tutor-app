import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Button from "./Button";

export default function Modal({ isOpen, title, onClose, children }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onMouseDown={onClose}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.div
            className="modal-card"
            onMouseDown={(event) => event.stopPropagation()}
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
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
