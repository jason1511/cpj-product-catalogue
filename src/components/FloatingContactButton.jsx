import { motion } from "motion/react";
import {
  createGeneralProductMessage,
  createWhatsAppLink,
} from "../utils/whatsapp";

function FloatingContactButton() {
  return (
    <motion.a
      href={createWhatsAppLink(createGeneralProductMessage())}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 hidden rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-2xl shadow-red-600/30 transition hover:bg-red-700 md:inline-flex"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
    >
      Tanya via WhatsApp
    </motion.a>
  );
}

export default FloatingContactButton;