import { SimplifiedPlayList } from "@/interfaces/playlists";
import { useLogger } from "./useLogger";
import { CustomPlaylist } from "@/interfaces/tracks";
import { useDb } from "./useDb";

export default function useGraphUtils() {
  const { addLog, logWarn } = useLogger();
  const { getPlaylists } = useDb();

  const formatSnapshot = (snap: string) => snap.slice(0, 6) + "..." + snap.slice(-6);

  const checkStatus = async (
    playlist: SimplifiedPlayList,
    dbResponse?: CustomPlaylist[]
  ) => {
    if (!dbResponse) {
      addLog(`Checking status of ${playlist.name}`, "checkStatus");
      dbResponse = await getPlaylists();
    }
    const online: CustomPlaylist = {
      name: playlist.name,
      id: playlist.id,
      snapshot: playlist.snapshot_id,
    };

    const index = dbResponse.findIndex((local) => local.id === online.id);
    if (index >= 0) {
      const local = dbResponse[index];
      if (local.snapshot != online.snapshot) {
        logWarn(
          `${online.name} is out of date! ${local.snapshot} vs ${online.snapshot}`,
          "checkStatus"
        );
        return "unsynced";
      } else {
        const onlineSnapshot = formatSnapshot(online.snapshot);
        const localSnapshot = formatSnapshot(local.snapshot);
        addLog(
          `${online.name} is synced (${onlineSnapshot} == ${localSnapshot})`,
          "checkStatus"
        );
        return "synced";
      }
    } else {
      return "online";
    }
  };

  return {
    checkStatus,
  };
}
