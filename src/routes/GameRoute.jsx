import { shouldUsePhoneOnlyScene } from "../screens/game/deviceProfile";
import { GameSceneScreen } from "../screens/game/GameSceneScreen";
import { MobilePhoneScreen } from "../screens/game/MobilePhoneScreen";

export function GameRoute() {
  if (shouldUsePhoneOnlyScene()) {
    return <MobilePhoneScreen />;
  }

  return <GameSceneScreen />;
}
