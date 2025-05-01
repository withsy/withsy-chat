import type { User } from "@/types/user";
import ReturnButton from "./ReturnButton";
import LoginButton from "../login/LoginButton";

export function Hero({ user }: { user: User | null }) {
  return (
    <section className="w-full bg-transparent pt-15 pb-10 text-center relative overflow-hidden z-0">
      <div className="absolute top-[-100px] left-[-100px] w-[200px] h-[200px] bg-[#EA9257] rounded-full -z-1" />
      <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-[#EA9257] rounded-full -z-1" />

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
      {user != undefined ? (
        <ReturnButton size="lg" />
      ) : (
        <LoginButton size="lg" />
      )}
    </section>
  );
}
