import { faComment, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
export default function Loading() {
  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <div className="rounded-full bg-zinc-700 w-14 h-14 flex items-center justify-center animate-pulse"></div>
          <hr className="border-4 border-zinc-700 ml-3 w-52 rounded-md animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row w-auto justify-end items-center space-x-3">
          <div className="flex w-full items-center">
            <hr className="border-2 border-zinc-700 ml-3 w-20 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
      <div className="w-full mt-6">
        <hr className="border-[6px] border-zinc-700 w-40 rounded-md animate-pulse" />
      </div>
      <div className="w-full mt-6">
        <div className="bg-zinc-700 w-full rounded-image h-[500px] animate-pulse"></div>
      </div>
    </div>
  );
}
