export interface PlaybackStateResponse {
  device: {
    id: string;
    is_active: boolean;
    is_private_session: boolean;
    is_restricted: boolean;
    name: string;
    type: string;
    volume_percent: number;
    supports_volume: boolean;
  };
  repeat_state: "off" | "track" | "context";
  shuffle_state: boolean;
  context: ContextObject | null;
  timestamp: number;
  progress_ms: number | null;
  is_playing: boolean;
  item: TrackObject | EpisodeObject;
  currently_playing_type: "track" | "episode" | "ad" | "unknown";
  actions: {
    disallows: {
      pausing: boolean;
      toggling_repeat_context: boolean;
      toggling_repeat_track: boolean;
      toggling_shuffle: boolean;
    };
  };
  smart_shuffle: boolean;
}

interface ContextObject {
  // Define the structure of Context Object here
}

interface TrackObject {
  // Define the structure of Track Object here
  name: string;
  artists: [
    {
      name: string;
    }
  ];
}

interface EpisodeObject {
  // Define the structure of Episode Object here
  name: string;
  artists: [
    {
      name: string;
    }
  ];
}
