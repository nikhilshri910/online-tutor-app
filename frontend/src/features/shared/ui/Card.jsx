import { motion, useReducedMotion } from "framer-motion";

function resolveMotionTag(tagName) {
  if (tagName === "form") {
    return motion.form;
  }

  if (tagName === "article") {
    return motion.article;
  }

  return motion.section;
}

export default function Card({
  as: Tag = "section",
  className = "",
  children,
  animated = true,
  animationDelay = 0,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const finalClass = className ? `card ${className}` : "card";
  const MotionTag = resolveMotionTag(Tag);

  if (!animated || reduceMotion) {
    return (
      <Tag className={finalClass} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={finalClass}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: animationDelay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
