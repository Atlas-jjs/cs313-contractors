import { useGo } from "@refinedev/core";

export const ErrorComponent = () => {
  const go = useGo();
  return (
    <>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="2xl:text-[400px] lg:text-[200px] text-9xl font-bold leading-none overflow-hidden">
          404
        </div>
        <h1 className="2xl:text-4xl text-2xl font-bold">
          Oops! This Page is Not Found.
        </h1>
        <p className="2xl:text-xl 2xl:mb-8 mb-4">
          The requested page does not exist
        </p>
        <button
          className="bg-(--primary) 2xl:py-4 p-2 px-8 rounded-xl hover:bg-(--primary-hover) duration-200 transition all cursor-pointer text-white font-semibold"
          onClick={() =>
            go({
              to: "/",
            })
          }
        >
          Back to Home
        </button>
      </div>
    </>
  );
};
