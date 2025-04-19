import { CheckCircle2 } from "lucide-react";
import { pricingOptions } from "../constants";

const Pricing = () => {
  return (
    <div className="mt-20 bg-black text-[#ECF0F1]">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center my-8 tracking-wide">
        Pricing
      </h2>
      <div className="flex flex-wrap justify-center">
        {pricingOptions.map((option, index) => (
          <div
            key={index}
            className={`w-full sm:w-1/2 lg:w-1/3 p-4 ${
              option.title === "Pro" ? "scale-105 transition-transform duration-300" : ""
            }`}
          >
            <div
              className={`p-10 border rounded-xl shadow-lg bg-[#1A1A1A] ${
                option.title === "Pro"
                  ? "border-[#8E44AD] shadow-[#8E44AD]/40"
                  : "border-[#2980B9]"
              }`}
            >
              <p className="text-3xl sm:text-4xl lg:text-5xl mb-4 text-[#ECF0F1]">
                {option.title}
                {option.title === "Pro" && (
                  <span className="bg-gradient-to-r from-[#2980B9] to-[#8E44AD] text-transparent bg-clip-text text-xl ml-2">
                    (Most Popular)
                  </span>
                )}
              </p>

              {option.title === "Pro" && (
                <p className="text-sm text-[#BDC3C7] italic mb-6">
                  Ideal for professional animators & studios
                </p>
              )}

              <p className="mb-8">
                <span className="text-4xl sm:text-5xl mr-2">{option.price}</span>
                <span className="text-[#BDC3C7] tracking-tight text-lg">/Month</span>
              </p>

              <ul>
                {option.features.map((feature, index) => (
                  <li key={index} className="mt-6 flex items-center text-[#BDC3C7]">
                    <CheckCircle2 className="text-[#2980B9]" />
                    <span className="ml-2">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                aria-label={`Subscribe to ${option.title} Plan`}
                className="inline-flex justify-center items-center text-center w-full h-12 p-5 mt-16 tracking-tight text-lg hover:bg-[#2980B9] hover:text-[#ECF0F1] border border-[#2980B9] rounded-lg transition duration-200"
              >
                Subscribe
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
