import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "../constants";

const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <nav className="sticky top-0 z-50 py-4 px-6 bg-transparent text-white backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <span className="text-2xl font-bold">Inkspire</span>

        <ul className="hidden lg:flex ml-14 space-x-8 text-lg font-medium">
          {navItems.map((item, index) => (
            <li key={index} className="relative group">
              <a
                href={item.href}
                className="hover:text-indigo-300 transition-all duration-200 ease-in-out"
              >
                {item.label}
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"></span>
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex space-x-6">
          <a
            href="#"
            className="py-2 px-4 border border-indigo-300 rounded-lg hover:bg-indigo-300 hover:text-[#1A1A40] transition-all duration-200"
          >
            Sign In
          </a>
          <a
            href="#"
            className="bg-gradient-to-r from-[#5A2D99] to-[#7B3F97] py-2 px-4 rounded-lg text-white font-medium hover:opacity-90 transition-all duration-200"
          >
            Create an account
          </a>
        </div>

        <div className="lg:hidden flex flex-col justify-end">
          <button onClick={toggleNavbar} className="text-white p-2">
            {mobileDrawerOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileDrawerOpen && (
        <div className="fixed right-0 z-20 bg-[#1A1A40] w-full p-8 flex flex-col justify-center items-center lg:hidden shadow-lg text-white transition-all duration-300 ease-in-out">
          <ul className="space-y-6">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className="text-indigo-200 text-lg hover:text-pink-300 transition-all duration-200"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex space-x-6 mt-6">
            <a
              href="#"
              className="py-2 px-4 border border-indigo-300 rounded-lg text-indigo-200 hover:bg-indigo-400 hover:text-[#1A1A40] transition-all duration-200"
            >
              Sign In
            </a>
            <a
              href="#"
              className="py-2 px-4 rounded-lg bg-gradient-to-r from-[#5A2D99] to-[#7B3F97] text-white hover:opacity-90 transition-all duration-200"
            >
              Create an account
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
