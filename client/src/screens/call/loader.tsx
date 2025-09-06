import { Loader as LoadingIcon } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex-center h-screen w-full">
      <LoadingIcon className="animate-spin text-green-500" size={64} />
    </div>
  );
};

export default Loader;
