import { Link } from "react-router-dom";
import {
  createGeneralProductMessage,
  createWhatsAppLink,
} from "../utils/whatsapp";

function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-7xl gap-2">
        <Link
          to="/catalogue"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-800"
        >
          Katalog
        </Link>

        <a
          href={createWhatsAppLink(createGeneralProductMessage())}
          target="_blank"
          rel="noreferrer"
          className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-red-600/20"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}

export default MobileContactBar;