import { ReactNode } from "react";
import {
  StreamVideoClient,
  StreamVideo,
  User,
} from "@stream-io/video-react-sdk";

import Loader from "@/screens/call/loader";

export const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const user: User = { id: "Dash_Rendar" };
  const apiKey = "mmhfdzb5evj2";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0Rhc2hfUmVuZGFyIiwidXNlcl9pZCI6IkRhc2hfUmVuZGFyIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NTIxNzE0NzgsImV4cCI6MTc1Mjc3NjI3OH0.aSQ5agA9RYH13wscAuRCsT18fEXrTYe7gzICMI2v-vA";

  const client = StreamVideoClient.getOrCreateInstance({
    apiKey,
    user,
    token,
    options: {
      maxConnectUserRetries: 3,
      onConnectUserError: (err: Error, allErrors: Error[]) => {
        console.error("Failed to connect user", err, allErrors);
      },
    },
  });
  console.log("client", client);

  if (!client)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />;
      </div>
    );
  return <StreamVideo client={client}>{children}</StreamVideo>;
};
