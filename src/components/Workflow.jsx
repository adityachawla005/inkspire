import { CheckCircle2 } from "lucide-react";
import codeImg from "../assets/monkey.jpg";
import { checklistItems } from "../constants";

const Workflow = () => {
  return (
    <div className="mt-20 bg-black text-[#ECF0F1]">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mt-6 tracking-wide">
        Accelerate your{" "}
        <span className="bg-gradient-to-r from-[#2980B9] to-[#8E44AD] text-transparent bg-clip-text">
           workflow.
        </span>
      </h2>

      <div className="flex flex-wrap justify-center mt-12">
        {/* Image Section */}
        <div className="p-2 w-full lg:w-1/2">
          <img
            src={codeImg}
            alt="Coding"
            className="rounded-xl shadow-lg border border-[#2980B9]"
          />
        </div>

        {/* Checklist Section */}
        <div className="pt-12 w-full lg:w-1/2 px-4">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex mb-12">
              <div className="text-[#2980B9] flex-shrink-0 bg-[#1A1A1A] h-10 w-10 p-2 flex justify-center items-center rounded-full shadow-md">
                <CheckCircle2 />
              </div>
              <div className="ml-6">
                <h5 className="mt-1 mb-2 text-xl font-semibold text-[#ECF0F1]">
                  {item.title}
                </h5>
                <p className="text-md text-[#BDC3C7]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workflow;
