import { useCallback, useEffect, useState } from "react";
import { Icon, IconButton, useI18n } from "@stream-io/video-react-sdk";

export const InvitePopup = ({
  callId,
  close,
}: {
  callId: string;
  close: () => void;
}) => {
  const { t } = useI18n();
  const { isCopied, copyInviteLink } = useCopyInviteLink();

  return (
    <div className="flex flex-col gap-3 p-3 absolute bottom-6 right-6 bg-gray-800 max-w-[250px] rounded-md shadow-lg">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-base font-medium text-white m-0">
          {t("Your meeting is live!")}
        </h2>
        <IconButton
          className="text-white hover:bg-gray-700 p-1 rounded-full"
          icon="close"
          onClick={close}
        />
      </div>

      <button
        className="flex items-center justify-center gap-2 px-4 py-2 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
        onClick={copyInviteLink}
      >
        <Icon icon="person-add" />
        {isCopied ? "Copied invite link" : "Copy invite link"}
      </button>

      <p className="text-xs text-gray-300 m-0">
        {t("Or share this call ID with the others you want in the meeting:")}
      </p>
      <div
        className="flex justify-between items-center text-xs text-gray-300 cursor-pointer hover:bg-gray-700 p-1 rounded"
        onClick={copyInviteLink}
      >
        <div>
          {t("Call ID:")}
          <span className="ml-2 text-blue-400">{callId}</span>
        </div>
        <Icon icon="copy" className="text-gray-400" />
      </div>
    </div>
  );
};

export const Invite = () => {
  const { isCopied, copyInviteLink } = useCopyInviteLink();
  return (
    <div className="mt-5">
      <h2 className="text-base font-medium text-gray-800">
        Share the link
      </h2>
      <p className="text-xs text-gray-500 mt-1">
        Click the button below to copy the call link:
      </p>
      <button
        className="flex items-center justify-center gap-2 px-4 py-2 mt-4 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
        onClick={copyInviteLink}
      >
        <Icon icon="person-add" />
        {isCopied ? "Copied invite link" : "Copy invite link"}
      </button>
    </div>
  );
};

export const InvitePanel = () => {
  return (
    <div className="flex flex-col">
      <Invite />
      <div className="mt-5">
        <h2 className="text-base font-medium text-gray-800">
          Test on mobile
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          To test on a mobile device, scan the QR Code below:
        </p>
        <div className="flex justify-center items-center mt-4 bg-gray-100 w-full rounded-md p-4">
          <div className="bg-white w-[100px] h-[100px] rounded-md flex items-center justify-center border border-gray-200">
            {/* QR Code placeholder */}
            <div className="text-xs text-gray-500">QR Code</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const useCopyInviteLink = () => {
  const [isCopied, setIsCopied] = useState(false);
  const copyInviteLink = useCallback(() => {
    setIsCopied(false);
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .catch((err) => console.error("could not copy invite link", err))
      .finally(() => setIsCopied(true));
  }, []);

  useEffect(() => {
    if (!isCopied) return;
    const id = setTimeout(() => {
      setIsCopied(false);
    }, 3000);
    return () => clearTimeout(id);
  }, [isCopied]);

  return { isCopied, copyInviteLink };
};
