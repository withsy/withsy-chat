export function Hero() {
  return (
    <section className="w-full bg-white py-15 text-center">
      <div className="max-w-3xl mx-auto px-4">
        <div
          className="mb-6 space-y-4 selection:bg-[#EA9257] selection:text-white"
          style={{ color: "rgb(40,90,128)" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold">Clear. Yours.</h1>
          <h1 className="text-4xl md:text-5xl font-bold">
            Just the Way You Want It.
          </h1>
        </div>
        <p className="text-lg md:text-xl text-gray-600 mb-10 select-none">
          Gives you full control – transparent, customizable, and always
          savable.
        </p>
      </div>
    </section>
  );
}
