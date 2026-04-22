import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export function LoadingSpinner({
  message = "LOADING...",
  size = "md",
}: LoadingSpinnerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} border-2 border-primary/30 border-t-primary rounded-full`}
      />
      
      <motion.div variants={itemVariants} className="flex flex-col items-center gap-2">
        <p className="font-mono text-sm text-primary tracking-widest arcade-text">
          {message}
        </p>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex gap-1"
        >
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
