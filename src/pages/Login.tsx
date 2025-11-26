import { useLogin } from "@refinedev/core";
import Header from "../assets/images/header-2.png";
import googleLogo from "../assets/images/google-logo.png";

export const Login = () => {
  const { mutate: login, isPending } = useLogin();

  return (
    <div className="w-full h-dvh bg-[#D1E2EB] flex flex-col justify-center items-center px-4">
      <div className="bg-[#EFEFEF] p-10 rounded-lg flex flex-col gap-6 sm:gap-8 w-full max-w-md">
        <img
          src={Header}
          alt="Saint Louis University"
          className="w-100 h-auto object-contain"
        />
        {/* Google Sign In */}
        <div className="flex flex-col gap-4">
          <button
            disabled={isPending}
            onClick={() => {
              login({});
            }}
            className="flex items-center gap-4 justify-center border-(--primary) border cursor-pointer rounded-lg p-3 transition duration-200 hover:bg-(--primary)] text-(--primary) hover:text-white"
            // className="flex items-center gap-4 justify-center border-(--primary)] border cursor-pointer rounded-[8px] p-3 transition duration-200 hover:bg-[rgba(7,48,102,0.1)] text-(--primary)]"
          >
            <img src={googleLogo} alt="Google Logo" className="w-5 h-auto" />
            Sign in with Google
          </button>
          <p className="text-center text-xs sm:text-sm flex flex-col gap-1 items-center justify-center text-(--dark-secondary) w-full">
            <span className="mb-4">
              We are currently in the testing phase. To access the student
              portal, please use your SLU email. To access the administrator
              portal, you may use any email address.
            </span>
            <span>
              Your participation is appreciated as we refine the system.
            </span>
          </p>
          {/* <p className="text-xs sm:text-sm flex gap-1 items-center justify-center text-(--dark-secondary) w-full">
            Only emails ending with @slu.edu.ph are allowed
          </p> */}
        </div>
      </div>
    </div>
  );
};
