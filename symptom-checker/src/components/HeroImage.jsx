import React from "react";

const HeroImage = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center mt-4 overflow-hidden">
      {/* Image */}
      <img
        src="/bannerimage2.jpg" // Ensure correct image path
        alt="Banner"
        className="w-[90%] max-w-[1200px] h-[40vh] md:h-[50vh] lg:h-[60vh] object-contain rounded-lg shadow-lg"
      />

      {/* Text Below Image */}
      <p className="w-[90%] max-w-[1200px] text-center font-bold text-xl md:text-2xl mt-4">
        Enter Your Age
      </p>
    </div>
  );
};

export default HeroImage;
