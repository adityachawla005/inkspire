import { testimonials } from "../constants";

const Testimonials = () => {
  return (
    <div className="mt-20 bg-black text-[#ECF0F1]">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center my-10 lg:my-20 tracking-wide">
        What People Are Saying
      </h2>
      <div className="flex flex-wrap justify-center">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 px-4 py-2">
            <div className="bg-[#1A1A1A] rounded-xl p-6 text-md border border-[#2980B9] shadow-md hover:shadow-lg hover:shadow-[#2980B9]/30 transition duration-300 h-full">
              <p className="text-[#BDC3C7] leading-relaxed mb-6">
                “{testimonial.text}”
              </p>
              <div className="flex items-center">
                <img
                  className="w-12 h-12 mr-4 rounded-full border-4 border-[#2980B9] object-cover"
                  src={testimonial.image}
                  alt={`Photo of ${testimonial.user}`}
                />
                <div>
                  <h6 className="text-lg font-semibold text-[#ECF0F1]">
                    {testimonial.user}
                  </h6>
                  <span className="text-sm italic text-[#BDC3C7]">
                    {testimonial.company}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
